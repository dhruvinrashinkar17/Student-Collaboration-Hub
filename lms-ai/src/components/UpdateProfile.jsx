import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Cpu, User, Mail, BookOpen, Globe, GraduationCap, Briefcase, Layers, Code2, Users, FileText } from "lucide-react";

/* ── field config ── */
const FIELDS = [
  { name: "fullName",       label: "Full Name",        icon: User,         span: 1 },
  { name: "email",          label: "Email",            icon: Mail,         span: 1 },
  { name: "college",        label: "College",          icon: BookOpen,     span: 1 },
  { name: "country",        label: "Country",          icon: Globe,        span: 1 },
  { name: "course",         label: "Course",           icon: GraduationCap, span: 1 },
  { name: "domain",         label: "Domain",           icon: Layers,       span: 1 },
  { name: "experience",     label: "Experience",       icon: Briefcase,    span: 1 },
  { name: "educationLevel", label: "Education Level",  icon: GraduationCap, span: 1 },
  { name: "role",           label: "Role",             icon: Code2,        span: 1 },
  { name: "teamMode",       label: "Team Mode",        icon: Users,        span: 1 },
];

export default function UpdateProfile() {
  const [form,       setForm]       = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [darkMode,   setDarkMode]   = useState(true);

  const navigate = useNavigate();

  /* fetch */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) setForm(snap.data());
      } catch (err) { console.error(err); }
    });
    return () => unsub();
  }, []);

  /* sync dark mode with html class */
  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;
      await updateDoc(doc(db, "users", user.uid), form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  /* ── loading state ── */
  if (!form) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-4 ${darkMode ? "bg-[#0b0f19] text-white" : "bg-gray-50 text-gray-900"}`}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap'); * { font-family:'DM Sans',sans-serif; } .font-display { font-family:'Syne',sans-serif; }`}</style>
        <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <p className="text-sm text-gray-400">Loading your profile…</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        * { font-family:'DM Sans',sans-serif; box-sizing:border-box; }
        .font-display { font-family:'Syne',sans-serif; }

        .field-group input, .field-group textarea {
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field-group input:focus, .field-group textarea:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.18);
        }

        .save-btn {
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(16,185,129,0.35);
        }
        .save-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .back-btn:hover {
          transform: translateX(-3px);
        }
        .back-btn { transition: transform 0.2s; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 99px; }
      `}</style>

      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-[#0b0f19] text-white" : "bg-gray-50 text-gray-900"}`}>

        {/* ── top bar ── */}
        <div className={`sticky top-0 z-30 flex items-center justify-between px-6 md:px-10 py-4 backdrop-blur-xl border-b ${
          darkMode ? "bg-[#0b0f19]/80 border-white/5" : "bg-white/80 border-gray-100"
        }`}>
          <button
            onClick={() => navigate("/newdashboard")}
            className={`back-btn flex items-center gap-2 text-sm font-semibold ${darkMode ? "text-gray-300 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-indigo-500" />
            <span className="font-display font-bold text-base tracking-tight">CollabHub</span>
          </div>
        </div>

        {/* ── main content ── */}
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-12">

          {/* page header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-4 tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              Account Settings
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight">
              Update Profile
            </h1>
            <p className={`mt-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
              Keep your information up to date so teammates can find the right you.
            </p>
          </div>

          {/* avatar row */}
          <div className={`flex items-center gap-4 p-5 rounded-2xl border mb-8 ${
            darkMode ? "bg-[#111827] border-white/5" : "bg-white border-gray-100 shadow-sm"
          }`}>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0">
              {form.fullName ? form.fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "?"}
            </div>
            <div>
              <p className="font-semibold">{form.fullName || "Your Name"}</p>
              <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{form.email || ""}</p>
            </div>
          </div>

          {/* ── form card ── */}
          <div className={`rounded-2xl border p-6 md:p-8 ${
            darkMode ? "bg-[#111827] border-white/5" : "bg-white border-gray-100 shadow-sm"
          }`}>

            <p className={`text-xs font-bold uppercase tracking-widest mb-6 ${darkMode ? "text-gray-500" : "text-gray-400"}`}>
              Personal Information
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 field-group">
              {FIELDS.map(({ name, label, icon: Icon }) => (
                <div key={name} className="flex flex-col gap-1.5">
                  <label className={`text-xs font-semibold flex items-center gap-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    <Icon size={12} />
                    {label}
                  </label>
                  <input
                    name={name}
                    value={form[name] || ""}
                    onChange={handleChange}
                    placeholder={label}
                    className={`w-full px-4 py-3 rounded-xl border text-sm font-medium placeholder-gray-500 transition-colors ${
                      darkMode
                        ? "bg-[#0b0f19] border-white/8 text-white"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* bio */}
            <div className="mt-5 flex flex-col gap-1.5 field-group">
              <label className={`text-xs font-semibold flex items-center gap-1.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                <FileText size={12} />
                Bio
              </label>
              <textarea
                name="bio"
                value={form.bio || ""}
                onChange={handleChange}
                rows={4}
                placeholder="Tell your teammates about yourself…"
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium placeholder-gray-500 resize-none ${
                  darkMode
                    ? "bg-[#0b0f19] border-white/8 text-white"
                    : "bg-gray-50 border-gray-200 text-gray-900"
                }`}
              />
            </div>

            {/* actions */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                onClick={handleSave}
                disabled={loading}
                className="save-btn flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-sm shadow-lg shadow-green-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Save Changes
                  </>
                )}
              </button>

              <button
                onClick={() => navigate("/newdashboard")}
                className={`flex-1 py-3.5 rounded-xl font-semibold text-sm border transition-colors ${
                  darkMode
                    ? "border-white/10 text-gray-300 hover:bg-white/5"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* ── success toast ── */}
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl font-semibold text-sm transition-all duration-300 ${
          saved ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        } bg-gradient-to-r from-green-500 to-emerald-500 text-white`}>
          <Check size={16} />
          Profile updated successfully!
        </div>

      </div>
    </>
  );
}