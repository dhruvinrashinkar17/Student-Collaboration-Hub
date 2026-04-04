import { useState } from "react";
import { auth, db } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

/* ═══════════════════════════════════════════════════════════════
   NINJA ROBOT LOADING SCREEN
═══════════════════════════════════════════════════════════════ */
function NinjaRobot() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "32px" }}>
      <style>{`
        @keyframes robotRun  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes rLegL     { 0%,100%{transform:rotate(-30deg)} 50%{transform:rotate(30deg)} }
        @keyframes rLegR     { 0%,100%{transform:rotate(30deg)}  50%{transform:rotate(-30deg)} }
        @keyframes rArmL     { 0%,100%{transform:rotate(20deg)}  50%{transform:rotate(-40deg)} }
        @keyframes rArmR     { 0%,100%{transform:rotate(-20deg)} 50%{transform:rotate(40deg)} }
        @keyframes rBlink    { 0%,90%,100%{transform:scaleY(1)}  95%{transform:scaleY(0.1)} }
        @keyframes rScarf    { 0%,100%{transform:rotate(-5deg) translateX(0)} 50%{transform:rotate(5deg) translateX(4px)} }
        @keyframes rGround   { 0%{transform:translateX(0)} 100%{transform:translateX(-60px)} }
        @keyframes rCode     { 0%{opacity:0;transform:translateY(0) scale(0.8)} 20%{opacity:1;transform:translateY(-8px) scale(1)} 80%{opacity:1;transform:translateY(-14px) scale(1)} 100%{opacity:0;transform:translateY(-20px) scale(0.8)} }
        @keyframes rDot      { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        .rr-run  { animation: robotRun 0.5s ease-in-out infinite; }
        .rr-legL { animation: rLegL 0.5s ease-in-out infinite; transform-origin: top center; }
        .rr-legR { animation: rLegR 0.5s ease-in-out infinite; transform-origin: top center; }
        .rr-armL { animation: rArmL 0.5s ease-in-out infinite; transform-origin: top right; }
        .rr-armR { animation: rArmR 0.5s ease-in-out infinite; transform-origin: top left; }
        .rr-eye  { animation: rBlink 2s ease-in-out infinite; transform-origin: center; }
        .rr-sc   { animation: rScarf 0.5s ease-in-out infinite; transform-origin: left center; }
        .rr-gnd  { animation: rGround 0.5s linear infinite; }
        .rr-c1   { animation: rCode 1.2s ease-in-out infinite; }
        .rr-c2   { animation: rCode 1.2s ease-in-out infinite 0.4s; }
        .rr-c3   { animation: rCode 1.2s ease-in-out infinite 0.8s; }
        .rr-d1   { animation: rDot 1.2s ease-in-out infinite 0s; }
        .rr-d2   { animation: rDot 1.2s ease-in-out infinite 0.2s; }
        .rr-d3   { animation: rDot 1.2s ease-in-out infinite 0.4s; }
      `}</style>

      <svg viewBox="0 0 140 170" width="150" height="180" xmlns="http://www.w3.org/2000/svg">
        <g className="rr-gnd">
          {[0,32,64,96,128].map(x => <rect key={x} x={x} y="158" width="22" height="2" rx="1" fill="#1e3a5f"/>)}
        </g>
        <text x="92" y="28" fontSize="11" fill="#3b82f6" fontFamily="monospace" className="rr-c1">{"{ }"}</text>
        <text x="100" y="50" fontSize="10" fill="#22d3ee" fontFamily="monospace" className="rr-c2">{"</>"}</text>
        <text x="88"  y="44" fontSize="9"  fill="#a78bfa" fontFamily="monospace" className="rr-c3">{"()=>"}</text>
        <g className="rr-run">
          <g transform="translate(48,124)"><rect className="rr-legL" x="-11" y="0" width="11" height="28" rx="4" fill="#1e40af"/></g>
          <g transform="translate(92,124)"><rect className="rr-legR" x="0"   y="0" width="11" height="28" rx="4" fill="#1e40af"/></g>
          <rect x="34" y="74" width="72" height="54" rx="11" fill="#1d4ed8"/>
          <rect x="44" y="84" width="52" height="30" rx="7"  fill="#1e3a5f"/>
          <rect x="50" y="90" width="14" height="5"  rx="2"  fill="#3b82f6"/>
          <rect x="70" y="90" width="14" height="5"  rx="2"  fill="#22d3ee"/>
          <rect x="50" y="100" width="34" height="3" rx="1"  fill="#0f172a"/>
          <rect x="50" y="106" width="24" height="3" rx="1"  fill="#0f172a"/>
          <g transform="translate(34,78)"><rect className="rr-armL" x="-18" y="0" width="20" height="11" rx="5" fill="#2563eb"/></g>
          <g transform="translate(106,78)"><rect className="rr-armR" x="0"   y="0" width="20" height="11" rx="5" fill="#2563eb"/></g>
          <rect x="60" y="62" width="20" height="14" rx="5"  fill="#1d4ed8"/>
          <rect x="28" y="26" width="84" height="58" rx="16" fill="#1d4ed8"/>
          <rect x="38" y="36" width="64" height="30" rx="9"  fill="#0f172a"/>
          <g className="rr-eye"><rect x="44" y="44" width="18" height="12" rx="4" fill="#3b82f6"/></g>
          <g className="rr-eye" style={{ animationDelay:"0.1s" }}><rect x="78" y="44" width="18" height="12" rx="4" fill="#3b82f6"/></g>
          <rect x="47" y="46" width="5" height="4" rx="1" fill="#93c5fd" opacity="0.8"/>
          <rect x="81" y="46" width="5" height="4" rx="1" fill="#93c5fd" opacity="0.8"/>
          <rect x="28" y="36" width="84" height="10" rx="5"  fill="#dc2626"/>
          <rect className="rr-sc" x="100" y="32" width="7" height="20" rx="2" fill="#dc2626"/>
          <rect className="rr-sc" x="100" y="36" width="6" height="16" rx="2" fill="#b91c1c" style={{ animationDelay:"0.15s" }}/>
          <line x1="28" y1="41" x2="112" y2="41" stroke="#b91c1c" strokeWidth="1" opacity="0.4"/>
        </g>
      </svg>

      <div style={{ textAlign:"center" }}>
        <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"16px", fontWeight:"700", color:"#e2e8f0", margin:"0 0 8px", letterSpacing:"-0.01em" }}>
          Compiling your project...
        </p>
        <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"11px", color:"#475569", margin:0, letterSpacing:"0.06em" }}>
          please wait while we redirect
        </p>
        <div style={{ display:"flex", justifyContent:"center", gap:"8px", marginTop:"18px" }}>
          {["rr-d1","rr-d2","rr-d3"].map((cls,i) => (
            <div key={i} className={cls} style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#3b82f6" }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STEP BAR  (4 steps now)
═══════════════════════════════════════════════════════════════ */
function StepBar({ current }) {
  const labels = ["Basic Info","Project Info","Requirements","Timeline"];
  return (
    <div style={{ display:"flex", alignItems:"center", marginBottom:"36px" }}>
      {labels.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={i} style={{ display:"flex", alignItems:"center", flex: i < labels.length-1 ? 1 : "none" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"5px" }}>
              <div style={{
                width:"30px", height:"30px", borderRadius:"50%",
                background: done ? "#3b82f6" : active ? "#1e3a5f" : "#0a0f1e",
                border:`2px solid ${done?"#3b82f6":active?"#3b82f6":"#1e3a5f"}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"all 0.3s",
                boxShadow: active ? "0 0 14px rgba(59,130,246,0.45)" : "none",
              }}>
                {done
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  : <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"10px", fontWeight:"700", color: active?"#3b82f6":"#334155" }}>{i+1}</span>
                }
              </div>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"8px", color: active?"#3b82f6":done?"#64748b":"#334155", letterSpacing:"0.06em", whiteSpace:"nowrap" }}>
                {label}
              </span>
            </div>
            {i < labels.length-1 && (
              <div style={{ flex:1, height:"2px", margin:"0 8px", marginBottom:"17px", background: done?"#3b82f6":"#1e3a5f", transition:"background 0.3s" }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REUSABLE FIELD COMPONENTS
═══════════════════════════════════════════════════════════════ */
const baseField = {
  width:"100%", background:"#0a0f1e",
  border:"1px solid #1e3a5f", borderRadius:"8px",
  padding:"10px 14px", color:"#e2e8f0",
  fontFamily:"'JetBrains Mono',monospace", fontSize:"12px",
  outline:"none", boxSizing:"border-box",
  transition:"border-color 0.2s, box-shadow 0.2s",
};

function FieldLabel({ children }) {
  return (
    <label style={{ display:"block", fontFamily:"'JetBrains Mono',monospace", fontSize:"10px", color:"#3b82f6", letterSpacing:"0.1em", marginBottom:"7px" }}>
      {children}
    </label>
  );
}

function Field({ as: Tag = "input", label, style, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom:"14px" }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <Tag
        {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...baseField, borderColor: focused?"#3b82f6":"#1e3a5f", boxShadow: focused?"0 0 0 3px rgba(59,130,246,0.15)":"none", ...style }}
      />
    </div>
  );
}

/* SelectField — with automatic "Other" text input */
function SelectField({ label, name, value, onChange, options, otherValue, onOtherChange }) {
  const [focused, setFocused] = useState(false);
  const showOther = value === "Other";
  return (
    <div style={{ marginBottom:"14px" }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <select
        name={name} value={value} onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...baseField,
          borderColor: focused?"#3b82f6":"#1e3a5f",
          boxShadow: focused?"0 0 0 3px rgba(59,130,246,0.15)":"none",
          appearance:"none",
          backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%233b82f6' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center",
          paddingRight:"36px", cursor:"pointer",
        }}
      >
        {options.map(opt => (
          <option key={opt} value={opt === "— select —" ? "" : opt}>
            {opt}
          </option>
        ))}
        <option value="Other">Other</option>
      </select>
      {showOther && (
        <div style={{ marginTop:"8px" }}>
          <Field
            placeholder={`Specify ${label ? label.toLowerCase() : "other"}...`}
            value={otherValue}
            onChange={onOtherChange}
            style={{ marginBottom:0 }}
          />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DURATION UNIT CARD  (Days / Weeks / Months)
═══════════════════════════════════════════════════════════════ */
function UnitCard({ unit, emoji, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex:1, padding:"14px 8px",
        background: selected ? "rgba(59,130,246,0.15)" : "#0a0f1e",
        border:`1.5px solid ${selected?"#3b82f6":"#1e3a5f"}`,
        borderRadius:"10px", cursor:"pointer",
        display:"flex", flexDirection:"column", alignItems:"center", gap:"6px",
        transition:"all 0.2s",
        boxShadow: selected ? "0 0 14px rgba(59,130,246,0.25)" : "none",
      }}
    >
      <span style={{ fontSize:"22px" }}>{emoji}</span>
      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"11px", fontWeight:"700", color: selected?"#3b82f6":"#64748b", letterSpacing:"0.06em" }}>
        {unit}
      </span>
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function SoloTeam() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    // Basic info
    purpose:"", purposeOther:"",
    stack:"", stackOther:"",
    projectType:"", projectTypeOther:"",
    aiUsage:"", aiUsageOther:"",
    domain:"", domainOther:"",
    // Project info
    title:"", description:"", problem:"",
    // Requirements
    functional:"", nonFunctional:"",
    // Timeline
    durationUnit:"",     // "Days" | "Weeks" | "Months"
    durationValue:"",    // the number/amount selected
    durationOther:"",    // free text if they pick custom
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const handleChange = (e) => set(e.target.name, e.target.value);

  /* Duration quick-pick options per unit */
  const durationOptions = {
    Days:   ["1","2","3","5","7","10","14","Other"],
    Weeks:  ["1","2","3","4","6","8","12","Other"],
    Months: ["1","2","3","4","6","9","12","Other"],
  };

  const handleSave = async () => {
    if (!form.title || !form.description) return alert("Title & Description are required");
    if (!form.durationUnit) return alert("Please select a project duration");
    try {
      setSaving(true);
      const user = auth.currentUser;
      if (!user) return alert("Login required");

      const resolve = (val, other) => val === "Other" ? other : val;

      const finalData = {
        purpose:      resolve(form.purpose,      form.purposeOther),
        stack:        resolve(form.stack,         form.stackOther),
        projectType:  resolve(form.projectType,   form.projectTypeOther),
        aiUsage:      resolve(form.aiUsage,       form.aiUsageOther),
        domain:       resolve(form.domain,        form.domainOther),
        title:        form.title,
        description:  form.description,
        problem:      form.problem,
        functional:   form.functional,
        nonFunctional:form.nonFunctional,
        durationUnit: form.durationUnit,
        durationValue:resolve(form.durationValue, form.durationOther),
        createdAt: serverTimestamp(),
        userId: user.uid,
      };

      const docRef = await addDoc(collection(db,"users",user.uid,"projects"), finalData);
      setTimeout(() => navigate(`/project/${docRef.id}`), 2800);
    } catch (err) {
      console.error(err);
      alert("Error saving project");
      setSaving(false);
    }
  };

  /* ── Loading overlay ── */
  if (saving) return (
    <div style={{ minHeight:"100vh", background:"#0a0f1e", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", backgroundImage:"linear-gradient(rgba(59,130,246,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.05) 1px,transparent 1px)", backgroundSize:"40px 40px" }}/>
      <div style={{ position:"absolute", width:"500px", height:"500px", background:"radial-gradient(circle,rgba(37,99,235,0.12) 0%,transparent 70%)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", pointerEvents:"none" }}/>
      <NinjaRobot />
    </div>
  );

  /* ── Sections ── */
  const sections = [
    /* ─ Step 0: Basic Info ─ */
    {
      tag:"01", title:"Basic Info", sub:"project_setup.init()",
      content: (
        <>
          <SelectField label="PURPOSE" name="purpose" value={form.purpose} onChange={handleChange}
            options={["— select —","Practice","College Project","Final Year Project","Startup Idea","Client Project"]}
            otherValue={form.purposeOther} onOtherChange={e => set("purposeOther", e.target.value)}
          />
          <SelectField label="TECH STACK" name="stack" value={form.stack} onChange={handleChange}
            options={["— select —","MERN","MEAN","Java Full Stack","Python",".NET"]}
            otherValue={form.stackOther} onOtherChange={e => set("stackOther", e.target.value)}
          />
          <SelectField label="PROJECT TYPE" name="projectType" value={form.projectType} onChange={handleChange}
            options={["— select —","Frontend","Backend","Full Stack","Mobile App","AI/ML","IoT"]}
            otherValue={form.projectTypeOther} onOtherChange={e => set("projectTypeOther", e.target.value)}
          />
          <SelectField label="AI USAGE" name="aiUsage" value={form.aiUsage} onChange={handleChange}
            options={["— select —","Yes","No","Sometimes"]}
            otherValue={form.aiUsageOther} onOtherChange={e => set("aiUsageOther", e.target.value)}
          />
          <SelectField label="DOMAIN" name="domain" value={form.domain} onChange={handleChange}
            options={["— select —","Healthcare","Traffic","Cybersecurity","Education","Entertainment","Software"]}
            otherValue={form.domainOther} onOtherChange={e => set("domainOther", e.target.value)}
          />
        </>
      ),
    },

    /* ─ Step 1: Project Info ─ */
    {
      tag:"02", title:"Project Info", sub:"project_setup.describe()",
      content: (
        <>
          <Field label="PROJECT TITLE *" name="title" placeholder="e.g. SmartAttend AI..." onChange={handleChange} value={form.title}/>
          <Field label="PROJECT DESCRIPTION *" as="textarea" name="description" placeholder="Describe what your project does..." onChange={handleChange} value={form.description} style={{ minHeight:"100px", resize:"vertical" }}/>
          <Field label="PROBLEM STATEMENT" as="textarea" name="problem" placeholder="What problem does it solve?..." onChange={handleChange} value={form.problem} style={{ minHeight:"90px", resize:"vertical" }}/>
        </>
      ),
    },

    /* ─ Step 2: Requirements ─ */
    {
      tag:"03", title:"Requirements", sub:"project_setup.define()",
      content: (
        <>
          <Field label="FUNCTIONAL REQUIREMENTS" as="textarea" name="functional" placeholder="What the system must do... (optional)" onChange={handleChange} value={form.functional} style={{ minHeight:"110px", resize:"vertical" }}/>
          <Field label="NON-FUNCTIONAL REQUIREMENTS" as="textarea" name="nonFunctional" placeholder="Performance, security, scalability... (optional)" onChange={handleChange} value={form.nonFunctional} style={{ minHeight:"110px", resize:"vertical" }}/>
        </>
      ),
    },

    /* ─ Step 3: Timeline ─ */
    {
      tag:"04", title:"Timeline", sub:"project_setup.schedule()",
      content: (
        <>
          {/* Unit picker */}
          <FieldLabel>DURATION UNIT</FieldLabel>
          <div style={{ display:"flex", gap:"10px", marginBottom:"20px" }}>
            {[
              { unit:"Days",   emoji:"📅" },
              { unit:"Weeks",  emoji:"🗓️" },
              { unit:"Months", emoji:"🌙" },
            ].map(({ unit, emoji }) => (
              <UnitCard
                key={unit} unit={unit} emoji={emoji}
                selected={form.durationUnit === unit}
                onClick={() => { set("durationUnit", unit); set("durationValue",""); set("durationOther",""); }}
              />
            ))}
          </div>

          {/* Value picker — shown once unit is selected */}
          {form.durationUnit && (
            <>
              <FieldLabel>HOW MANY {form.durationUnit.toUpperCase()}?</FieldLabel>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", marginBottom:"14px" }}>
                {durationOptions[form.durationUnit].map(opt => {
                  const isOther   = opt === "Other";
                  const isSelected = form.durationValue === opt;
                  return (
                    <button
                      key={opt} type="button"
                      onClick={() => { set("durationValue", opt); if (!isOther) set("durationOther",""); }}
                      style={{
                        padding:"8px 16px",
                        background: isSelected ? "rgba(59,130,246,0.2)" : "#0a0f1e",
                        border:`1.5px solid ${isSelected?"#3b82f6":"#1e3a5f"}`,
                        borderRadius:"6px", cursor:"pointer",
                        fontFamily:"'JetBrains Mono',monospace",
                        fontSize:"12px", fontWeight:"700",
                        color: isSelected ? "#3b82f6" : "#64748b",
                        transition:"all 0.15s",
                        boxShadow: isSelected ? "0 0 10px rgba(59,130,246,0.2)" : "none",
                      }}
                    >
                      {isOther ? "Custom" : opt}
                    </button>
                  );
                })}
              </div>

              {/* Custom input */}
              {form.durationValue === "Other" && (
                <Field
                  label={`CUSTOM ${form.durationUnit.toUpperCase()} COUNT`}
                  placeholder={`Enter number of ${form.durationUnit.toLowerCase()}...`}
                  value={form.durationOther}
                  onChange={e => set("durationOther", e.target.value)}
                />
              )}

              {/* Summary chip */}
              {(form.durationValue && form.durationValue !== "Other") || form.durationOther ? (
                <div style={{
                  display:"inline-flex", alignItems:"center", gap:"8px",
                  background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.25)",
                  borderRadius:"8px", padding:"8px 16px", marginTop:"4px",
                }}>
                  <span style={{ fontSize:"16px" }}>⏱️</span>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"12px", fontWeight:"700", color:"#3b82f6" }}>
                    {form.durationValue === "Other" ? form.durationOther : form.durationValue} {form.durationUnit}
                  </span>
                </div>
              ) : null}
            </>
          )}
        </>
      ),
    },
  ];

  const { tag, title, sub, content } = sections[step];

  const btnBase = {
    flex:1, padding:"12px 0",
    borderRadius:"8px", cursor:"pointer",
    fontFamily:"'JetBrains Mono',monospace",
    fontSize:"12px", fontWeight:"700", letterSpacing:"0.06em",
    transition:"all 0.2s", border:"none",
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0a0f1e", display:"flex", justifyContent:"center", alignItems:"flex-start", padding:"36px 16px", position:"relative", overflow:"hidden" }}>
      {/* Grid bg */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", backgroundImage:"linear-gradient(rgba(59,130,246,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.05) 1px,transparent 1px)", backgroundSize:"40px 40px" }}/>
      {/* Glow */}
      <div style={{ position:"absolute", width:"700px", height:"400px", background:"radial-gradient(circle,rgba(37,99,235,0.1) 0%,transparent 70%)", top:"-120px", left:"50%", transform:"translateX(-50%)", pointerEvents:"none" }}/>

      <div style={{ position:"relative", zIndex:1, background:"#0f172a", border:"1px solid #1e3a5f", borderRadius:"18px", width:"100%", maxWidth:"640px", padding:"32px 40px", boxShadow:"0 0 80px rgba(59,130,246,0.07)" }}>

        {/* Top bar */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"30px" }}>
          <button
            onClick={() => navigate("/selectteamsize")}
            style={{ display:"flex", alignItems:"center", gap:"6px", background:"none", border:"none", cursor:"pointer", fontFamily:"'JetBrains Mono',monospace", fontSize:"11px", color:"#475569", letterSpacing:"0.06em", padding:0, transition:"color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.color="#3b82f6"}
            onMouseLeave={e => e.currentTarget.style.color="#475569"}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
            back
          </button>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"10px", color:"#3b82f6", background:"rgba(59,130,246,0.1)", border:"1px solid rgba(59,130,246,0.2)", borderRadius:"4px", padding:"3px 10px", letterSpacing:"0.08em" }}>
            solo_mode
          </span>
        </div>

        {/* Step bar */}
        <StepBar current={step} />

        {/* Section header */}
        <div style={{ marginBottom:"22px" }}>
          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"10px", color:"#3b82f6", letterSpacing:"0.1em", marginBottom:"5px" }}>{sub}</div>
          <h1 style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"20px", fontWeight:"700", color:"#e2e8f0", margin:0, letterSpacing:"-0.02em" }}>
            <span style={{ color:"#1e3a5f" }}>{tag}_</span>{title}
          </h1>
        </div>

        {/* Step content */}
        <div style={{ minHeight:"280px" }}>{content}</div>

        {/* Nav */}
        <div style={{ display:"flex", gap:"12px", marginTop:"12px" }}>
          {step > 0 && (
            <button
              onClick={() => setStep(s => s-1)}
              style={{ ...btnBase, background:"transparent", border:"1px solid #1e3a5f", color:"#64748b" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#3b82f6"; e.currentTarget.style.color="#3b82f6"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="#1e3a5f"; e.currentTarget.style.color="#64748b"; }}
            >← prev()</button>
          )}

          {step < sections.length - 1 ? (
            <button
              onClick={() => setStep(s => s+1)}
              style={{ ...btnBase, background:"linear-gradient(135deg,#1d4ed8,#2563eb)", border:"1px solid #3b82f6", color:"#fff", boxShadow:"0 0 20px rgba(59,130,246,0.25)" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow="0 0 30px rgba(59,130,246,0.45)"; e.currentTarget.style.transform="translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow="0 0 20px rgba(59,130,246,0.25)"; e.currentTarget.style.transform="translateY(0)"; }}
            >next() →</button>
          ) : (
            <button
              onClick={handleSave}
              style={{ ...btnBase, background:"linear-gradient(135deg,#1d4ed8,#2563eb)", border:"1px solid #3b82f6", color:"#fff", boxShadow:"0 0 20px rgba(59,130,246,0.25)" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow="0 0 30px rgba(59,130,246,0.5)"; e.currentTarget.style.transform="translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow="0 0 20px rgba(59,130,246,0.25)"; e.currentTarget.style.transform="translateY(0)"; }}
            >save_and_generate() ⚡</button>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign:"center", fontFamily:"'JetBrains Mono',monospace", fontSize:"10px", color:"#334155", letterSpacing:"0.06em", marginTop:"18px", marginBottom:0 }}>
          step {step+1} of {sections.length} — {["basic info","project info","requirements","timeline"][step]}
        </p>
      </div>
    </div>
  );
}