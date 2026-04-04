import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  auth,
  db,
} from "../firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";

const GEMINI_KEY = import.meta.env.GEMINI_API_KEY || "AIzaSyDjgJWTVkm98ZOBCervhEtRi6GeZtjPFX8";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

const callGemini = async (prompt) => {
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  const data = await res.json();
  if (data?.error) throw new Error(data.error.message);
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No output generated.";
};

const GEN_CARDS = [
  {
    id: "roadmap",
    title: "Project Roadmap",
    subtitle: "Strategic milestones & phases",
    color: "#2563eb",
    prompt: (p) =>
      `Create a detailed project roadmap for: ${JSON.stringify(p)}. Include phases, timelines, and deliverables.`,
  },
  {
    id: "prd",
    title: "PRD Document",
    subtitle: "Product requirements spec",
    color: "#0891b2",
    prompt: (p) =>
      `Write a comprehensive Product Requirements Document for: ${JSON.stringify(p)}.`,
  },
  {
    id: "folder",
    title: "Folder Structure",
    subtitle: "Project scaffolding tree",
    color: "#7c3aed",
    prompt: (p) =>
      `Generate a folder structure for: ${JSON.stringify(p)}. Format as ASCII tree.`,
  },
  {
    id: "architecture",
    title: "Tech Architecture",
    subtitle: "System design blueprint",
    color: "#059669",
    prompt: (p) =>
      `Design technical architecture for: ${JSON.stringify(p)}. Include stack and data flow.`,
  },
  {
    id: "tasks",
    title: "Task Breakdown",
    subtitle: "Actionable sprint items",
    color: "#d97706",
    prompt: (p) =>
      `Break this project into detailed sprint tasks for: ${JSON.stringify(p)}.`,
  },
];

const NAV_ITEMS = [
  { id: "ai",      label: "AI Workspace",    icon: "◈" },
  { id: "editor",  label: "Code Editor",     icon: "⌨" },
  { id: "files",   label: "Project Files",   icon: "◫" },
  { id: "commits", label: "Commit Messages", icon: "⎇" },
  // { id: "status",  label: "Status",          icon: "◉" },
];

export default function GenerateProject() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("ai");
  const [activeCard, setActiveCard] = useState("roadmap");

  const [aiOutputs, setAiOutputs] = useState({});
  const [generating, setGenerating] = useState({});
  const [genError, setGenError] = useState({});
  const [activity, setActivity] = useState([]);

  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);

  const [editorContent, setEditorContent] = useState("");
  const [editorFilename, setEditorFilename] = useState("untitled.js");
  const [editorSaving, setEditorSaving] = useState(false);

  const [commits, setCommits] = useState([]);
  const [commitMessage, setCommitMessage] = useState("");
  const [committingFile, setCommittingFile] = useState(null);
  const [showCommitPrompt, setShowCommitPrompt] = useState(null);

  const [statusSuggestion, setStatusSuggestion] = useState("");
  const [loadingStatus, setLoadingStatus] = useState(false);

  const [theme, setTheme] = useState("day");
  const [streak, setStreak] = useState(0);
  const [currentStatus, setCurrentStatus] = useState("");
  const [statusDoneBy, setStatusDoneBy] = useState("");
  const [statusTimestamp, setStatusTimestamp] = useState(null);
  const [statusHistory, setStatusHistory] = useState([]);
  const [showStatusHistory, setShowStatusHistory] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  const themes = {
    day: {
      bg: "#ffffff",
      cardBg: "#f8fafc",
      text: "#1e293b",
      subtext: "#64748b",
      border: "#e2e8f0",
      accent: "#2563eb",
      navBg: "#f1f5f9",
      editorBg: "#f8fafc",
      movingBorder: false,
    },
    night: {
      bg: "#0f172a",
      cardBg: "#1e293b",
      text: "#e2e8f0",
      subtext: "#94a3b8",
      border: "#334155",
      accent: "#3b82f6",
      navBg: "#0f172a",
      editorBg: "#0d1117",
      movingBorder: true,
    },
    hacker: {
      bg: "#000000",
      cardBg: "#0a0e0a",
      text: "#00ff41",
      subtext: "#00cc33",
      border: "#003300",
      accent: "#00ff41",
      navBg: "#000000",
      editorBg: "#020802",
      movingBorder: true,
    },
  };

  const currentTheme = themes[theme];
  const isNightOrHacker = theme === "night" || theme === "hacker";

  const calculateStreak = () => {
    if (activity.length === 0) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activityDates = new Set();
    activity.forEach((log) => {
      const logDate = log.createdAt?.toDate
        ? log.createdAt.toDate()
        : new Date(log.createdAt?.seconds * 1000);
      logDate.setHours(0, 0, 0, 0);
      activityDates.add(logDate.getTime());
    });
    const sortedDates = Array.from(activityDates).sort((a, b) => b - a);
    let count = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      if (sortedDates[i] === expectedDate.getTime()) count++;
      else break;
    }
    return count;
  };

  const getFileIcon = (filename) => {
    const ext = filename?.split(".").pop()?.toLowerCase();
    const icons = {
      js: "⚡", jsx: "⚛", ts: "📘", tsx: "📘",
      py: "🐍", json: "📋", css: "🎨", html: "📄",
      md: "📝", sql: "🗄",
    };
    return icons[ext] || "📄";
  };

  const getFileColor = (filename) => {
    const ext = filename?.split(".").pop()?.toLowerCase();
    const colors = {
      js: "#f7df1e", jsx: "#61dafb", ts: "#3178c6", tsx: "#3178c6",
      py: "#3776ab", json: "#8bc34a", css: "#264de4", html: "#e44d26",
      md: "#083fa1", sql: "#336791",
    };
    return colors[ext] || currentTheme.accent;
  };

  const getRelativeTime = (timestamp) => {
    if (!timestamp) return "—";
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const mins = Math.floor(diffMs / 60000);
    const hrs = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const logActivity = async (label) => {
    if (!user) return;
    const entry = { label, createdAt: serverTimestamp() };
    await addDoc(collection(db, "users", user.uid, "projects", id, "logs"), entry);
    const newActivity = { id: Math.random(), label, createdAt: { seconds: Date.now() / 1000 } };
    setActivity((prev) => [newActivity, ...prev]);
    setStreak(calculateStreak());
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) { navigate("/"); return; }
      setUser(u);
      const pSnap = await getDoc(doc(db, "users", u.uid, "projects", id));
      if (!pSnap.exists()) { navigate("/"); return; }
      setProject(pSnap.data());
      const fSnap = await getDocs(collection(db, "users", u.uid, "projects", id, "files"));
      setFiles(fSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      const cmSnap = await getDocs(collection(db, "users", u.uid, "projects", id, "commits"));
      setCommits(cmSnap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
      const logSnap = await getDocs(collection(db, "users", u.uid, "projects", id, "logs"));
      const logs = logSnap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setActivity(logs);
      setStreak(calculateStreak());
      const statusSnap = await getDocs(collection(db, "users", u.uid, "projects", id, "status"));
      if (statusSnap.docs.length > 0) {
        const statuses = statusSnap.docs.map((d) => ({ ...d.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setStatusHistory(statuses);
        setCurrentStatus(statuses[0]?.text || "");
        setStatusDoneBy(statuses[0]?.doneBy || "");
        setStatusTimestamp(statuses[0]?.createdAt);
      }
      const teamSnap = await getDocs(collection(db, "users", u.uid, "projects", id, "team"));
      setTeamMembers(teamSnap.docs.map((d) => d.data()));
      setLoading(false);
    });
    return unsub;
  }, [id, navigate]);

  const saveEditorFile = async () => {
    if (!user || !editorFilename.trim()) return;
    setShowCommitPrompt(editorFilename);
  };

  const saveWithCommit = async () => {
    if (!user || !editorFilename.trim() || !commitMessage.trim()) return;
    setEditorSaving(true);
    try {
      const meta = { content: editorContent, lastUpdated: serverTimestamp(), updatedBy: user.uid, filename: editorFilename };
      await setDoc(doc(db, "users", user.uid, "projects", id, "files", editorFilename), meta, { merge: true });
      setFiles((prev) => {
        const exists = prev.find((f) => f.id === editorFilename);
        return exists
          ? prev.map((f) => f.id === editorFilename ? { ...f, ...meta, lastUpdated: { seconds: Date.now() / 1000 } } : f)
          : [...prev, { id: editorFilename, ...meta, lastUpdated: { seconds: Date.now() / 1000 } }];
      });
      await logActivity(`${editorFilename} "${commitMessage}" ${new Date().toLocaleTimeString()}`);
      await commitFile(editorFilename);
      setShowCommitPrompt(null);
      setCommitMessage("");
    } catch (e) { console.error("Error saving file:", e); }
    setEditorSaving(false);
  };

  const commitFile = async (filename) => {
    if (!user) return;
    setCommittingFile(filename);
    try {
      const cmtEntry = { filename, message: commitMessage, createdAt: serverTimestamp(), authorId: user.uid };
      await addDoc(collection(db, "users", user.uid, "projects", id, "commits"), cmtEntry);
      setCommits((prev) => [{ id: Math.random(), ...cmtEntry, createdAt: { seconds: Date.now() / 1000 } }, ...prev]);
      setCommitMessage("");
    } catch (e) { console.error("Error committing:", e); }
    setCommittingFile(null);
  };

  const deleteFile = async (filename) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "projects", id, "files", filename));
      setFiles((prev) => prev.filter((f) => f.id !== filename));
      await logActivity(`${filename} deleted ${new Date().toLocaleString()}`);
      setDeleteConfirm(null);
    } catch (e) { console.error("Error deleting file:", e); }
  };

  const openInEditor = (f) => {
    setEditorFilename(f.filename || f.id);
    setEditorContent(f.content || "");
    setTab("editor");
  };

  const handleGenerateClick = async (cardId) => {
    if (!project || generating[cardId]) return;
    setGenerating((prev) => ({ ...prev, [cardId]: true }));
    setGenError((prev) => ({ ...prev, [cardId]: null }));
    try {
      const card = GEN_CARDS.find((c) => c.id === cardId);
      const output = await callGemini(card.prompt(project));
      setAiOutputs((prev) => ({ ...prev, [cardId]: output }));
      await logActivity(`Generated: ${card.title}`);
    } catch (err) {
      setGenError((prev) => ({ ...prev, [cardId]: err.message }));
    }
    setGenerating((prev) => ({ ...prev, [cardId]: false }));
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: currentTheme.bg, color: currentTheme.text, fontFamily: "'JetBrains Mono', monospace" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 24, marginBottom: 12, animation: "spin 1.2s linear infinite", display: "inline-block" }}>◈</div>
          <div style={{ fontSize: 13, color: currentTheme.subtext, letterSpacing: "0.1em" }}>LOADING PROJECT...</div>
        </div>
      </div>
    );
  }

  if (!project) return <div>Project not found</div>;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: currentTheme.bg, fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>

      {/* ─── Left Sidebar ─── */}
      <aside style={{
        width: 240,
        background: currentTheme.navBg,
        borderRight: `1px solid ${currentTheme.border}`,
        display: "flex",
        flexDirection: "column",
        padding: "0",
        flexShrink: 0,
      }}>
        {/* Brand block */}
        <div style={{
          padding: "22px 20px 18px",
          borderBottom: `1px solid ${currentTheme.border}`,
          background: isNightOrHacker ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em", color: currentTheme.accent, marginBottom: 10, opacity: 0.8 }}>
            ◈ DevSpace
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: currentTheme.text, lineHeight: 1.3, marginBottom: 4 }}>
            {project.title}
          </div>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            fontSize: 10,
            color: currentTheme.accent,
            background: currentTheme.accent + "15",
            padding: "3px 8px",
            borderRadius: 3,
            letterSpacing: "0.05em",
            marginTop: 2,
          }}>
            <span style={{ opacity: 0.7 }}>⬡</span> {project.stack}
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ padding: "12px 10px", flex: 1 }}>
          {NAV_ITEMS.map((item, i) => {
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  marginBottom: 3,
                  borderRadius: 6,
                  cursor: "pointer",
                  border: isActive ? `1px solid ${currentTheme.accent}40` : "1px solid transparent",
                  background: isActive
                    ? currentTheme.accent + (theme === "hacker" ? "22" : "18")
                    : "transparent",
                  color: isActive ? currentTheme.accent : currentTheme.subtext,
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 500,
                  textAlign: "left",
                  transition: "all 0.18s ease",
                  letterSpacing: "0.02em",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {isActive && (
                  <span style={{
                    position: "absolute",
                    left: 0, top: 0, bottom: 0,
                    width: 3,
                    background: currentTheme.accent,
                    borderRadius: "0 2px 2px 0",
                  }} />
                )}
                <span style={{ fontSize: 14, opacity: isActive ? 1 : 0.6, minWidth: 18, textAlign: "center" }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom theme switcher */}
        <div style={{ padding: "12px 10px", borderTop: `1px solid ${currentTheme.border}` }}>
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", color: currentTheme.subtext, marginBottom: 6, paddingLeft: 4 }}>
            Appearance
          </div>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 10px",
              borderRadius: 5,
              border: `1px solid ${currentTheme.border}`,
              background: currentTheme.bg,
              color: currentTheme.text,
              fontSize: 11,
              cursor: "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.03em",
            }}
          >
            <option value="day">☀ Day Theme</option>
            <option value="night">◑ Night Theme</option>
            <option value="hacker">▓ Hacker's Theme</option>
          </select>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <header style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 28px",
          borderBottom: `1px solid ${currentTheme.border}`,
          background: currentTheme.cardBg,
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <span style={{ color: currentTheme.subtext, opacity: 0.7 }}>projects</span>
            <span style={{ color: currentTheme.subtext, opacity: 0.4 }}>/</span>
            <span style={{ color: currentTheme.accent, fontWeight: 700 }}>{project.title}</span>
            <span style={{ color: currentTheme.subtext, opacity: 0.4 }}>/</span>
            <span style={{ color: currentTheme.subtext }}>
              {NAV_ITEMS.find(n => n.id === tab)?.label}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 12px",
              background: currentTheme.bg,
              border: `1px solid ${currentTheme.border}`,
              borderRadius: 20,
              fontSize: 11,
            }}>
              <span>🔥</span>
              <span style={{ fontWeight: 700, color: currentTheme.accent }}>{streak}</span>
              <span style={{ color: currentTheme.subtext }}>day streak</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "28px", background: currentTheme.bg }}>

          {/* ══ AI Workspace ══ */}
          {tab === "ai" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ color: currentTheme.subtext, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", margin: 0 }}>
                  Generation Suite
                </h2>
              </div>

              {currentStatus && (
                <div style={{ background: currentTheme.cardBg, border: `1px solid ${currentTheme.border}`, borderRadius: 8, padding: "14px 16px", marginBottom: 24 }}>
                  <div style={{ fontSize: 10, color: currentTheme.subtext, marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>Current Status</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <div style={{ color: currentTheme.text, fontSize: 13, fontWeight: 500 }}>{currentStatus}</div>
                    <div style={{ fontSize: 10, color: currentTheme.subtext, whiteSpace: "nowrap" }}>{getRelativeTime(statusTimestamp)}</div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
                {GEN_CARDS.map((c) => {
                  const isAct = activeCard === c.id;
                  const done = !!aiOutputs[c.id];
                  const busy = generating[c.id];
                  return (
                    <div key={c.id} onClick={() => setActiveCard(c.id)} style={{
                      flex: 1, minWidth: 150,
                      padding: "14px 12px",
                      borderRadius: 8,
                      cursor: "pointer",
                      border: `2px solid ${isAct ? c.color : currentTheme.border}`,
                      background: isAct ? c.color + "10" : currentTheme.bg,
                      transition: "all 0.2s ease",
                      position: "relative",
                      boxShadow: isAct ? `0 0 16px ${c.color}25` : "none",
                    }}>
                      {done && <span style={{ position: "absolute", top: 10, right: 10, width: 7, height: 7, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />}
                      {busy && <span style={{ position: "absolute", top: 10, right: 10, width: 11, height: 11, border: `2px solid ${c.color}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />}
                      <div style={{ fontSize: 16, marginBottom: 8, color: isAct ? c.color : currentTheme.subtext }}>{["⬡", "◈", "◫", "◎", "◧"][GEN_CARDS.indexOf(c)]}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: isAct ? c.color : currentTheme.subtext, marginBottom: 3, letterSpacing: "0.03em" }}>{c.title}</div>
                      <div style={{ fontSize: 10, color: currentTheme.subtext }}>{c.subtitle}</div>
                    </div>
                  );
                })}
              </div>

              <div style={{
                background: currentTheme.bg,
                border: `2px solid ${GEN_CARDS.find((c) => c.id === activeCard).color}30`,
                borderRadius: 12,
                overflow: "hidden",
                marginBottom: 24,
              }}>
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "14px 20px",
                  borderBottom: `1px solid ${GEN_CARDS.find((c) => c.id === activeCard).color}20`,
                  background: `${GEN_CARDS.find((c) => c.id === activeCard).color}06`,
                }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: currentTheme.text, margin: 0, letterSpacing: "0.02em" }}>
                    {GEN_CARDS.find((c) => c.id === activeCard).title}
                  </h3>
                  <button
                    onClick={() => handleGenerateClick(activeCard)}
                    disabled={generating[activeCard]}
                    style={{
                      background: generating[activeCard] ? "#cbd5e1" : "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      padding: "7px 16px",
                      borderRadius: 5,
                      cursor: generating[activeCard] ? "not-allowed" : "pointer",
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: "inherit",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {generating[activeCard] ? "GENERATING..." : "GENERATE"}
                  </button>
                </div>
                <div style={{ padding: "16px 20px", minHeight: 300, maxHeight: 500, overflow: "auto", fontSize: 12, lineHeight: 1.7, color: currentTheme.text, whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                  {genError[activeCard] ? (
                    <span style={{ color: "#dc2626" }}>Error: {genError[activeCard]}</span>
                  ) : aiOutputs[activeCard] ? aiOutputs[activeCard] : (
                    <span style={{ color: currentTheme.subtext }}>Click "Generate" to create content for this section</span>
                  )}
                </div>
              </div>

              {activity.length > 0 && (
                <div style={{ marginTop: 28, paddingTop: 22, borderTop: `1px solid ${currentTheme.border}` }}>
                  <h3 style={{ color: currentTheme.subtext, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 12 }}>
                    Recent Activity
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {activity.slice(0, 5).map((a) => (
                      <div key={a.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: currentTheme.subtext, padding: "8px 10px", background: currentTheme.cardBg, borderRadius: 4, border: `1px solid ${currentTheme.border}` }}>
                        <span style={{ color: currentTheme.text }}>{a.label}</span>
                        <span>{getRelativeTime(a.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══ Code Editor ══ */}
          {tab === "editor" && (
            <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)", gap: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ color: currentTheme.subtext, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", margin: 0 }}>
                  Code Editor
                </h2>
              </div>

              {/* Toolbar */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 0,
                background: currentTheme.cardBg,
                border: `1px solid ${currentTheme.border}`,
                borderBottom: "none",
                borderRadius: "8px 8px 0 0",
                padding: "8px 12px",
                justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                  <span style={{ fontSize: 14 }}>{getFileIcon(editorFilename)}</span>
                  <input
                    type="text"
                    placeholder="filename.js"
                    value={editorFilename}
                    onChange={(e) => setEditorFilename(e.target.value)}
                    style={{
                      flex: 1,
                      maxWidth: 280,
                      padding: "6px 10px",
                      borderRadius: 4,
                      border: `1px solid ${currentTheme.border}`,
                      background: currentTheme.bg,
                      color: currentTheme.text,
                      fontSize: 12,
                      fontFamily: "inherit",
                      letterSpacing: "0.03em",
                    }}
                  />
                  <div style={{
                    fontSize: 10,
                    color: currentTheme.subtext,
                    padding: "4px 8px",
                    background: currentTheme.bg,
                    border: `1px solid ${currentTheme.border}`,
                    borderRadius: 3,
                    letterSpacing: "0.04em",
                  }}>
                    {editorContent.split('\n').length} lines
                  </div>
                </div>
                <button
                  onClick={saveEditorFile}
                  disabled={editorSaving}
                  style={{
                    background: editorSaving ? "#cbd5e1" : currentTheme.accent,
                    color: "#ffffff",
                    border: "none",
                    padding: "7px 18px",
                    borderRadius: 5,
                    cursor: editorSaving ? "not-allowed" : "pointer",
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: "inherit",
                    letterSpacing: "0.06em",
                    transition: "all 0.2s",
                  }}
                >
                  {editorSaving ? "SAVING..." : "⎇ SAVE & COMMIT"}
                </button>
              </div>

              {/* Editor with moving border for night/hacker */}
              <div style={{
                flex: 1,
                position: "relative",
                borderRadius: "0 0 8px 8px",
                overflow: "hidden",
                ...(isNightOrHacker ? { padding: 2 } : {}),
                background: isNightOrHacker ? "transparent" : "none",
              }}>
                {isNightOrHacker && (
                  <div style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "0 0 8px 8px",
                    background: theme === "hacker"
                      ? "linear-gradient(90deg, #00ff41, #00cc33, #00ff88, #00ffcc, #00ff41)"
                      : "linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4, #6366f1, #3b82f6)",
                    backgroundSize: "300% 100%",
                    animation: "borderMove 3s linear infinite",
                    zIndex: 0,
                  }} />
                )}
                <textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  placeholder={"// Start writing your code here...\n// Your imagination is the only limit.\n"}
                  spellCheck={false}
                  style={{
                    position: isNightOrHacker ? "absolute" : "relative",
                    inset: isNightOrHacker ? 2 : "auto",
                    width: isNightOrHacker ? "calc(100% - 4px)" : "100%",
                    height: isNightOrHacker ? "calc(100% - 4px)" : "100%",
                    padding: "20px 22px",
                    borderRadius: isNightOrHacker ? "0 0 7px 7px" : "0 0 8px 8px",
                    border: isNightOrHacker ? "none" : `1px solid ${currentTheme.border}`,
                    background: currentTheme.editorBg,
                    color: currentTheme.text,
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                    lineHeight: 1.75,
                    resize: "none",
                    outline: "none",
                    zIndex: 1,
                    letterSpacing: "0.02em",
                    caretColor: currentTheme.accent,
                  }}
                />
              </div>
            </div>
          )}

          {/* ══ Project Files ══ */}
          {tab === "files" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ color: currentTheme.subtext, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", margin: 0 }}>
                  Project Files
                </h2>
                <div style={{ fontSize: 11, color: currentTheme.subtext }}>
                  {files.length} file{files.length !== 1 ? "s" : ""}
                </div>
              </div>

              {/* Upload Area */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); }}
                style={{
                  border: `2px dashed ${dragging ? currentTheme.accent : currentTheme.border}`,
                  borderRadius: 10,
                  padding: "28px",
                  textAlign: "center",
                  marginBottom: 24,
                  background: dragging ? currentTheme.accent + "08" : isNightOrHacker ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8, opacity: 0.4 }}>◫</div>
                <div style={{ color: currentTheme.subtext, fontSize: 12, letterSpacing: "0.03em" }}>
                  Drag files here or <span style={{ color: currentTheme.accent, cursor: "pointer", textDecoration: "underline" }}>click to upload</span>
                </div>
                <input type="file" multiple onChange={(e) => { if (!e.target.files) return; }} style={{ display: "none" }} />
              </div>

              {/* Files Grid */}
              {files.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "48px 24px",
                  color: currentTheme.subtext,
                  fontSize: 12,
                  border: `1px dashed ${currentTheme.border}`,
                  borderRadius: 8,
                }}>
                  <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>◫</div>
                  <div>No files yet. Start by creating one in the Code Editor.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {files.map((f) => {
                    const fname = f.filename || f.id;
                    const ext = fname.split(".").pop()?.toLowerCase();
                    const fileColor = getFileColor(fname);
                    return (
                      <div key={f.id} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0,
                        background: currentTheme.cardBg,
                        border: `1px solid ${currentTheme.border}`,
                        borderRadius: 8,
                        overflow: "hidden",
                        transition: "all 0.15s ease",
                      }}>
                        {/* Color tag */}
                        <div style={{
                          width: 4,
                          alignSelf: "stretch",
                          background: fileColor,
                          flexShrink: 0,
                        }} />

                        {/* Icon + Info */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, padding: "12px 16px" }}>
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: 6,
                            background: fileColor + "18",
                            border: `1px solid ${fileColor}30`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                            flexShrink: 0,
                          }}>
                            {getFileIcon(fname)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: currentTheme.text, letterSpacing: "0.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {fname}
                            </div>
                            <div style={{ fontSize: 10, color: currentTheme.subtext, marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ color: fileColor, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>.{ext}</span>
                              <span style={{ opacity: 0.4 }}>·</span>
                              <span>Updated {getRelativeTime(f.lastUpdated)}</span>
                              {f.content && (
                                <>
                                  <span style={{ opacity: 0.4 }}>·</span>
                                  <span>{f.content.split('\n').length} lines</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 14px", flexShrink: 0 }}>
                          <button
                            onClick={() => openInEditor(f)}
                            style={{
                              display: "flex", alignItems: "center", gap: 5,
                              background: "transparent",
                              border: `1px solid ${currentTheme.accent}50`,
                              color: currentTheme.accent,
                              padding: "5px 12px",
                              borderRadius: 4,
                              cursor: "pointer",
                              fontSize: 11,
                              fontWeight: 600,
                              fontFamily: "inherit",
                              letterSpacing: "0.04em",
                              transition: "all 0.15s",
                            }}
                          >
                            ✎ Edit
                          </button>
                          <button
                            onClick={() => {
                              const element = document.createElement("a");
                              const file = new Blob([f.content || ""], { type: "text/plain" });
                              element.href = URL.createObjectURL(file);
                              element.download = fname;
                              document.body.appendChild(element);
                              element.click();
                              document.body.removeChild(element);
                              logActivity(`${fname} downloaded`);
                            }}
                            style={{
                              display: "flex", alignItems: "center", gap: 5,
                              background: "transparent",
                              border: `1px solid #10b98150`,
                              color: "#10b981",
                              padding: "5px 12px",
                              borderRadius: 4,
                              cursor: "pointer",
                              fontSize: 11,
                              fontWeight: 600,
                              fontFamily: "inherit",
                              letterSpacing: "0.04em",
                              transition: "all 0.15s",
                            }}
                          >
                            ↓ DL
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(f.id)}
                            style={{
                              display: "flex", alignItems: "center", gap: 5,
                              background: "transparent",
                              border: `1px solid #ef444450`,
                              color: "#ef4444",
                              padding: "5px 12px",
                              borderRadius: 4,
                              cursor: "pointer",
                              fontSize: 11,
                              fontWeight: 600,
                              fontFamily: "inherit",
                              letterSpacing: "0.04em",
                              transition: "all 0.15s",
                            }}
                          >
                            ✕ Del
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══ Commits ══ */}
          {tab === "commits" && (
            <div>
              <h2 style={{ color: currentTheme.subtext, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 16 }}>
                Commit History
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 0, borderLeft: `2px solid ${currentTheme.border}`, marginLeft: 8 }}>
                {commits.length > 0 ? (
                  commits.map((c, i) => (
                    <div key={c.id} style={{ position: "relative", paddingLeft: 24, paddingBottom: 16 }}>
                      <div style={{
                        position: "absolute",
                        left: -7,
                        top: 14,
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: i === 0 ? currentTheme.accent : currentTheme.border,
                        border: `2px solid ${currentTheme.bg}`,
                        boxShadow: i === 0 ? `0 0 8px ${currentTheme.accent}` : "none",
                      }} />
                      <div style={{
                        padding: "12px 14px",
                        background: currentTheme.cardBg,
                        border: `1px solid ${currentTheme.border}`,
                        borderRadius: 6,
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 13 }}>{getFileIcon(c.filename)}</span>
                            <div style={{ fontSize: 12, fontWeight: 700, color: currentTheme.text, letterSpacing: "0.02em" }}>{c.filename}</div>
                          </div>
                          <span style={{ fontSize: 10, color: currentTheme.subtext, background: currentTheme.bg, border: `1px solid ${currentTheme.border}`, padding: "2px 6px", borderRadius: 3 }}>
                            {getRelativeTime(c.createdAt)}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: currentTheme.subtext, letterSpacing: "0.02em" }}>
                          ⎇ {c.message}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ paddingLeft: 24, color: currentTheme.subtext, fontSize: 12 }}>No commits yet</div>
                )}
              </div>
            </div>
          )}

          {/* ══ Status ══ */}
          {tab === "status" && (
            <div>
              <h2 style={{ color: currentTheme.subtext, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 24 }}>
                Project Status
              </h2>
              <div style={{ background: currentTheme.cardBg, border: `1px solid ${currentTheme.border}`, borderRadius: 8, padding: "20px", marginBottom: 24 }}>
                <label style={{ display: "block", marginBottom: 10, color: currentTheme.text, fontWeight: 700, fontSize: 12, letterSpacing: "0.04em" }}>
                  Status Update
                </label>
                <textarea
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value)}
                  placeholder="Enter project status..."
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 6,
                    border: `1px solid ${currentTheme.border}`,
                    background: currentTheme.bg,
                    color: currentTheme.text,
                    fontSize: 12,
                    fontFamily: "inherit",
                    minHeight: 120,
                    marginBottom: 16,
                    resize: "vertical",
                    outline: "none",
                    lineHeight: 1.6,
                  }}
                />
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", marginBottom: 8, color: currentTheme.text, fontWeight: 700, fontSize: 12, letterSpacing: "0.04em" }}>
                    Done By
                  </label>
                  <select
                    value={statusDoneBy}
                    onChange={(e) => setStatusDoneBy(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: 6,
                      border: `1px solid ${currentTheme.border}`,
                      background: currentTheme.bg,
                      color: currentTheme.text,
                      fontSize: 12,
                      fontFamily: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    <option value="">Select owner</option>
                    {teamMembers.map((member) => (
                      <option key={member.uid} value={member.fullName}>{member.fullName}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={async () => {
                    if (!currentStatus.trim() || !statusDoneBy.trim()) return;
                    const statusEntry = { text: currentStatus, doneBy: statusDoneBy, createdAt: serverTimestamp() };
                    await addDoc(collection(db, "users", user.uid, "projects", id, "status"), statusEntry);
                    const now = new Date();
                    setStatusHistory([{ ...statusEntry, createdAt: { seconds: now.getTime() / 1000 } }, ...statusHistory]);
                    setStatusTimestamp({ seconds: now.getTime() / 1000 });
                    await logActivity(`Status updated: "${currentStatus.substring(0, 30)}..."`);
                  }}
                  style={{
                    background: currentTheme.accent,
                    color: "#ffffff",
                    border: "none",
                    padding: "9px 20px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 11,
                    fontFamily: "inherit",
                    letterSpacing: "0.06em",
                    transition: "all 0.2s",
                  }}
                >
                  ◉ UPDATE STATUS
                </button>
              </div>

              {statusHistory.length > 0 && (
                <div style={{ background: currentTheme.cardBg, border: `1px solid ${currentTheme.border}`, borderRadius: 8, padding: "20px" }}>
                  <button
                    onClick={() => setShowStatusHistory(!showStatusHistory)}
                    style={{
                      background: "transparent",
                      color: currentTheme.accent,
                      border: `1px solid ${currentTheme.accent}`,
                      padding: "8px 16px",
                      borderRadius: 5,
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 11,
                      fontFamily: "inherit",
                      marginBottom: 16,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {showStatusHistory ? "▲ Hide History" : "▼ Show Previous Status"}
                  </button>
                  {showStatusHistory && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {statusHistory.map((status, idx) => (
                        <div key={idx} style={{ background: currentTheme.bg, border: `1px solid ${currentTheme.border}`, borderRadius: 6, padding: "12px 14px", fontSize: 12 }}>
                          <div style={{ color: currentTheme.text, marginBottom: 6, lineHeight: 1.5 }}>{status.text}</div>
                          <div style={{ color: currentTheme.subtext, fontSize: 10, letterSpacing: "0.04em" }}>
                            By {status.doneBy} · {getRelativeTime(status.createdAt)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ══ Commit Modal ══ */}
      {showCommitPrompt && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(2px)" }}>
          <div style={{ background: currentTheme.cardBg, borderRadius: 10, padding: "28px", maxWidth: 420, width: "90%", boxShadow: "0 24px 48px rgba(0,0,0,0.25)", border: `1px solid ${currentTheme.border}` }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: currentTheme.accent, marginBottom: 12, fontWeight: 700 }}>⎇ Commit</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: currentTheme.text, marginBottom: 6 }}>Commit Message Required</h3>
            <p style={{ color: currentTheme.subtext, fontSize: 12, marginBottom: 18, lineHeight: 1.5 }}>Enter a commit message for <strong style={{ color: currentTheme.text }}>{showCommitPrompt}</strong></p>
            <input
              type="text"
              placeholder="feat: describe your changes..."
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              autoFocus
              style={{
                width: "100%",
                padding: "10px 12px",
                border: `1px solid ${currentTheme.border}`,
                borderRadius: 6,
                fontSize: 12,
                marginBottom: 18,
                boxSizing: "border-box",
                fontFamily: "inherit",
                background: currentTheme.bg,
                color: currentTheme.text,
                outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => { setShowCommitPrompt(null); setCommitMessage(""); }}
                style={{ background: "transparent", border: `1px solid ${currentTheme.border}`, color: currentTheme.text, padding: "8px 16px", borderRadius: 5, cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "inherit" }}
              >
                Cancel
              </button>
              <button
                onClick={saveWithCommit}
                disabled={!commitMessage.trim() || editorSaving}
                style={{
                  background: !commitMessage.trim() || editorSaving ? "#94a3b8" : "#2563eb",
                  border: "none",
                  color: "#ffffff",
                  padding: "8px 20px",
                  borderRadius: 5,
                  cursor: !commitMessage.trim() || editorSaving ? "not-allowed" : "pointer",
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  letterSpacing: "0.05em",
                }}
              >
                {editorSaving ? "SAVING..." : "⎇ COMMIT & SAVE"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Delete Modal ══ */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(2px)" }}>
          <div style={{ background: currentTheme.cardBg, borderRadius: 10, padding: "28px", maxWidth: 400, width: "90%", boxShadow: "0 24px 48px rgba(0,0,0,0.25)", border: `1px solid ${currentTheme.border}` }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em", color: "#ef4444", marginBottom: 12, fontWeight: 700 }}>⚠ Destructive Action</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#ef4444", marginBottom: 10 }}>Delete File?</h3>
            <p style={{ color: currentTheme.text, fontSize: 12, marginBottom: 22, lineHeight: 1.6 }}>
              Are you sure you want to delete <strong>{deleteConfirm}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{ background: "transparent", border: `1px solid ${currentTheme.border}`, color: currentTheme.text, padding: "8px 16px", borderRadius: 5, cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "inherit" }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteFile(deleteConfirm)}
                style={{ background: "#ef4444", border: "none", color: "#ffffff", padding: "8px 20px", borderRadius: 5, cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "inherit", letterSpacing: "0.05em" }}
              >
                ✕ DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes borderMove {
          0%   { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }

        * { box-sizing: border-box; }

        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${currentTheme.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${currentTheme.subtext}; }

        textarea:focus, input:focus { outline: 1px solid ${currentTheme.accent} !important; }
        button:hover { opacity: 0.88; }

        ${theme === "hacker" ? `
          * { text-shadow: 0 0 2px rgba(0,255,65,0.12); }
          textarea, input { text-shadow: none; }
        ` : ""}
      `}</style>
    </div>
  );
}