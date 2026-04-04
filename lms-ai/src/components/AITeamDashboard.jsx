
import { useState, useEffect, useRef, useCallback } from "react";

import { db, auth } from "../firebase/firebase";

import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  getDoc,
  getDocs,
} from "firebase/firestore";

import {
  onAuthStateChanged,
  signOut
} from "firebase/auth";
// ── Theme definitions ─────────────────────────────────────────────────────────
const THEMES = {
  white: {
    name: "white",
    label: "☀ Light",
    bg: "#f4f3ef",
    sidebar: "#ffffff",
    card: "#ffffff",
    border: "#e2e0d8",
    text: "#1a1a1a",
    subtext: "#6b6b6b",
    accent: "#2563eb",
    accentText: "#ffffff",
    input: "#f9f8f5",
    inputBorder: "#d4d2ca",
    hover: "#f0efe9",
    activeTab: "#2563eb",
    activeTabText: "#ffffff",
    tag: "#e8f0fe",
    tagText: "#2563eb",
    onlineDot: "#22c55e",
    codeBg: "#f3f4f6",
    shadow: "0 1px 8px rgba(0,0,0,0.08)",
    msgBubble: "#2563eb",
    msgBubbleText: "#fff",
    msgOther: "#f0efe9",
    msgOtherText: "#1a1a1a",
    commitDot: "#2563eb",
    headerBg: "#ffffff",
    scrollThumb: "#d4d2ca",
    danger: "#ef4444",
    success: "#22c55e",
    warning: "#f59e0b",
  },
  night: {
    name: "night",
    label: "🌙 Night",
    bg: "#0f1117",
    sidebar: "#161b27",
    card: "#1c2232",
    border: "#2a3248",
    text: "#e8eaf0",
    subtext: "#8892a4",
    accent: "#6366f1",
    accentText: "#ffffff",
    input: "#141926",
    inputBorder: "#2a3248",
    hover: "#1e2639",
    activeTab: "#6366f1",
    activeTabText: "#ffffff",
    tag: "#1e2048",
    tagText: "#818cf8",
    onlineDot: "#22c55e",
    codeBg: "#0d1117",
    shadow: "0 2px 16px rgba(0,0,0,0.4)",
    msgBubble: "#6366f1",
    msgBubbleText: "#fff",
    msgOther: "#1e2639",
    msgOtherText: "#e8eaf0",
    commitDot: "#818cf8",
    headerBg: "#161b27",
    scrollThumb: "#2a3248",
    danger: "#f87171",
    success: "#4ade80",
    warning: "#fbbf24",
  },
  hacker: {
    name: "hacker",
    label: "⚡ Hacker",
    bg: "#000000",
    sidebar: "#030a03",
    card: "#050f05",
    border: "#0d3b0d",
    text: "#00ff41",
    subtext: "#1a8c1a",
    accent: "#00ff41",
    accentText: "#000000",
    input: "#020802",
    inputBorder: "#0d3b0d",
    hover: "#081408",
    activeTab: "#00ff41",
    activeTabText: "#000000",
    tag: "#031403",
    tagText: "#00ff41",
    onlineDot: "#00ff41",
    codeBg: "#000000",
    shadow: "0 0 20px rgba(0,255,65,0.15)",
    msgBubble: "#00ff41",
    msgBubbleText: "#000",
    msgOther: "#081408",
    msgOtherText: "#00ff41",
    commitDot: "#00ff41",
    headerBg: "#030a03",
    scrollThumb: "#0d3b0d",
    danger: "#ff4141",
    success: "#00ff41",
    warning: "#ffcc00",
  },
};

// ── Icons (inline SVG components) ────────────────────────────────────────────
const Icon = ({ d, size = 18, color = "currentColor", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  ai: "M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M9 9a1 1 0 1 0 0 2 1 1 0 0 0 0-2m6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2",
  files: "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M13 2v7h7",
  commits: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22",
  chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  voice: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.25h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  send: "M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z",
  plus: "M12 5v14M5 12h14",
  mic: "M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4 M8 23h8",
  micOff: "M1 1l22 22M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6 M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23M12 19v4M8 23h8",
  google: "M21.805 10.023H12v4h5.651c-.537 2.555-2.812 4.5-5.651 4.5-3.314 0-6-2.686-6-6s2.686-6 6-6c1.47 0 2.812.532 3.845 1.405l2.828-2.828C16.957 3.582 14.617 2.5 12 2.5 6.477 2.5 2 6.977 2 12.5s4.477 10 10 10c5.523 0 10-4.477 10-10 0-.665-.068-1.314-.195-1.945z",
  moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  sun: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 6a6 6 0 1 0 0 12A6 6 0 0 0 12 6z",
  terminal: "M4 17l6-6-6-6M12 19h8",
  save: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(ts) {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  const diff = Math.floor((Date.now() - date) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatTime(ts) {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ theme }) {
  const t = THEMES[theme];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: t.bg, fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    }}>
      <div style={{
        background: t.card, border: `1px solid ${t.border}`, borderRadius: 16,
        padding: "48px 40px", maxWidth: 380, width: "90%", textAlign: "center",
        boxShadow: t.shadow,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, background: t.accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <Icon d={icons.zap} size={28} color={t.accentText} />
        </div>
        <h1 style={{ color: t.text, fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>TeamSync</h1>
        <p style={{ color: t.subtext, fontSize: 13, margin: "0 0 32px" }}>
          Realtime collaboration workspace
        </p>
        {error && (
          <div style={{
            background: `${t.danger}22`, border: `1px solid ${t.danger}44`,
            borderRadius: 8, padding: "10px 14px", color: t.danger,
            fontSize: 12, marginBottom: 16,
          }}>{error}</div>
        )}
        <button onClick={handleGoogle} disabled={loading} style={{
          width: "100%", padding: "12px 20px", borderRadius: 10,
          background: loading ? t.hover : t.accent, color: loading ? t.subtext : t.accentText,
          border: `1px solid ${t.border}`, cursor: loading ? "not-allowed" : "pointer",
          fontSize: 14, fontWeight: 600, fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          transition: "opacity 0.2s",
        }}>
          <Icon d={icons.google} size={16} color={loading ? t.subtext : t.accentText} />
          {loading ? "Signing in…" : "Continue with Google"}
        </button>
        <p style={{ color: t.subtext, fontSize: 11, marginTop: 20 }}>
          Sign in to access your team workspace
        </p>
      </div>
    </div>
  );
}

// ── AI Workspace Tab ──────────────────────────────────────────────────────────
function AIWorkspace({ theme, user, teamId }) {
  const t = THEMES[theme];
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const isHacker = theme === "hacker";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are an expert software engineering assistant embedded in a team collaboration workspace. Help with code, architecture, debugging, and technical decisions. Be concise and practical.",
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.map((b) => b.text || "").join("") || "No response.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      // log activity
      if (teamId) {
        await addDoc(collection(db, "teams", teamId, "activity"), {
          type: "ai_query",
          userId: user.uid,
          userName: user.displayName || user.email,
          message: `Used AI Workspace: "${userMsg.content.slice(0, 60)}…"`,
          createdAt: serverTimestamp(),
        });
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${e.message}` }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "inherit" }}>
      <div style={{
        padding: "16px 20px", borderBottom: `1px solid ${t.border}`,
        background: t.headerBg, display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: t.accent,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon d={icons.ai} size={16} color={t.accentText} />
        </div>
        <div>
          <div style={{ color: t.text, fontWeight: 700, fontSize: 15 }}>AI Workspace</div>
          <div style={{ color: t.subtext, fontSize: 11 }}>Powered by Claude Sonnet</div>
        </div>
        {isHacker && (
          <div style={{
            marginLeft: "auto", fontSize: 10, color: t.accent,
            fontFamily: "monospace", letterSpacing: 2,
          }}>SYS::ACTIVE</div>
        )}
      </div>

      <div style={{
        flex: 1, overflowY: "auto", padding: "20px",
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 60 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, background: `${t.accent}22`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <Icon d={icons.ai} size={28} color={t.accent} />
            </div>
            <div style={{ color: t.text, fontWeight: 600, fontSize: 16, marginBottom: 6 }}>
              Ask anything
            </div>
            <div style={{ color: t.subtext, fontSize: 13, maxWidth: 320, margin: "0 auto" }}>
              Debug code, review architecture, get help with your tech stack, or brainstorm solutions.
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
          }}>
            <div style={{
              maxWidth: "80%", padding: "12px 16px", borderRadius: 12,
              background: msg.role === "user" ? t.msgBubble : t.card,
              color: msg.role === "user" ? t.msgBubbleText : t.text,
              border: msg.role === "user" ? "none" : `1px solid ${t.border}`,
              fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap",
              boxShadow: t.shadow,
            }}>
              {msg.role === "assistant" && (
                <div style={{ fontSize: 10, color: t.subtext, marginBottom: 6, fontWeight: 600 }}>
                  ◆ CLAUDE
                </div>
              )}
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{
              padding: "12px 16px", borderRadius: 12, background: t.card,
              border: `1px solid ${t.border}`, color: t.subtext, fontSize: 13,
            }}>
              <span style={{ animation: "pulse 1s infinite" }}>Thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{
        padding: "16px 20px", borderTop: `1px solid ${t.border}`, background: t.headerBg,
        display: "flex", gap: 10,
      }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder={isHacker ? "> Enter command…" : "Ask a question or describe a problem…"}
          rows={2}
          style={{
            flex: 1, padding: "10px 14px", borderRadius: 10,
            background: t.input, border: `1px solid ${t.inputBorder}`,
            color: t.text, fontSize: 13, fontFamily: "inherit", resize: "none",
            outline: "none", lineHeight: 1.5,
          }}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
          padding: "10px 16px", borderRadius: 10, background: t.accent,
          color: t.accentText, border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
          fontSize: 13, fontWeight: 600, opacity: loading || !input.trim() ? 0.5 : 1,
        }}>
          <Icon d={icons.send} size={15} color={t.accentText} />
          Send
        </button>
      </div>
    </div>
  );
}

// ── Project Files Tab ─────────────────────────────────────────────────────────
function ProjectFiles({ theme, user, teamId }) {
  const t = THEMES[theme];
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [content, setContent] = useState("");
  const [newName, setNewName] = useState("");
  const [newLang, setNewLang] = useState("javascript");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!teamId) return;
    const q = query(collection(db, "teams", teamId, "files"), orderBy("updatedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setFiles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [teamId]);

  const selectFile = (f) => { setSelected(f); setContent(f.content || ""); };

  const saveFile = async () => {
    if (!selected || !teamId) return;
    setSaving(true);
    await updateDoc(doc(db, "teams", teamId, "files", selected.id), {
      content,
      updatedBy: user.displayName || user.email,
      updatedAt: serverTimestamp(),
    });
    await addDoc(collection(db, "teams", teamId, "activity"), {
      type: "file_edit",
      userId: user.uid,
      userName: user.displayName || user.email,
      message: `Edited file: ${selected.name}`,
      createdAt: serverTimestamp(),
    });
    setSaving(false);
  };

  const createFile = async () => {
    if (!newName.trim() || !teamId) return;
    const ref = await addDoc(collection(db, "teams", teamId, "files"), {
      name: newName.trim(),
      content: "",
      language: newLang,
      updatedBy: user.displayName || user.email,
      updatedAt: serverTimestamp(),
    });
    await addDoc(collection(db, "teams", teamId, "activity"), {
      type: "file_create",
      userId: user.uid,
      userName: user.displayName || user.email,
      message: `Created file: ${newName.trim()}`,
      createdAt: serverTimestamp(),
    });
    setCreating(false);
    setNewName("");
  };

  const langColors = { javascript: "#f7df1e", typescript: "#3178c6", python: "#3572a5", go: "#00add8", rust: "#dea584", css: "#563d7c", html: "#e34c26", json: "#8bc34a", markdown: "#083fa1" };

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* File list */}
      <div style={{
        width: 220, borderRight: `1px solid ${t.border}`,
        display: "flex", flexDirection: "column", background: t.sidebar,
      }}>
        <div style={{
          padding: "14px 16px", borderBottom: `1px solid ${t.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ color: t.text, fontWeight: 700, fontSize: 13 }}>Files</span>
          <button onClick={() => setCreating(true)} style={{
            background: t.accent, border: "none", borderRadius: 6, padding: "4px 8px",
            color: t.accentText, cursor: "pointer", fontSize: 11, fontFamily: "inherit",
          }}>+ New</button>
        </div>
        {creating && (
          <div style={{ padding: 12, borderBottom: `1px solid ${t.border}` }}>
            <input
              autoFocus value={newName} onChange={(e) => setNewName(e.target.value)}
              placeholder="filename.js"
              style={{
                width: "100%", padding: "6px 10px", borderRadius: 6, fontSize: 12,
                background: t.input, border: `1px solid ${t.inputBorder}`, color: t.text,
                fontFamily: "inherit", boxSizing: "border-box", marginBottom: 6,
              }}
            />
            <select value={newLang} onChange={(e) => setNewLang(e.target.value)} style={{
              width: "100%", padding: "5px 8px", borderRadius: 6, fontSize: 12,
              background: t.input, border: `1px solid ${t.inputBorder}`, color: t.text,
              fontFamily: "inherit", marginBottom: 8,
            }}>
              {Object.keys(langColors).map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={createFile} style={{
                flex: 1, padding: "5px", borderRadius: 6, background: t.accent,
                color: t.accentText, border: "none", cursor: "pointer", fontSize: 11, fontFamily: "inherit",
              }}>Create</button>
              <button onClick={() => setCreating(false)} style={{
                flex: 1, padding: "5px", borderRadius: 6, background: t.hover,
                color: t.subtext, border: `1px solid ${t.border}`, cursor: "pointer",
                fontSize: 11, fontFamily: "inherit",
              }}>Cancel</button>
            </div>
          </div>
        )}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {files.length === 0 && (
            <div style={{ padding: 20, color: t.subtext, fontSize: 12, textAlign: "center" }}>
              No files yet
            </div>
          )}
          {files.map((f) => (
            <div key={f.id} onClick={() => selectFile(f)} style={{
              padding: "10px 16px", cursor: "pointer",
              background: selected?.id === f.id ? `${t.accent}22` : "transparent",
              borderLeft: selected?.id === f.id ? `3px solid ${t.accent}` : "3px solid transparent",
              borderBottom: `1px solid ${t.border}22`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: langColors[f.language] || t.subtext, flexShrink: 0,
                }} />
                <span style={{ color: t.text, fontSize: 12, fontWeight: 500, wordBreak: "break-all" }}>
                  {f.name}
                </span>
              </div>
              <div style={{ color: t.subtext, fontSize: 10, marginTop: 3, marginLeft: 15 }}>
                {f.language} · {timeAgo(f.updatedAt)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {selected ? (
          <>
            <div style={{
              padding: "12px 20px", borderBottom: `1px solid ${t.border}`,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              background: t.headerBg,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: t.text, fontWeight: 600, fontSize: 14 }}>{selected.name}</span>
                <span style={{
                  padding: "2px 8px", borderRadius: 20, background: t.tag,
                  color: t.tagText, fontSize: 10, fontWeight: 600,
                }}>{selected.language}</span>
              </div>
              <button onClick={saveFile} disabled={saving} style={{
                padding: "7px 14px", borderRadius: 8, background: t.accent,
                color: t.accentText, border: "none", cursor: "pointer",
                fontSize: 12, fontWeight: 600, fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <Icon d={icons.save} size={13} color={t.accentText} />
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                flex: 1, padding: "20px", background: t.codeBg,
                color: t.text, border: "none", outline: "none", resize: "none",
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                fontSize: 13, lineHeight: 1.7, tabSize: 2,
              }}
              spellCheck={false}
            />
          </>
        ) : (
          <div style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 12,
          }}>
            <Icon d={icons.files} size={40} color={t.subtext} />
            <div style={{ color: t.subtext, fontSize: 14 }}>Select a file to edit</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Commits Tab ───────────────────────────────────────────────────────────────
function Commits({ theme, user, teamId }) {
  const t = THEMES[theme];
  const [commits, setCommits] = useState([]);
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!teamId) return;
    const q = query(collection(db, "teams", teamId, "commits"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setCommits(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [teamId]);

  const addCommit = async () => {
    if (!msg.trim() || !teamId) return;
    setSubmitting(true);
    await addDoc(collection(db, "teams", teamId, "commits"), {
      message: msg.trim(),
      authorId: user.uid,
      authorName: user.displayName || user.email,
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(db, "teams", teamId, "activity"), {
      type: "commit",
      userId: user.uid,
      userName: user.displayName || user.email,
      message: `Committed: ${msg.trim().slice(0, 60)}`,
      createdAt: serverTimestamp(),
    });
    setMsg("");
    setSubmitting(false);
  };

  const hashColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const h = hash % 360;
    return `hsl(${Math.abs(h)}, 60%, 50%)`;
  };

  const shortHash = (id) => id.slice(0, 7);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{
        padding: "16px 20px", borderBottom: `1px solid ${t.border}`,
        background: t.headerBg,
      }}>
        <div style={{ color: t.text, fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
          Commit History
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") addCommit(); }}
            placeholder="feat: describe your changes…"
            style={{
              flex: 1, padding: "9px 14px", borderRadius: 8, fontSize: 13,
              background: t.input, border: `1px solid ${t.inputBorder}`,
              color: t.text, fontFamily: "inherit", outline: "none",
            }}
          />
          <button onClick={addCommit} disabled={submitting || !msg.trim()} style={{
            padding: "9px 16px", borderRadius: 8, background: t.accent,
            color: t.accentText, border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600, fontFamily: "inherit",
            opacity: submitting || !msg.trim() ? 0.5 : 1,
          }}>
            Commit
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 0 }}>
        {commits.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 60, color: t.subtext, fontSize: 14 }}>
            <Icon d={icons.commits} size={36} color={t.subtext} />
            <div style={{ marginTop: 12 }}>No commits yet</div>
          </div>
        )}
        {commits.map((c, i) => (
          <div key={c.id} style={{ display: "flex", gap: 0 }}>
            {/* Timeline */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 16, flexShrink: 0 }}>
              <div style={{
                width: 12, height: 12, borderRadius: "50%",
                background: hashColor(c.id), border: `2px solid ${t.card}`,
                boxShadow: `0 0 0 2px ${hashColor(c.id)}44`, marginTop: 4,
              }} />
              {i < commits.length - 1 && (
                <div style={{ width: 2, flex: 1, background: `${t.border}`, minHeight: 24 }} />
              )}
            </div>
            <div style={{
              flex: 1, padding: "8px 14px 20px 0",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                <code style={{
                  fontSize: 11, fontFamily: "monospace", color: t.accent,
                  background: t.tag, padding: "2px 7px", borderRadius: 4,
                }}>{shortHash(c.id)}</code>
                <span style={{ color: t.text, fontSize: 13, fontWeight: 500 }}>{c.message}</span>
              </div>
              <div style={{ color: t.subtext, fontSize: 11 }}>
                {c.authorName} · {timeAgo(c.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Team Chat Tab ─────────────────────────────────────────────────────────────
function TeamChat({ theme, user, teamId }) {
  const t = THEMES[theme];
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [members, setMembers] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!teamId) return;
    const q = query(collection(db, "teams", teamId, "messages"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });
    return unsub;
  }, [teamId]);

  useEffect(() => {
    if (!teamId) return;
    const presUnsub = onSnapshot(collection(db, "teams", teamId, "presence"), (snap) => {
      setMembers(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
    });

    // Set own presence
    const presRef = doc(db, "teams", teamId, "presence", user.uid);
    updateDoc(presRef, { online: true, name: user.displayName || user.email, lastSeen: serverTimestamp() })
      .catch(() => {
        import("firebase/firestore").then(({ setDoc }) => {
          setDoc(presRef, { online: true, name: user.displayName || user.email, lastSeen: serverTimestamp() });
        });
      });

    const interval = setInterval(() => {
      updateDoc(presRef, { lastSeen: serverTimestamp() }).catch(() => {});
    }, 30000);

    return () => { presUnsub(); clearInterval(interval); };
  }, [teamId, user]);

  const sendMsg = async () => {
    if (!text.trim() || !teamId) return;
    await addDoc(collection(db, "teams", teamId, "messages"), {
      text: text.trim(),
      senderId: user.uid,
      senderName: user.displayName || user.email,
      createdAt: serverTimestamp(),
    });
    setText("");
  };

  const online = members.filter((m) => m.online);

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{
          padding: "14px 20px", borderBottom: `1px solid ${t.border}`,
          background: t.headerBg, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ color: t.text, fontWeight: 700, fontSize: 15 }}>Team Chat</div>
            <div style={{ color: t.subtext, fontSize: 11 }}>{messages.length} messages</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {online.slice(0, 5).map((m) => (
              <div key={m.uid} title={m.name} style={{
                width: 28, height: 28, borderRadius: "50%",
                background: t.accent, display: "flex", alignItems: "center",
                justifyContent: "center", color: t.accentText, fontSize: 11, fontWeight: 700,
                border: `2px solid ${t.bg}`,
              }}>
                {(m.name || "?")[0].toUpperCase()}
              </div>
            ))}
            {online.length > 0 && (
              <span style={{ color: t.success, fontSize: 11, marginLeft: 4 }}>
                {online.length} online
              </span>
            )}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m, i) => {
            const isMe = m.senderId === user.uid;
            const prevSame = i > 0 && messages[i - 1].senderId === m.senderId;
            return (
              <div key={m.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", gap: 10, alignItems: "flex-end" }}>
                {!isMe && !prevSame && (
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%", background: t.accent,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: t.accentText, fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>
                    {(m.senderName || "?")[0].toUpperCase()}
                  </div>
                )}
                {!isMe && prevSame && <div style={{ width: 30, flexShrink: 0 }} />}
                <div style={{ maxWidth: "70%" }}>
                  {!isMe && !prevSame && (
                    <div style={{ color: t.subtext, fontSize: 10, marginBottom: 3, marginLeft: 2 }}>
                      {m.senderName} · {formatTime(m.createdAt)}
                    </div>
                  )}
                  <div style={{
                    padding: "9px 14px", borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: isMe ? t.msgBubble : t.msgOther,
                    color: isMe ? t.msgBubbleText : t.msgOtherText,
                    fontSize: 13, lineHeight: 1.5,
                    boxShadow: t.shadow,
                  }}>
                    {m.text}
                  </div>
                  {isMe && (
                    <div style={{ color: t.subtext, fontSize: 10, marginTop: 3, textAlign: "right" }}>
                      {formatTime(m.createdAt)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div style={{
          padding: "14px 20px", borderTop: `1px solid ${t.border}`,
          background: t.headerBg, display: "flex", gap: 10,
        }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") sendMsg(); }}
            placeholder="Type a message…"
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 10, fontSize: 13,
              background: t.input, border: `1px solid ${t.inputBorder}`,
              color: t.text, fontFamily: "inherit", outline: "none",
            }}
          />
          <button onClick={sendMsg} disabled={!text.trim()} style={{
            padding: "10px 16px", borderRadius: 10, background: t.accent,
            color: t.accentText, border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
            opacity: !text.trim() ? 0.5 : 1,
          }}>
            <Icon d={icons.send} size={14} color={t.accentText} />
          </button>
        </div>
      </div>

      {/* Members sidebar */}
      <div style={{
        width: 180, borderLeft: `1px solid ${t.border}`,
        background: t.sidebar, overflowY: "auto",
      }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${t.border}` }}>
          <div style={{ color: t.text, fontWeight: 700, fontSize: 12 }}>Members</div>
        </div>
        {members.map((m) => (
          <div key={m.uid} style={{
            padding: "10px 16px", display: "flex", alignItems: "center", gap: 10,
            borderBottom: `1px solid ${t.border}22`,
          }}>
            <div style={{ position: "relative" }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%", background: t.accent,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: t.accentText, fontSize: 12, fontWeight: 700,
              }}>
                {(m.name || "?")[0].toUpperCase()}
              </div>
              <div style={{
                position: "absolute", bottom: 0, right: 0,
                width: 9, height: 9, borderRadius: "50%",
                background: m.online ? t.onlineDot : t.border,
                border: `2px solid ${t.sidebar}`,
              }} />
            </div>
            <div>
              <div style={{ color: t.text, fontSize: 11, fontWeight: 500 }}>
                {m.name?.split(" ")[0] || "User"}
              </div>
              <div style={{ color: m.online ? t.success : t.subtext, fontSize: 10 }}>
                {m.online ? "online" : timeAgo(m.lastSeen)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Voice Call Tab ────────────────────────────────────────────────────────────
function VoiceCall({ theme, user, teamId }) {
  const t = THEMES[theme];
  const [inCall, setInCall] = useState(false);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [members, setMembers] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!teamId) return;
    const unsub = onSnapshot(collection(db, "teams", teamId, "presence"), (snap) => {
      setMembers(snap.docs.map((d) => ({ uid: d.id, ...d.data() })));
    });
    return unsub;
  }, [teamId]);

  const joinCall = async () => {
    setInCall(true);
    setDuration(0);
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    if (teamId) {
      await addDoc(collection(db, "teams", teamId, "activity"), {
        type: "voice_call",
        userId: user.uid,
        userName: user.displayName || user.email,
        message: "Joined voice call",
        createdAt: serverTimestamp(),
      });
    }
  };

  const leaveCall = () => {
    setInCall(false);
    clearInterval(timerRef.current);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const fmtDur = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const online = members.filter((m) => m.online);

  return (
    <div style={{
      height: "100%", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 32, padding: 32,
    }}>
      {/* Call ring visual */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {inCall && [1, 2, 3].map((ring) => (
          <div key={ring} style={{
            position: "absolute",
            width: 80 + ring * 60, height: 80 + ring * 60,
            borderRadius: "50%",
            border: `2px solid ${t.accent}`,
            opacity: 0.15 / ring,
            animation: `ripple ${1 + ring * 0.4}s ease-out infinite`,
            animationDelay: `${ring * 0.3}s`,
          }} />
        ))}
        <div style={{
          width: 100, height: 100, borderRadius: "50%",
          background: inCall ? t.accent : t.card,
          border: `3px solid ${inCall ? t.accent : t.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: inCall ? `0 0 40px ${t.accent}44` : t.shadow,
          transition: "all 0.4s ease",
        }}>
          <Icon d={icons.mic} size={36} color={inCall ? t.accentText : t.subtext} />
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ color: t.text, fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
          {inCall ? "In Call" : "Voice Call"}
        </div>
        <div style={{ color: t.subtext, fontSize: 13 }}>
          {inCall ? fmtDur(duration) : `${online.length} member${online.length !== 1 ? "s" : ""} available`}
        </div>
      </div>

      {/* Avatars */}
      {online.length > 0 && (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          {online.map((m) => (
            <div key={m.uid} style={{ textAlign: "center" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%", background: t.accent,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: t.accentText, fontSize: 16, fontWeight: 700,
                border: `2px solid ${inCall ? t.success : t.border}`,
                boxShadow: inCall ? `0 0 12px ${t.success}44` : "none",
                margin: "0 auto 6px",
              }}>
                {(m.name || "?")[0].toUpperCase()}
              </div>
              <div style={{ color: t.subtext, fontSize: 10 }}>{m.name?.split(" ")[0]}</div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {inCall && (
          <button onClick={() => setMuted(!muted)} style={{
            width: 50, height: 50, borderRadius: "50%",
            background: muted ? t.danger + "22" : t.hover,
            border: `2px solid ${muted ? t.danger : t.border}`,
            color: muted ? t.danger : t.subtext,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}>
            <Icon d={muted ? icons.micOff : icons.mic} size={20} color={muted ? t.danger : t.subtext} />
          </button>
        )}
        <button onClick={inCall ? leaveCall : joinCall} style={{
          padding: "14px 36px", borderRadius: 40,
          background: inCall ? t.danger : t.accent,
          color: inCall ? "#fff" : t.accentText,
          border: "none", cursor: "pointer",
          fontSize: 14, fontWeight: 700, fontFamily: "inherit",
          boxShadow: `0 4px 20px ${(inCall ? t.danger : t.accent)}44`,
          transition: "all 0.2s",
        }}>
          {inCall ? "Leave Call" : "Join Call"}
        </button>
      </div>

      <style>{`
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 0.3; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ── Activity Tab ──────────────────────────────────────────────────────────────
function Activity({ theme, teamId }) {
  const t = THEMES[theme];
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!teamId) return;
    const q = query(collection(db, "teams", teamId, "activity"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setActivities(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [teamId]);

  const typeConfig = {
    commit: { icon: icons.commits, label: "Commit", color: "#8b5cf6" },
    file_edit: { icon: icons.files, label: "Edit", color: "#3b82f6" },
    file_create: { icon: icons.plus, label: "New File", color: "#10b981" },
    ai_query: { icon: icons.ai, label: "AI", color: "#f59e0b" },
    voice_call: { icon: icons.voice, label: "Call", color: "#ef4444" },
    chat: { icon: icons.chat, label: "Chat", color: "#06b6d4" },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{
        padding: "16px 20px", borderBottom: `1px solid ${t.border}`, background: t.headerBg,
      }}>
        <div style={{ color: t.text, fontWeight: 700, fontSize: 15 }}>Activity Feed</div>
        <div style={{ color: t.subtext, fontSize: 12, marginTop: 2 }}>
          {activities.length} events tracked
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        {activities.length === 0 && (
          <div style={{ textAlign: "center", marginTop: 60, color: t.subtext }}>
            <Icon d={icons.activity} size={36} color={t.subtext} />
            <div style={{ marginTop: 12, fontSize: 14 }}>No activity yet</div>
          </div>
        )}
        {activities.map((a) => {
          const cfg = typeConfig[a.type] || { icon: icons.zap, label: a.type, color: t.accent };
          return (
            <div key={a.id} style={{
              display: "flex", alignItems: "flex-start", gap: 14,
              padding: "12px 16px", borderRadius: 10,
              background: t.card, border: `1px solid ${t.border}`,
              boxShadow: t.shadow,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: `${cfg.color}22`, border: `1px solid ${cfg.color}44`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Icon d={cfg.icon} size={16} color={cfg.color} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: cfg.color,
                    background: `${cfg.color}22`, padding: "1px 7px", borderRadius: 20,
                  }}>{cfg.label}</span>
                  <span style={{ color: t.subtext, fontSize: 11 }}>{a.userName}</span>
                </div>
                <div style={{ color: t.text, fontSize: 13, lineHeight: 1.4 }}>{a.message}</div>
                <div style={{ color: t.subtext, fontSize: 11, marginTop: 4 }}>
                  {timeAgo(a.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Team Selector / Creator ───────────────────────────────────────────────────
function TeamSelector({ theme, user, onSelect }) {
  const t = THEMES[theme];
  const [teams, setTeams] = useState([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ teamName: "", projectName: "", description: "", techStack: "", timezone: "UTC" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "teams"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setTeams(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const myTeams = teams.filter((t) => t.members?.includes(user.uid) || t.createdBy === user.uid);

  const createTeam = async () => {
    if (!form.teamName.trim()) return;
    setLoading(true);
    const techStackArr = form.techStack
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const ref = await addDoc(collection(db, "teams"), {
      teamName: form.teamName.trim(),
      projectName: form.projectName.trim(),
      description: form.description.trim(),
      techStack: techStackArr,
      timezone: form.timezone,
      createdBy: user.uid,
      members: [user.uid],
      createdAt: serverTimestamp(),
    });
    setLoading(false);
    onSelect(ref.id);
  };

  const joinTeam = async (teamId) => {
    const teamRef = doc(db, "teams", teamId);
    const snap = await getDoc(teamRef);
    if (snap.exists()) {
      const members = snap.data().members || [];
      if (!members.includes(user.uid)) {
        await updateDoc(teamRef, { members: [...members, user.uid] });
      }
    }
    onSelect(teamId);
  };

  return (
    <div style={{
      minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center",
      justifyContent: "center", padding: 24, fontFamily: "inherit",
    }}>
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ color: t.text, fontSize: 22, fontWeight: 700 }}>Select Team</div>
          <div style={{ color: t.subtext, fontSize: 13, marginTop: 4 }}>
            Join an existing team or create a new one
          </div>
        </div>

        {myTeams.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ color: t.subtext, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
              YOUR TEAMS
            </div>
            {myTeams.map((team) => (
              <div key={team.id} onClick={() => onSelect(team.id)} style={{
                padding: "14px 18px", borderRadius: 12, background: t.card,
                border: `1px solid ${t.border}`, marginBottom: 8, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                transition: "border-color 0.15s",
              }}>
                <div>
                  <div style={{ color: t.text, fontWeight: 600, fontSize: 14 }}>{team.teamName}</div>
                  <div style={{ color: t.subtext, fontSize: 12, marginTop: 2 }}>
                    {team.projectName} · {team.members?.length || 1} member{team.members?.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <div style={{
                  padding: "5px 14px", borderRadius: 20, background: t.accent,
                  color: t.accentText, fontSize: 11, fontWeight: 600,
                }}>Open →</div>
              </div>
            ))}
          </div>
        )}

        {teams.filter((t2) => !myTeams.find((m) => m.id === t2.id)).length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ color: t.subtext, fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
              ALL TEAMS
            </div>
            {teams.filter((t2) => !myTeams.find((m) => m.id === t2.id)).map((team) => (
              <div key={team.id} onClick={() => joinTeam(team.id)} style={{
                padding: "14px 18px", borderRadius: 12, background: t.card,
                border: `1px solid ${t.border}`, marginBottom: 8, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div>
                  <div style={{ color: t.text, fontWeight: 600, fontSize: 14 }}>{team.teamName}</div>
                  <div style={{ color: t.subtext, fontSize: 12, marginTop: 2 }}>{team.projectName}</div>
                </div>
                <div style={{
                  padding: "5px 14px", borderRadius: 20, background: t.hover,
                  color: t.subtext, fontSize: 11, fontWeight: 600, border: `1px solid ${t.border}`,
                }}>Join →</div>
              </div>
            ))}
          </div>
        )}

        {!creating ? (
          <button onClick={() => setCreating(true)} style={{
            width: "100%", padding: "12px", borderRadius: 12,
            background: "transparent", border: `2px dashed ${t.border}`,
            color: t.subtext, cursor: "pointer", fontSize: 14, fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <Icon d={icons.plus} size={16} color={t.subtext} /> Create New Team
          </button>
        ) : (
          <div style={{
            padding: "20px", borderRadius: 12, background: t.card,
            border: `1px solid ${t.border}`,
          }}>
            <div style={{ color: t.text, fontWeight: 700, fontSize: 14, marginBottom: 16 }}>
              New Team
            </div>
            {[
              { key: "teamName", label: "Team Name *", placeholder: "Engineering Alpha" },
              { key: "projectName", label: "Project Name", placeholder: "Project Phoenix" },
              { key: "description", label: "Description", placeholder: "What are you building?" },
              { key: "techStack", label: "Tech Stack (comma-separated)", placeholder: "React, GraphQL, Firebase" },
              { key: "timezone", label: "Timezone", placeholder: "UTC" },
            ].map(({ key, label, placeholder }) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <label style={{ color: t.subtext, fontSize: 11, fontWeight: 600, display: "block", marginBottom: 4 }}>
                  {label}
                </label>
                <input
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  style={{
                    width: "100%", padding: "9px 12px", borderRadius: 8, fontSize: 13,
                    background: t.input, border: `1px solid ${t.inputBorder}`, color: t.text,
                    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={createTeam} disabled={loading || !form.teamName.trim()} style={{
                flex: 1, padding: "10px", borderRadius: 8, background: t.accent,
                color: t.accentText, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600, fontFamily: "inherit",
              }}>
                {loading ? "Creating…" : "Create Team"}
              </button>
              <button onClick={() => setCreating(false)} style={{
                flex: 1, padding: "10px", borderRadius: 8, background: t.hover,
                color: t.subtext, border: `1px solid ${t.border}`, cursor: "pointer",
                fontSize: 13, fontFamily: "inherit",
              }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
const TABS = [
  { id: "ai", label: "AI Workspace", icon: icons.ai },
  { id: "files", label: "Project Files", icon: icons.files },
  { id: "commits", label: "Commits", icon: icons.commits },
  { id: "chat", label: "Team Chat", icon: icons.chat },
  { id: "voice", label: "Voice Call", icon: icons.voice },
  { id: "activity", label: "Activity", icon: icons.activity },
];

function Dashboard({ user, theme, setTheme }) {
  const t = THEMES[theme];
  const [activeTab, setActiveTab] = useState("ai");
  const [teamId, setTeamId] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!teamId) return;
    const unsub = onSnapshot(doc(db, "teams", teamId), (snap) => {
      if (snap.exists()) setTeamData({ id: snap.id, ...snap.data() });
    });
    return unsub;
  }, [teamId]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!teamId) {
    return <TeamSelector theme={theme} user={user} onSelect={setTeamId} />;
  }

  const themeKeys = Object.keys(THEMES);

  return (
    <div style={{
      display: "flex", height: "100vh", overflow: "hidden",
      background: t.bg, fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
      color: t.text,
    }}>
      {/* Sidebar */}
      <div style={{
        width: collapsed ? 64 : 220, background: t.sidebar,
        borderRight: `1px solid ${t.border}`, display: "flex", flexDirection: "column",
        transition: "width 0.25s ease", flexShrink: 0, overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{
          padding: collapsed ? "18px 16px" : "18px 20px",
          borderBottom: `1px solid ${t.border}`,
          display: "flex", alignItems: "center", gap: 10, overflow: "hidden",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: t.accent,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Icon d={icons.zap} size={16} color={t.accentText} />
          </div>
          {!collapsed && (
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: t.text, fontWeight: 800, fontSize: 14, whiteSpace: "nowrap" }}>TeamSync</div>
              <div style={{ color: t.subtext, fontSize: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {teamData?.teamName || "Loading…"}
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              marginLeft: "auto", background: "transparent", border: "none", cursor: "pointer",
              color: t.subtext, padding: 4, flexShrink: 0,
            }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d={collapsed ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"} />
            </svg>
          </button>
        </div>

        {/* Team info */}
        {!collapsed && teamData && (
          <div style={{ padding: "12px 20px", borderBottom: `1px solid ${t.border}` }}>
            <div style={{ color: t.subtext, fontSize: 10, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>PROJECT</div>
            <div style={{ color: t.text, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{teamData.projectName}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {(teamData.techStack || []).slice(0, 3).map((s) => (
                <span key={s} style={{
                  padding: "2px 7px", borderRadius: 20, background: t.tag,
                  color: t.tagText, fontSize: 9, fontWeight: 600,
                }}>{s}</span>
              ))}
              {(teamData.techStack || []).length > 3 && (
                <span style={{ color: t.subtext, fontSize: 9 }}>+{teamData.techStack.length - 3}</span>
              )}
            </div>
          </div>
        )}

        {/* Nav tabs */}
        <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                width: "100%", padding: collapsed ? "11px 16px" : "11px 20px",
                display: "flex", alignItems: "center", gap: 12,
                background: active ? `${t.activeTab}22` : "transparent",
                borderLeft: active ? `3px solid ${t.activeTab}` : "3px solid transparent",
                border: "none", cursor: "pointer", textAlign: "left",
                color: active ? t.activeTab : t.subtext,
                fontSize: 13, fontWeight: active ? 600 : 400,
                fontFamily: "inherit", transition: "all 0.15s",
                whiteSpace: "nowrap", overflow: "hidden",
              }}>
                <span style={{ flexShrink: 0 }}>
                  <Icon d={tab.icon} size={16} color={active ? t.activeTab : t.subtext} />
                </span>
                {!collapsed && <span>{tab.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div style={{ borderTop: `1px solid ${t.border}`, padding: "12px" }}>
          {/* Theme switcher */}
          <div style={{
            display: "flex", gap: 4, marginBottom: 10,
            justifyContent: collapsed ? "center" : "flex-start", flexWrap: "wrap",
          }}>
            {themeKeys.map((thm) => {
              const tc = THEMES[thm];
              const isActive = theme === thm;
              return (
                <button key={thm} onClick={() => setTheme(thm)} title={tc.label} style={{
                  padding: collapsed ? "5px" : "5px 9px",
                  borderRadius: 6, background: isActive ? tc.accent : t.hover,
                  color: isActive ? tc.accentText : t.subtext,
                  border: `1px solid ${isActive ? tc.accent : t.border}`,
                  cursor: "pointer", fontSize: 10, fontFamily: "inherit",
                  fontWeight: isActive ? 700 : 400,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  {collapsed ? tc.label[0] : tc.label}
                </button>
              );
            })}
          </div>

          {/* User + Logout */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px", borderRadius: 8, background: t.hover,
          }}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0 }} />
            ) : (
              <div style={{
                width: 28, height: 28, borderRadius: "50%", background: t.accent,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: t.accentText, fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>
                {(user.displayName || user.email || "U")[0].toUpperCase()}
              </div>
            )}
            {!collapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: t.text, fontSize: 11, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.displayName || "User"}
                  </div>
                  <div style={{ color: t.subtext, fontSize: 9, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {user.email}
                  </div>
                </div>
                <button onClick={handleLogout} title="Logout" style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  color: t.danger, padding: 4, flexShrink: 0,
                }}>
                  <Icon d={icons.logout} size={14} color={t.danger} />
                </button>
              </>
            )}
          </div>

          {collapsed && (
            <button onClick={handleLogout} style={{
              width: "100%", marginTop: 8, padding: "7px", borderRadius: 8,
              background: `${t.danger}22`, border: `1px solid ${t.danger}44`,
              color: t.danger, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon d={icons.logout} size={14} color={t.danger} />
            </button>
          )}

          {!collapsed && (
            <button onClick={() => setTeamId(null)} style={{
              width: "100%", marginTop: 8, padding: "6px", borderRadius: 8,
              background: "transparent", border: `1px solid ${t.border}`,
              color: t.subtext, cursor: "pointer", fontSize: 10, fontFamily: "inherit",
            }}>
              ← Switch Team
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {activeTab === "ai" && <AIWorkspace theme={theme} user={user} teamId={teamId} />}
        {activeTab === "files" && <ProjectFiles theme={theme} user={user} teamId={teamId} />}
        {activeTab === "commits" && <Commits theme={theme} user={user} teamId={teamId} />}
        {activeTab === "chat" && <TeamChat theme={theme} user={user} teamId={teamId} />}
        {activeTab === "voice" && <VoiceCall theme={theme} user={user} teamId={teamId} />}
        {activeTab === "activity" && <Activity theme={theme} teamId={teamId} />}
      </main>

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 3px; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [theme, setTheme] = useState("night");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u || null));
    return unsub;
  }, []);

  const t = THEMES[theme];

  if (user === undefined) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: t.bg, fontFamily: "'JetBrains Mono', monospace",
      }}>
        <div style={{ color: t.subtext, fontSize: 13 }}>Initializing…</div>
      </div>
    );
  }

  if (!user) return <LoginScreen theme={theme} />;
  return <Dashboard user={user} theme={theme} setTheme={setTheme} />;
}