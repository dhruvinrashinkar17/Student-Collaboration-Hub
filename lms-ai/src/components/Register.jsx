import { useState } from "react";
import { auth } from "../firebase/firebase";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,500;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .r-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Sora', sans-serif;
    position: relative;
    background: #080c18;
    overflow: hidden;
  }

  .r-scene {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .r-card {
    position: relative;
    z-index: 10;
    width: 350px;
    padding: 34px 30px 30px;
    border-radius: 18px;
    background: rgba(255,255,255,0.042);
    border: 1px solid rgba(255,255,255,0.09);
    backdrop-filter: blur(32px);
    -webkit-backdrop-filter: blur(32px);
    box-shadow:
      0 0 0 0.5px rgba(255,255,255,0.055) inset,
      0 36px 80px rgba(0,0,0,0.55);
    animation: rise 0.6s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes rise {
    from { opacity:0; transform: translateY(20px) scale(0.978); }
    to   { opacity:1; transform: translateY(0) scale(1); }
  }

  .r-eyebrow {
    font-size: 9.5px;
    font-weight: 900;
    letter-spacing: 2.8px;
    text-transform: uppercase;
    color: rgba(130, 159, 255, 0.83);
    margin-bottom: 7px;
    text-align: center;
  }
  .r-title {
    font-family: 'Playfair Display', serif;

    font-weight: 400;
    font-size: 21px;
    color: rgba(225,232,255,0.90);
    text-align: center;
    letter-spacing: -0.2px;
    line-height: 1.3;
    margin-bottom: 24px;
  }

  .r-group { margin-bottom: 11px; }
  .r-label {
    display: block;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.9px;
    text-transform: uppercase;
    color: rgb(255, 255, 255);
    margin-bottom: 5px;
  }
  .r-input {
    width: 100%;
    background: rgba(255,255,255,0.045);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 9px;
    padding: 9px 13px;
    color: rgba(220,228,255,0.88);
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    font-weight: 300;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
  }
  .r-input::placeholder { color: rgba(180,190,220,0.2); }
  .r-input:focus {
    border-color: rgba(100,140,255,0.4);
    background: rgba(100,140,255,0.055);
  }
  .r-input.err { border-color: rgba(255,90,110,0.42); }
  .r-input.ok  { border-color: rgba(60,210,140,0.42); }

  /* ── password wrapper with interactive eye ── */
  .r-pw { position: relative; }
  .r-pw .r-input { padding-right: 42px; }

  .r-eye-btn {
    position: absolute; right: 10px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    padding: 5px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 6px;
    transition: background 0.15s;
    outline: none;
  }
  .r-eye-btn:hover { background: rgba(255,255,255,0.07); }
  .r-eye-btn:active { transform: translateY(-50%) scale(0.88); }

  /* icon morphs between states */
  .r-eye-icon {
    display: block;
    transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), opacity 0.18s;
    color: rgba(180,190,220,0.35);
  }
  .r-eye-btn:hover .r-eye-icon {
    color: rgba(180,190,220,0.75);
    transform: scale(1.18);
  }
  .r-eye-btn.active .r-eye-icon {
    color: rgba(110,155,255,0.85);
    transform: scale(1.1);
  }
  .r-eye-btn.active:hover .r-eye-icon {
    transform: scale(1.22);
  }

  /* ── strength bar ── */
  .r-strength {
    margin-top: 6px;
    display: flex; align-items: center; gap: 8px;
  }
  .r-strength-bars {
    display: flex; gap: 3px; flex: 1;
  }
  .r-bar {
    flex: 1; height: 3px; border-radius: 2px;
    background: rgba(255,255,255,0.07);
    transition: background 0.3s;
  }
  .r-bar.weak   { background: rgba(255,90,110,0.72); }
  .r-bar.medium { background: rgba(255,190,60,0.72); }
  .r-bar.strong { background: rgba(60,210,140,0.72); }
  .r-strength-text {
    font-size: 10px; font-weight: 500; letter-spacing: 0.5px;
    min-width: 42px; text-align: right;
    transition: color 0.3s;
  }
  .r-strength-text.weak   { color: rgba(255,100,120,0.80); }
  .r-strength-text.medium { color: rgba(255,195,70,0.80); }
  .r-strength-text.strong { color: rgba(60,210,140,0.80); }

  /* ── match hint ── */
  .r-hint {
    font-size: 10.5px; font-weight: 400;
    margin-top: 5px;
    transition: color 0.2s;
    display: flex; align-items: center; gap: 5px;
  }
  .r-hint.ok  { color: rgba(60,210,140,0.78); }
  .r-hint.err { color: rgba(255,90,110,0.75); }
  .r-hint-dot {
    width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0;
    transition: background 0.2s;
  }
  .r-hint.ok  .r-hint-dot { background: rgba(60,210,140,0.78); }
  .r-hint.err .r-hint-dot { background: rgba(255,90,110,0.75); }

  /* ── primary button ── */
  .r-btn {
    width: 100%;
    margin-top: 16px;
    padding: 10.5px;
    border: none; border-radius: 9px; cursor: pointer;
    font-family: 'Sora', sans-serif;
    font-size: 13px; font-weight: 500; letter-spacing: 0.3px;
    color: #fff;
    background: linear-gradient(135deg, #4a6cf7 0%, #7a3ff5 100%);
    box-shadow: 0 6px 22px rgba(80,100,255,0.32);
    transition: opacity 0.18s, transform 0.14s, box-shadow 0.18s;
    position: relative; overflow: hidden;
  }
  .r-btn::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(255,255,255,0.10) 0%, transparent 100%);
    pointer-events: none;
  }
  .r-btn:hover:not(:disabled) {
    opacity: 0.88; transform: translateY(-1px);
    box-shadow: 0 10px 30px rgba(80,100,255,0.42);
  }
  .r-btn:active:not(:disabled) { transform: translateY(0); }
  .r-btn:disabled { opacity: 0.42; cursor: not-allowed; }

  .r-foot {
    text-align: center; margin-top: 20px;
    font-size: 11.5px; color: rgba(180,190,220,0.32);
  }
  .r-foot a {
    color: rgba(130,155,255,0.7); text-decoration: none;
    font-weight: 500; transition: color 0.15s;
  }
  .r-foot a:hover { color: rgba(160,185,255,0.92); }

  /* ── background animations ── */
  @keyframes drift1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,-24px)} }
  @keyframes drift2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-16px,22px)} }
  @keyframes drift3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(22px,16px)} }
  @keyframes rotSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  .orb1 { animation: drift1 16s ease-in-out infinite; }
  .orb2 { animation: drift2 20s ease-in-out infinite; }
  .orb3 { animation: drift3 13s ease-in-out infinite; }
  .grid-rot { animation: rotSlow 100s linear infinite; transform-origin: 600px 400px; }
`;

function Scene() {
  const dots = [
    [90,80],[280,45],[60,270],[170,460],[390,65],[920,100],[1080,55],
    [1030,230],[1120,400],[960,550],[1060,630],[220,660],[55,570],[380,700],
    [590,35],[690,720],[860,30],[820,690],[480,180],[750,320],[350,520],
  ];
  const lines = [[0,1],[1,4],[5,6],[6,7],[7,8],[11,12],[11,13],[18,19]];
  return (
    <svg className="r-scene" viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="rg1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3a5af9" stopOpacity="0.40"/>
          <stop offset="100%" stopColor="#3a5af9" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="rg2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8b3ff5" stopOpacity="0.32"/>
          <stop offset="100%" stopColor="#8b3ff5" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="rg3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1ecfcf" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="#1ecfcf" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="rg4" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e04080" stopOpacity="0.17"/>
          <stop offset="100%" stopColor="#e04080" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="rvig" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="transparent"/>
          <stop offset="100%" stopColor="#04060e" stopOpacity="0.80"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="800" fill="#080c18"/>
      <g className="grid-rot">
        {Array.from({length:18}).map((_,i)=>(
          <line key={`h${i}`} x1="0" y1={i*50} x2="1200" y2={i*50}
            stroke="rgba(90,110,255,0.04)" strokeWidth="0.7"/>
        ))}
        {Array.from({length:26}).map((_,i)=>(
          <line key={`v${i}`} x1={i*50} y1="0" x2={i*50} y2="800"
            stroke="rgba(90,110,255,0.04)" strokeWidth="0.7"/>
        ))}
      </g>
      <g stroke="rgba(110,140,255,0.09)" strokeWidth="0.8">
        {lines.map(([a,b],i)=>(
          <line key={i} x1={dots[a][0]} y1={dots[a][1]} x2={dots[b][0]} y2={dots[b][1]}/>
        ))}
      </g>
      {dots.map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={i%4===0?2:1.4}
          fill={`rgba(150,175,255,${0.13+((i*37)%20)/100})`}/>
      ))}
      <g className="orb1"><ellipse cx="160" cy="190" rx="340" ry="270" fill="url(#rg1)"/></g>
      <g className="orb2"><ellipse cx="1060" cy="610" rx="310" ry="290" fill="url(#rg2)"/></g>
      <g className="orb3"><ellipse cx="920" cy="130" rx="210" ry="190" fill="url(#rg3)"/></g>
      <ellipse cx="190" cy="690" rx="230" ry="190" fill="url(#rg4)"/>
      <circle cx="600" cy="400" r="350" fill="none" stroke="rgba(90,120,255,0.05)" strokeWidth="1"/>
      <circle cx="600" cy="400" r="500" fill="none" stroke="rgba(90,120,255,0.03)" strokeWidth="0.7"/>
      <rect width="1200" height="800" fill="url(#rvig)"/>
    </svg>
  );
}

function getStrength(pass) {
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  if (score <= 1) return { label: "Weak",   key: "weak",   filled: 1 };
  if (score <= 3) return { label: "Medium", key: "medium", filled: 2 };
  return              { label: "Strong", key: "strong", filled: 3 };
}

export default function Register() {
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass,        setShowPass]        = useState(false);
  const navigate = useNavigate();

  const isMatch  = password === confirmPassword;
  const strength = getStrength(password);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isMatch) { alert("Passwords do not match"); return; }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await signOut(auth);
      navigate("/login");
    } catch (error) { alert(error.message); }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="r-root">
        <Scene />
        <div className="r-card">
          <p className="r-eyebrow">Student Collaboration Hub</p>
          <h1 className="r-title">Create your account</h1>

          <form onSubmit={handleRegister}>

            {/* Email */}
            <div className="r-group">
              <label className="r-label">Email</label>
              <input type="email" placeholder="you@university.edu"
                className="r-input" value={email}
                onChange={(e) => setEmail(e.target.value)} required/>
            </div>

            {/* Password */}
            <div className="r-group">
              <label className="r-label">Password</label>
              <div className="r-pw">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  className="r-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={`r-eye-btn${showPass ? " active" : ""}`}
                  onClick={() => setShowPass(v => !v)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  <span className="r-eye-icon">
                    {showPass ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </span>
                </button>
              </div>

              {/* Strength bars */}
              {password && (
                <div className="r-strength">
                  <div className="r-strength-bars">
                    {[1,2,3].map(n => (
                      <div key={n} className={`r-bar${n <= strength.filled ? ` ${strength.key}` : ""}`}/>
                    ))}
                  </div>
                  <span className={`r-strength-text ${strength.key}`}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="r-group">
              <label className="r-label">Confirm Password</label>
              <input
                type="password"
                placeholder="Repeat password"
                className={`r-input${confirmPassword ? (isMatch ? " ok" : " err") : ""}`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && (
                <div className={`r-hint${isMatch ? " ok" : " err"}`}>
                  <span className="r-hint-dot"/>
                  {isMatch ? "Passwords match" : "Passwords do not match"}
                </div>
              )}
            </div>

            <button className="r-btn" type="submit">
              Create Account
            </button>
          </form>

          <p className="r-foot">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}