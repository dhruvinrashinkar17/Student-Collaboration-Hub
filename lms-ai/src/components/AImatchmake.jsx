import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const TOTAL_STEPS = 5;

const SKILL_OPTIONS = [
  "Frontend Dev", "Backend Dev", "Full Stack", "UI/UX Design",
  "Mobile Dev", "DevOps", "Data Science", "ML/AI",
  "Blockchain", "QA Testing", "Product Management", "Technical Writing",
  "Cybersecurity", "Cloud Architecture", "Database Admin", "Game Dev",
];

const TECH_STACK_OPTIONS = [
  "React", "Next.js", "Vue.js", "Angular", "Svelte",
  "Node.js", "Express", "NestJS", "Django", "FastAPI",
  "Spring Boot", "Laravel", "Ruby on Rails", "Go", "Rust",
  "PostgreSQL", "MongoDB", "MySQL", "Firebase", "Supabase",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes",
  "GraphQL", "REST API", "WebSockets", "Redis", "Kafka",
];

const TIMEZONE_OPTIONS = [
  { label: "IST — India Standard Time (UTC+5:30)", value: "IST" },
  { label: "UTC — Coordinated Universal Time", value: "UTC" },
  { label: "EST — Eastern Standard Time (UTC-5)", value: "EST" },
  { label: "CST — Central Standard Time (UTC-6)", value: "CST" },
  { label: "MST — Mountain Standard Time (UTC-7)", value: "MST" },
  { label: "PST — Pacific Standard Time (UTC-8)", value: "PST" },
  { label: "GMT — Greenwich Mean Time", value: "GMT" },
  { label: "CET — Central European Time (UTC+1)", value: "CET" },
  { label: "EET — Eastern European Time (UTC+2)", value: "EET" },
  { label: "JST — Japan Standard Time (UTC+9)", value: "JST" },
  { label: "AEST — Australian Eastern Time (UTC+10)", value: "AEST" },
  { label: "SGT — Singapore Time (UTC+8)", value: "SGT" },
  { label: "BRT — Brasilia Time (UTC-3)", value: "BRT" },
  { label: "CAT — Central Africa Time (UTC+2)", value: "CAT" },
];

const DOMAIN_OPTIONS = [
  "EdTech", "FinTech", "HealthTech", "E-Commerce", "SaaS",
  "Developer Tools", "Social Network", "Gaming", "Productivity",
  "Climate Tech", "Cybersecurity", "Open Source", "Marketplace", "Automation",
];

const COLLAB_STYLE_OPTIONS = [
  "Async-first", "Daily standups", "Weekly syncs", "Pair programming",
  "Code reviews heavy", "Documentation-driven", "Agile sprints", "Kanban flow",
];

const stepTitles = [
  "Project Identity",
  "Skills & Stack",
  "Collaboration Setup",
  "Team Configuration",
  "Build Your Team",
];

const stepSubtitles = [
  "Name your project and describe the mission",
  "Define what your team needs to build",
  "Set timezone and working style",
  "Choose your team's ideal size",
  "Decide how you find your teammates",
];

export default function AImatchmake() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState("forward");
  const [animating, setAnimating] = useState(false);
  const [form, setForm] = useState({
    teamName: "",
    projectName: "",
    description: "",
    teamSize: 3,
    skills: [],
    techStack: [],
    timezone: "",
    domain: "",
    collabStyle: "",
  });

  const goTo = (target) => {
    if (animating) return;
    setDirection(target > step ? "forward" : "back");
    setAnimating(true);
    setTimeout(() => {
      setStep(target);
      setAnimating(false);
    }, 280);
  };

  const next = () => goTo(step + 1);
  const back = () => goTo(step - 1);

  const toggleArrayField = (field, value) => {
    setForm((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const handleSave = async (matchType) => {
    const docRef = await addDoc(collection(db, "teams"), {
      ...form,
      teamSize: Number(form.teamSize),
      matchType,
      createdBy: auth.currentUser.uid,
      members: [auth.currentUser.uid],
      createdAt: serverTimestamp(),
    });

    if (matchType === "manual") {
      navigate(`/manual-team/${docRef.id}`);
    } else {
      navigate(`/aiteamdashboard/${docRef.id}`);
    }
  };

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  const slideClass = animating
    ? direction === "forward"
      ? "slide-exit-left"
      : "slide-exit-right"
    : direction === "forward"
    ? "slide-enter-right"
    : "slide-enter-left";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        .mm-root {
          position: fixed; inset: 0;
          background: #080c14;
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Sans', sans-serif;
        }

        .mm-bg-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .mm-glow {
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,120,255,0.07) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .mm-card {
          position: relative;
          background: #0d1220;
          border: 1px solid rgba(0, 180, 255, 0.12);
          border-radius: 20px;
          width: 680px;
          min-height: 560px;
          padding: 40px 44px;
          display: flex; flex-direction: column;
          overflow: hidden;
          box-shadow: 0 0 60px rgba(0,100,255,0.08), inset 0 1px 0 rgba(255,255,255,0.04);
        }

        .mm-top-bar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 36px;
        }

        .mm-step-label {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: rgba(0,200,255,0.5);
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .mm-step-counter {
          font-family: 'Space Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.1em;
        }

        .mm-progress-track {
          position: absolute; top: 0; left: 0; right: 0;
          height: 2px;
          background: rgba(255,255,255,0.05);
        }

        .mm-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0070f3, #00d4ff);
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 12px rgba(0,212,255,0.5);
        }

        .mm-step-dots {
          display: flex; gap: 8px;
        }

        .mm-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(255,255,255,0.1);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .mm-dot.active {
          background: #00d4ff;
          box-shadow: 0 0 8px rgba(0,212,255,0.6);
          width: 20px; border-radius: 3px;
        }

        .mm-dot.done {
          background: rgba(0,212,255,0.35);
        }

        .mm-heading {
          font-size: 24px; font-weight: 600;
          color: #ffffff;
          margin: 0 0 6px;
          letter-spacing: -0.02em;
        }

        .mm-subheading {
          font-size: 13px; font-weight: 400;
          color: rgba(255,255,255,0.35);
          margin: 0 0 32px;
        }

        .mm-field-label {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: rgba(0,200,255,0.45);
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 8px;
          display: block;
        }

        .mm-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 12px 16px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
          margin-bottom: 20px;
        }

        .mm-input::placeholder { color: rgba(255,255,255,0.18); }

        .mm-input:focus {
          border-color: rgba(0,180,255,0.4);
          box-shadow: 0 0 0 3px rgba(0,150,255,0.08);
        }

        .mm-textarea {
          resize: vertical; min-height: 90px;
        }

        .mm-select {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='rgba(0,180,255,0.4)' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 40px;
          cursor: pointer;
        }

        .mm-select option {
          background: #0d1220;
          color: #fff;
        }

        .mm-tag-grid {
          display: flex; flex-wrap: wrap; gap: 8px;
          margin-bottom: 24px;
        }

        .mm-tag {
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.45);
          font-size: 12px; font-weight: 500;
          cursor: pointer;
          transition: all 0.18s ease;
          user-select: none;
          letter-spacing: 0.01em;
        }

        .mm-tag:hover {
          border-color: rgba(0,180,255,0.3);
          color: rgba(255,255,255,0.75);
          background: rgba(0,100,255,0.06);
        }

        .mm-tag.selected {
          border-color: #00c4ff;
          background: rgba(0,180,255,0.12);
          color: #00d4ff;
          box-shadow: 0 0 10px rgba(0,180,255,0.12);
        }

        .mm-range-wrapper {
          margin-bottom: 32px;
        }

        .mm-range-display {
          display: flex; align-items: baseline; gap: 10px;
          margin-bottom: 20px;
        }

        .mm-range-number {
          font-family: 'Space Mono', monospace;
          font-size: 52px;
          font-weight: 700;
          color: #fff;
          line-height: 1;
          letter-spacing: -0.04em;
        }

        .mm-range-unit {
          font-size: 14px; color: rgba(255,255,255,0.3);
          font-weight: 400;
        }

        .mm-range-input {
          width: 100%;
          appearance: none;
          height: 4px;
          background: rgba(255,255,255,0.08);
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }

        .mm-range-input::-webkit-slider-thumb {
          appearance: none;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: #00d4ff;
          box-shadow: 0 0 14px rgba(0,212,255,0.5);
          cursor: pointer;
          transition: transform 0.15s;
        }

        .mm-range-input::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }

        .mm-range-ticks {
          display: flex; justify-content: space-between;
          margin-top: 10px;
        }

        .mm-range-tick {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: rgba(255,255,255,0.2);
          cursor: pointer;
          transition: color 0.2s;
        }

        .mm-range-tick.active-tick {
          color: #00d4ff;
        }

        .mm-size-desc {
          margin-top: 16px;
          padding: 10px 14px;
          background: rgba(0,150,255,0.06);
          border-radius: 8px;
          border-left: 2px solid rgba(0,180,255,0.3);
          font-size: 12px; color: rgba(255,255,255,0.4);
          line-height: 1.5;
        }

        .mm-choice-grid {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 14px; margin-bottom: 16px;
        }

        .mm-choice-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 24px 22px;
          cursor: pointer;
          transition: all 0.22s ease;
          text-align: center;
        }

        .mm-choice-card:hover {
          border-color: rgba(0,180,255,0.35);
          background: rgba(0,100,255,0.06);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }

        .mm-choice-title {
          font-size: 15px; font-weight: 600;
          color: #fff; margin-bottom: 8px;
        }

        .mm-choice-desc {
          font-size: 12px; color: rgba(255,255,255,0.3);
          line-height: 1.5;
        }

        .mm-badge {
          display: inline-block;
          font-family: 'Space Mono', monospace;
          font-size: 9px;
          padding: 3px 8px;
          border-radius: 4px;
          margin-bottom: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .mm-badge-blue {
          background: rgba(0,150,255,0.15);
          color: #00a8ff;
          border: 1px solid rgba(0,150,255,0.2);
        }

        .mm-badge-purple {
          background: rgba(120,80,255,0.15);
          color: #a06fff;
          border: 1px solid rgba(120,80,255,0.2);
        }

        .mm-nav {
          margin-top: auto; padding-top: 28px;
          display: flex; align-items: center; justify-content: space-between;
        }

        .mm-btn {
          padding: 11px 26px;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          cursor: pointer;
          transition: all 0.18s ease;
          outline: none;
          letter-spacing: 0.01em;
        }

        .mm-btn-ghost {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.4);
        }

        .mm-btn-ghost:hover {
          border-color: rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.7);
        }

        .mm-btn-primary {
          background: linear-gradient(135deg, #0050d8, #0099ff);
          border: none;
          color: #fff;
          box-shadow: 0 4px 18px rgba(0,100,255,0.3);
        }

        .mm-btn-primary:hover {
          box-shadow: 0 6px 24px rgba(0,120,255,0.45);
          transform: translateY(-1px);
        }

        .mm-btn-primary:active { transform: scale(0.98); }

        .mm-row {
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideOutLeft {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(-40px); }
        }

        @keyframes slideOutRight {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(40px); }
        }

        .slide-enter-right { animation: slideInRight 0.3s cubic-bezier(0.4,0,0.2,1) forwards; }
        .slide-enter-left  { animation: slideInLeft 0.3s cubic-bezier(0.4,0,0.2,1) forwards; }
        .slide-exit-left   { animation: slideOutLeft 0.28s cubic-bezier(0.4,0,0.2,1) forwards; }
        .slide-exit-right  { animation: slideOutRight 0.28s cubic-bezier(0.4,0,0.2,1) forwards; }

        .mm-tag-section-label {
          font-family: 'Space Mono', monospace;
          font-size: 10px; color: rgba(0,200,255,0.45);
          letter-spacing: 0.12em; text-transform: uppercase;
          margin-bottom: 10px; margin-top: 4px;
          display: block;
        }

        .mm-scroll-tags {
          max-height: 160px;
          overflow-y: auto;
          padding-right: 4px;
          margin-bottom: 6px;
        }

        .mm-scroll-tags::-webkit-scrollbar { width: 3px; }
        .mm-scroll-tags::-webkit-scrollbar-track { background: transparent; }
        .mm-scroll-tags::-webkit-scrollbar-thumb { background: rgba(0,180,255,0.2); border-radius: 2px; }

        .mm-selected-count {
          font-family: 'Space Mono', monospace;
          font-size: 10px;
          color: rgba(0,200,255,0.45);
          margin-top: 4px;
          margin-bottom: 12px;
        }
      `}</style>

      <div className="mm-root">
        <div className="mm-bg-grid" />
        <div className="mm-glow" />

        <div className="mm-card">
          <div className="mm-progress-track">
            <div className="mm-progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <div className="mm-top-bar">
            <div className="mm-step-dots">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={`mm-dot ${i + 1 === step ? "active" : i + 1 < step ? "done" : ""}`}
                  onClick={() => i + 1 < step && goTo(i + 1)}
                />
              ))}
            </div>
            <span className="mm-step-counter">{step} / {TOTAL_STEPS}</span>
          </div>

          <div className={slideClass}>
            <h1 className="mm-heading">{stepTitles[step - 1]}</h1>
            <p className="mm-subheading">{stepSubtitles[step - 1]}</p>

            {step === 1 && (
              <div>
                <div className="mm-row">
                  <div>
                    <span className="mm-field-label">Team Name</span>
                    <input
                      className="mm-input"
                      placeholder="e.g. NightOwl Labs"
                      value={form.teamName}
                      onChange={(e) => setForm({ ...form, teamName: e.target.value })}
                    />
                  </div>
                  <div>
                    <span className="mm-field-label">Project Name</span>
                    <input
                      className="mm-input"
                      placeholder="e.g. DevSync"
                      value={form.projectName}
                      onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                    />
                  </div>
                </div>

                <span className="mm-field-label">Domain / Industry</span>
                <select
                  className="mm-input mm-select"
                  value={form.domain}
                  onChange={(e) => setForm({ ...form, domain: e.target.value })}
                >
                  <option value="">Select a domain...</option>
                  {DOMAIN_OPTIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <span className="mm-field-label">Project Description</span>
                <textarea
                  className="mm-input mm-textarea"
                  placeholder="What are you building? What problem does it solve?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
            )}

            {step === 2 && (
              <div>
                <span className="mm-tag-section-label">Skills Needed</span>
                <div className="mm-selected-count">{form.skills.length} selected</div>
                <div className="mm-scroll-tags">
                  <div className="mm-tag-grid">
                    {SKILL_OPTIONS.map((s) => (
                      <div
                        key={s}
                        className={`mm-tag ${form.skills.includes(s) ? "selected" : ""}`}
                        onClick={() => toggleArrayField("skills", s)}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                </div>

                <span className="mm-tag-section-label" style={{ marginTop: 20 }}>Tech Stack</span>
                <div className="mm-selected-count">{form.techStack.length} selected</div>
                <div className="mm-scroll-tags">
                  <div className="mm-tag-grid">
                    {TECH_STACK_OPTIONS.map((t) => (
                      <div
                        key={t}
                        className={`mm-tag ${form.techStack.includes(t) ? "selected" : ""}`}
                        onClick={() => toggleArrayField("techStack", t)}
                      >
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <span className="mm-field-label">Primary Timezone</span>
                <select
                  className="mm-input mm-select"
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                >
                  <option value="">Select your timezone...</option>
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>

                <span className="mm-field-label">Collaboration Style</span>
                <div className="mm-tag-grid">
                  {COLLAB_STYLE_OPTIONS.map((s) => (
                    <div
                      key={s}
                      className={`mm-tag ${form.collabStyle === s ? "selected" : ""}`}
                      onClick={() => setForm({ ...form, collabStyle: s })}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="mm-range-wrapper">
                <div className="mm-range-display">
                  <span className="mm-range-number">{form.teamSize}</span>
                  <span className="mm-range-unit">members</span>
                </div>

                <input
                  type="range"
                  className="mm-range-input"
                  min="2"
                  max="8"
                  step="1"
                  value={form.teamSize}
                  onChange={(e) => setForm({ ...form, teamSize: Number(e.target.value) })}
                  style={{
                    background: `linear-gradient(to right, #0099ff ${((form.teamSize - 2) / 6) * 100}%, rgba(255,255,255,0.08) ${((form.teamSize - 2) / 6) * 100}%)`
                  }}
                />

                <div className="mm-range-ticks">
                  {[2,3,4,5,6,7,8].map((n) => (
                    <span
                      key={n}
                      className={`mm-range-tick ${form.teamSize === n ? "active-tick" : ""}`}
                      onClick={() => setForm({ ...form, teamSize: n })}
                    >
                      {n}
                    </span>
                  ))}
                </div>

                <div className="mm-size-desc">
                  {form.teamSize === 2 && "Duo — tight collaboration, fast decisions, minimal overhead."}
                  {form.teamSize === 3 && "Trio — ideal for hackathons. Every role covered, nothing redundant."}
                  {form.teamSize === 4 && "Quad — balanced for a focused MVP with some specialization."}
                  {form.teamSize === 5 && "Five — room for dedicated roles across frontend, backend, and design."}
                  {form.teamSize === 6 && "Six — larger scope. Good for multi-track parallel development."}
                  {form.teamSize === 7 && "Seven — cross-functional team with room for QA and DevOps."}
                  {form.teamSize === 8 && "Eight — full squad. Requires strong coordination and leadership."}
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <div className="mm-choice-grid">
                  <div className="mm-choice-card" onClick={() => handleSave("manual")}>
                    <div className="mm-badge mm-badge-blue">Manual</div>
                    <div className="mm-choice-title">Hand-pick your crew</div>
                    <div className="mm-choice-desc">
                      Browse profiles, filter by skills, and invite the exact people you want on your team.
                    </div>
                  </div>

                  <div className="mm-choice-card" onClick={() => handleSave("ai")}>
                    <div className="mm-badge mm-badge-purple">AI-Powered</div>
                    <div className="mm-choice-title">Let the algorithm match</div>
                    <div className="mm-choice-desc">
                      Our AI analyzes skills, timezones, and working styles to find your ideal collaborators.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mm-nav">
            {step > 1 ? (
              <button className="mm-btn mm-btn-ghost" onClick={back}>Back</button>
            ) : (
              <div />
            )}
            {step < TOTAL_STEPS && (
              <button className="mm-btn mm-btn-primary" onClick={next}>Continue</button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}