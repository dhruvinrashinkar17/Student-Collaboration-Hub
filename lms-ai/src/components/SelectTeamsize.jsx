import { useState, useEffect } from "react";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function SelectTeamSize() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkExistingChoice = async () => {
      const user = auth.currentUser;

      if (!user) {
        navigate("/login");
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.teamMode === "solo") {
          navigate("/soloteam");
          return;
        }
        if (data.teamMode === "ai") {
          navigate("/aimatchmake");
          return;
        }
      }

      setLoading(false);
    };

    checkExistingChoice();
  }, [navigate]);

  const handleSelect = async (mode) => {
    const user = auth.currentUser;
    if (!user) return;

    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, { teamMode: mode }, { merge: true });

    if (mode === "solo") {
      navigate("/soloteam");
    } else {
      navigate("/aimatchmake");
    }
  };

  if (loading) {
    return (
      <div
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
        className="min-h-screen flex items-center justify-center bg-[#0a0f1e] text-[#3b82f6] text-sm tracking-widest"
      >
        initializing...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: "#0a0f1e", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Top glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)",
          top: "-150px",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />

      {/* Badge */}
      <div
        className="relative z-10 text-xs tracking-widest mb-5 px-3 py-1.5 rounded"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          color: "#3b82f6",
          background: "rgba(59,130,246,0.12)",
          border: "1px solid rgba(59,130,246,0.25)",
        }}
      >
        // project_setup.config
      </div>

      {/* Title */}
      <h1
        className="relative z-10 text-2xl font-bold text-center mb-2"
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          color: "#e2e8f0",
          letterSpacing: "-0.02em",
        }}
      >
        Choose your workflow
      </h1>
      <p className="relative z-10 text-sm text-center mb-9" style={{ color: "#64748b" }}>
        This defines how your project will be structured.
      </p>

      {/* Cards */}
      <div className="relative z-10 w-full max-w-md flex flex-col gap-4">

        {/* Solo */}
        <button
          onClick={() => handleSelect("solo")}
          className="group relative w-full text-left rounded-xl p-6 transition-all duration-200"
          style={{
            background: "#0f172a",
            border: "1px solid #1e3a5f",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#3b82f6";
            e.currentTarget.style.background = "#111c35";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#1e3a5f";
            e.currentTarget.style.background = "#0f172a";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: "linear-gradient(90deg, #1d4ed8, #3b82f6)" }}
          />

          {/* Icon */}
          <div
            className="mb-3 w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: "rgba(59,130,246,0.12)",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#3b82f6"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"
              />
            </svg>
          </div>

          <p
            className="text-sm font-bold mb-1"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "#cbd5e1" }}
          >
            solo_project()
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "#475569" }}>
            Work independently. Full control.
            <br />
            No coordination overhead.
          </p>

          {/* Arrow */}
          <span
            className="absolute right-5 top-1/2 -translate-y-1/2 text-xl transition-all duration-200 group-hover:translate-x-1"
            style={{ color: "#1e3a5f" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#3b82f6")}
          >
            ›
          </span>
        </button>

        {/* AI Matchmake */}
        <button
          onClick={() => handleSelect("ai")}
          className="group relative w-full text-left rounded-xl p-6 transition-all duration-200"
          style={{
            background: "#0f172a",
            border: "1px solid #1e3a5f",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#3b82f6";
            e.currentTarget.style.background = "#111c35";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#1e3a5f";
            e.currentTarget.style.background = "#0f172a";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            style={{ background: "linear-gradient(90deg, #1d4ed8, #3b82f6)" }}
          />

          <div
            className="mb-3 w-9 h-9 rounded-lg flex items-center justify-center"
            style={{
              background: "rgba(59,130,246,0.12)",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#3b82f6"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
              />
            </svg>
          </div>

          <p
            className="text-sm font-bold mb-1"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: "#cbd5e1" }}
          >
            ai_matchmake()
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "#475569" }}>
            Let AI find teammates by skills.
            <br />
            Optimized team composition.
          </p>

          <span
            className="absolute right-5 top-1/2 -translate-y-1/2 text-xl transition-all duration-200 group-hover:translate-x-1"
            style={{ color: "#1e3a5f" }}
          >
            ›
          </span>
        </button>
      </div>

      {/* Warning */}
      <p
        className="relative z-10 mt-7 text-xs tracking-widest"
        style={{ fontFamily: "'JetBrains Mono', monospace", color: "#334155" }}
      >
        <span style={{ color: "#ef4444" }}>!</span> immutable after selection — choose carefully
      </p>
    </div>
  );
}