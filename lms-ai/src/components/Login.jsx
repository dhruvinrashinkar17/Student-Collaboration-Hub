import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, provider, db } from "../firebase/firebase";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Fraunces:ital,opsz,wght@0,9..144,300;1,9..144,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .l-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    background: #f9fafc;
    overflow: hidden;
  }

  .l-scene {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .l-card {
    position: relative;
    z-index: 10;
    width: 360px;
    padding: 36px 32px 32px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.038);
    border: 1px solid rgba(255, 255, 255, 0.10);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    box-shadow:
      0 0 0 0.5px rgba(255,255,255,0.06) inset,
      0 40px 100px rgba(0,0,0,0.6),
      0 0 60px rgba(80,120,255,0.06);
    animation: rise 0.65s cubic-bezier(0.22,1,0.36,1) both;
  }

  @keyframes rise {
    from { opacity:0; transform: translateY(24px) scale(0.975); }
    to   { opacity:1; transform: translateY(0) scale(1); }
  }

  .l-eyebrow {
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 3.2px;
    text-transform: uppercase;
    color: rgba(120, 181, 255, 0.91);
    margin-bottom: 8px;
    text-align: center;
  }

  .l-title {
    font-family: 'Fraunces', serif;
   
    font-weight: 400;
    font-size: 26px;
    color: rgba(230, 238, 255, 0.96);
    text-align: center;
    letter-spacing: -0.3px;
    line-height: 1.25;
    margin-bottom: 28px;
  }

  .l-group { margin-bottom: 13px; }

  .l-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.5px;
    color: rgb(251, 251, 251);
    margin-bottom: 6px;
  }

  .l-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 10px;
    padding: 10px 14px;
    color: rgba(225,235,255,0.92);
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 400;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .l-input::placeholder { color: rgba(160,180,220,0.22); }
  .l-input:focus {
    border-color: rgba(100,160,255,0.5);
    background: rgba(80,130,255,0.07);
    box-shadow: 0 0 0 3px rgba(80,130,255,0.12);
  }

  .l-pw { position: relative; }
  .l-pw .l-input { padding-right: 40px; }
  .l-eye {
    position: absolute; right: 12px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    color: rgba(160,185,230,0.38);
    cursor: pointer; display: flex; align-items: center;
    transition: color 0.15s; padding: 0;
  }
  .l-eye:hover { color: rgba(180,210,255,0.72); }

  .l-btn {
    width: 100%;
    margin-top: 18px;
    padding: 11px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 600;
    letter-spacing: 0.2px;
    color: #fff;
    background: linear-gradient(135deg, #3d6ff8 0%, #6a3cf6 100%);
    box-shadow:
      0 6px 24px rgba(70,110,255,0.38),
      0 0 0 1px rgba(255,255,255,0.08) inset;
    transition: opacity 0.18s, transform 0.14s, box-shadow 0.18s;
    position: relative; overflow: hidden;
  }
  .l-btn::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 60%);
    pointer-events: none;
  }
  .l-btn:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 12px 32px rgba(70,110,255,0.48), 0 0 0 1px rgba(255,255,255,0.10) inset;
  }
  .l-btn:active:not(:disabled) { transform: translateY(0); }
  .l-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .l-div { display: flex; align-items: center; gap: 10px; margin: 20px 0; }
  .l-div-line { flex:1; height:1px; background: rgba(255,255,255,0.07); }
  .l-div-text {
    font-size: 10px; letter-spacing: 1.2px;
    text-transform: uppercase;
    color: rgba(160,185,220,0.32);
  }

  .l-gbtn {
    width: 100%;
    padding: 10.5px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.10);
    background: rgba(255,255,255,0.04);
    color: rgba(200,215,245,0.68);
    font-family: 'DM Sans', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 9px;
    transition: border-color 0.2s, background 0.2s, color 0.2s;
  }
  .l-gbtn:hover:not(:disabled) {
    border-color: rgba(255,255,255,0.18);
    background: rgba(255,255,255,0.08);
    color: rgba(225,235,255,0.92);
  }
  .l-gbtn:disabled { opacity: 0.35; cursor: not-allowed; }

  .l-foot {
    text-align: center; margin-top: 22px;
    font-size: 12px; color: rgba(160,185,220,0.40);
  }
  .l-foot a {
    color: rgba(120,165,255,0.80); text-decoration: none;
    font-weight: 600; transition: color 0.15s;
  }
  .l-foot a:hover { color: rgba(160,200,255,0.96); }

  @keyframes spin { to { transform: rotate(360deg); } }
  .l-spin {
    display: inline-block; width: 12px; height: 12px;
    border: 1.5px solid rgba(255,255,255,0.25);
    border-top-color: #fff; border-radius: 50%;
    animation: spin 0.6s linear infinite;
    vertical-align: middle; margin-right: 7px;
  }

  @keyframes drift1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(22px,-28px)} }
  @keyframes drift2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-18px,24px)} }
  @keyframes drift3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(24px,18px)} }
  @keyframes rotSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes pulseDot { 0%,100%{opacity:0.5} 50%{opacity:1} }

  .orb1 { animation: drift1 18s ease-in-out infinite; }
  .orb2 { animation: drift2 22s ease-in-out infinite; }
  .orb3 { animation: drift3 14s ease-in-out infinite; }
  .grid-rot { animation: rotSlow 120s linear infinite; transform-origin: 600px 400px; }
`;

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 48 48" style={{flexShrink:0}}>
      <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.8 20-21 0-1.4-.2-2.7-.5-4z"/>
      <path fill="#34A853" d="M6.3 14.7l7 5.1C15.2 16.1 19.3 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 5.1 29.6 3 24 3c-7.8 0-14.5 4.7-17.7 11.7z"/>
      <path fill="#FBBC05" d="M24 45c5.5 0 10.5-1.9 14.3-5l-6.6-5.4C29.8 36.2 27 37 24 37c-6 0-10.6-3.1-11.7-7.5l-7 5.4C8.2 41 15.5 45 24 45z"/>
      <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-1 3-3.3 5.5-6.2 7.1l6.6 5.4C40.4 37.5 44.5 31.3 44.5 24c0-1.4-.2-2.7-.5-4z"/>
    </svg>
  );
}

function Scene() {
  const dots = [
    [90,80],[280,45],[60,270],[170,460],[390,65],[920,100],[1080,55],
    [1030,230],[1120,400],[960,550],[1060,630],[220,660],[55,570],[380,700],
    [590,35],[690,720],[860,30],[820,690],[480,180],[750,320],[350,520],
    [140,350],[700,480],[530,610],[430,300],
  ];
  const lines = [
    [0,1],[1,4],[5,6],[6,7],[7,8],[11,12],[11,13],[18,19],[2,0],[3,11],
  ];
  return (
    <svg className="l-scene" viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3060ff" stopOpacity="0.48"/>
          <stop offset="100%" stopColor="#3060ff" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="g2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7c3cf5" stopOpacity="0.38"/>
          <stop offset="100%" stopColor="#7c3cf5" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="g3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#18e8e8" stopOpacity="0.26"/>
          <stop offset="100%" stopColor="#18e8e8" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="g4" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e03878" stopOpacity="0.20"/>
          <stop offset="100%" stopColor="#e03878" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="gCard" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4080ff" stopOpacity="0.14"/>
          <stop offset="100%" stopColor="#4080ff" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="vig" cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="transparent"/>
          <stop offset="100%" stopColor="#03060f" stopOpacity="0.82"/>
        </radialGradient>
      </defs>

      <rect width="1200" height="800" fill="#060a17"/>

      {/* rotating grid */}
      <g className="grid-rot">
        {Array.from({length:18}).map((_,i)=>(
          <line key={`h${i}`} x1="0" y1={i*50} x2="1200" y2={i*50}
            stroke="rgba(80,120,255,0.045)" strokeWidth="0.6"/>
        ))}
        {Array.from({length:26}).map((_,i)=>(
          <line key={`v${i}`} x1={i*50} y1="0" x2={i*50} y2="800"
            stroke="rgba(80,120,255,0.045)" strokeWidth="0.6"/>
        ))}
      </g>

      {/* constellation lines */}
      <g stroke="rgba(120,165,255,0.11)" strokeWidth="0.8">
        {lines.map(([a,b],i)=>(
          <line key={i} x1={dots[a][0]} y1={dots[a][1]} x2={dots[b][0]} y2={dots[b][1]}/>
        ))}
      </g>

      {/* dots — some brighter */}
      {dots.map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y}
          r={i%5===0 ? 2.4 : i%3===0 ? 1.8 : 1.3}
          fill={`rgba(160,200,255,${0.15+((i*41)%22)/100})`}
        />
      ))}

      {/* glow behind card center */}
      <ellipse cx="600" cy="400" rx="220" ry="200" fill="url(#gCard)"/>

      {/* animated blobs */}
      <g className="orb1">
        <ellipse cx="160" cy="190" rx="360" ry="290" fill="url(#g1)"/>
      </g>
      <g className="orb2">
        <ellipse cx="1060" cy="610" rx="330" ry="310" fill="url(#g2)"/>
      </g>
      <g className="orb3">
        <ellipse cx="940" cy="120" rx="230" ry="200" fill="url(#g3)"/>
      </g>
      <ellipse cx="195" cy="700" rx="250" ry="210" fill="url(#g4)"/>

      {/* rings */}
      <circle cx="600" cy="400" r="360" fill="none"
        stroke="rgba(80,140,255,0.055)" strokeWidth="1"/>
      <circle cx="600" cy="400" r="510" fill="none"
        stroke="rgba(80,140,255,0.03)" strokeWidth="0.7"/>

      {/* vignette */}
      <rect width="1200" height="800" fill="url(#vig)"/>
    </svg>
  );
}

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const checkUserProfile = async (user) => {
    try {
      const docRef  = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) { navigate("/profilesetup"); return; }
      const data = docSnap.data();
      navigate(data.isProfileComplete ? "/newdashboard" : "/profilesetup");
    } catch (err) {
      console.error("Profile check error:", err);
      alert("Something went wrong");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      onAuthStateChanged(auth, (user) => { if (user) checkUserProfile(user); });
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    try {
      setLoading(true);
      await signInWithPopup(auth, provider);
      onAuthStateChanged(auth, (user) => { if (user) checkUserProfile(user); });
    } catch (err) { console.error(err); alert("Google login failed"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="l-root">
        <Scene />
        <div className="l-card">
          <p className="l-eyebrow">Student Collaboration Hub</p>
          <h1 className="l-title">Welcome back</h1>

          <form onSubmit={handleLogin}>
            <div className="l-group">
              <label className="l-label">Email</label>
              <input type="email" placeholder="you@university.edu"
                className="l-input" value={email}
                onChange={(e) => setEmail(e.target.value)}/>
            </div>
            <div className="l-group">
              <label className="l-label">Password</label>
              <div className="l-pw">
                <input type={show ? "text" : "password"} placeholder="••••••••"
                  className="l-input" value={password}
                  onChange={(e) => setPassword(e.target.value)}/>
                <button type="button" onClick={() => setShow(!show)} className="l-eye">
                  {show ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
            </div>
            <button className="l-btn" disabled={loading}>
              {loading && <span className="l-spin"/>}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="l-div">
            <div className="l-div-line"/>
            <span className="l-div-text">or</span>
            <div className="l-div-line"/>
          </div>

          <button onClick={handleGoogleLogin} className="l-gbtn" disabled={loading}>
            <GoogleIcon/>
            Continue with Google
          </button>

          <p className="l-foot">
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </>
  );
}