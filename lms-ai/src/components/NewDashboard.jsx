import { useEffect, useState, useRef } from 'react';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { query, where, getDocs, collection ,onSnapshot } from "firebase/firestore";
import {
  X,
  Pencil,
  BrainCircuit,
  Cpu,
  Video,
  CloudOff,
  Sparkles,
  Wifi,
  ArrowRight,
  Zap,
  Users,
  Code,
  Shield,
  Rocket,
  Moon,
  Sun,
  Menu,
} from 'lucide-react';
import { Bell } from 'lucide-react';
function useTyping(phrases, speed = 60, pause = 2200) {
  const [text, setText] = useState('');
  const [idx, setIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[idx % phrases.length];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(current.slice(0, text.length + 1));
        if (text.length + 1 === current.length)
          setTimeout(() => setDeleting(true), pause);
      } else {
        setText(current.slice(0, text.length - 1));
        if (text.length - 1 === 0) {
          setDeleting(false);
          setIdx((i) => i + 1);
        }
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [text, deleting, idx, phrases, speed, pause]);

  return text;
}

const BENEFITS = [
  {
    icon: CloudOff,
    title: 'Zero Local Storage',
    desc: 'All your projects live in the cloud. Switch devices, keep working.',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    color: '#06b6d4',
  },
  {
    icon: BrainCircuit,
    title: 'AI Recommendations',
    desc: 'Smart suggestions for teammates, tech stacks, and timelines.',
    gradient: 'from-purple-500/20 to-pink-500/20',
    color: '#a855f7',
  },
  {
    icon: Video,
    title: 'Built-in Video Calls',
    desc: 'Hop on a call without leaving your workspace.',
    gradient: 'from-rose-500/20 to-red-500/20',
    color: '#f43f5e',
  },
  {
    icon: Sparkles,
    title: 'Instant Summaries',
    desc: 'AI condenses long threads so you never lose context.',
    gradient: 'from-yellow-500/20 to-orange-500/20',
    color: '#fbbf24',
  },
  {
    icon: Cpu,
    title: 'No Hardware Cost',
    desc: 'Run compute-heavy tasks on our servers, not your laptop.',
    gradient: 'from-indigo-500/20 to-purple-500/20',
    color: '#6366f1',
  },
  {
    icon: Wifi,
    title: 'Real-time Sync',
    desc: 'Every keystroke synced across your whole team instantly.',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    color: '#10b981',
  },
];

function RotatingRobot() {
  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <svg
        viewBox="0 0 300 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[240px] robot-rotate drop-shadow-2xl"
      >
        <ellipse cx="150" cy="300" rx="90" ry="16" fill="#6366f1" opacity="0.25" />
        <rect x="70" y="140" width="160" height="130" rx="24" fill="#1e1b4b" opacity="0.85" />
        <rect x="80" y="150" width="140" height="110" rx="18" fill="#312e81" opacity="0.7" />
        <rect x="95" y="162" width="110" height="72" rx="10" fill="#0f172a" />
        <rect x="100" y="167" width="100" height="62" rx="8" fill="#0ea5e9" opacity="0.12" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect
            key={i}
            x={108}
            y={175 + i * 11}
            width={i % 2 === 0 ? 60 : 40}
            height={5}
            rx={2}
            fill={i === 0 ? '#6366f1' : i === 2 ? '#0ea5e9' : '#475569'}
            opacity="0.9"
          />
        ))}
        <rect x="90" y="60" width="120" height="90" rx="26" fill="#1e1b4b" opacity="0.9" />
        <circle cx="128" cy="100" r="14" fill="#0f172a" />
        <circle cx="172" cy="100" r="14" fill="#0f172a" />
        <circle cx="128" cy="100" r="8" fill="#6366f1" />
        <circle cx="172" cy="100" r="8" fill="#0ea5e9" />
        <circle cx="131" cy="97" r="3" fill="white" opacity="0.7" />
        <circle cx="175" cy="97" r="3" fill="white" opacity="0.7" />
        <line x1="150" y1="60" x2="150" y2="36" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
        <circle cx="150" cy="30" r="8" fill="#6366f1" />
        <circle cx="150" cy="30" r="4" fill="white" opacity="0.6" />
        <rect x="124" y="122" width="52" height="10" rx="5" fill="#6366f1" opacity="0.7" />
        <rect x="130" y="124" width="10" height="6" rx="2" fill="white" opacity="0.4" />
        <rect x="145" y="124" width="10" height="6" rx="2" fill="white" opacity="0.4" />
        <rect x="160" y="124" width="10" height="6" rx="2" fill="white" opacity="0.4" />
        <rect x="30" y="150" width="40" height="22" rx="11" fill="#312e81" opacity="0.8" />
        <rect x="230" y="150" width="40" height="22" rx="11" fill="#312e81" opacity="0.8" />
        <rect x="100" y="275" width="100" height="22" rx="6" fill="#1e1b4b" opacity="0.85" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect
            key={i}
            x={107 + i * 12}
            y={280}
            width={8}
            height={10}
            rx={2}
            fill="#6366f1"
            opacity="0.5"
          />
        ))}
      </svg>
    </div>
  );
}

function ProfileRow({ label, value, darkMode }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={`text-xs uppercase tracking-widest font-semibold ${
          darkMode ? 'text-indigo-400' : 'text-indigo-600'
        }`}
      >
        {label}
      </span>
      <span
        className={`text-sm font-medium truncate ${
          darkMode ? 'text-gray-200' : 'text-gray-700'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, gradient, color, delay, darkMode }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border backdrop-blur-xl p-6 transition-all duration-500 cursor-pointer ${
        darkMode
          ? 'border-white/10 bg-[#111827] hover:border-white/20'
          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
      }`}
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="relative z-10">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${
            darkMode ? 'bg-white/5 group-hover:bg-white/10' : 'bg-gray-200 group-hover:bg-gray-300'
          }`}
          style={{ color }}
        >
          <Icon size={24} />
        </div>
        <h3
          className={`font-semibold text-base mb-2 transition-colors ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          {title}
        </h3>
        <p
          className={`text-sm leading-relaxed transition-colors ${
            darkMode
              ? 'text-gray-400 group-hover:text-gray-300'
              : 'text-gray-600 group-hover:text-gray-700'
          }`}
        >
          {desc}
        </p>
      </div>
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl ${
          darkMode
            ? 'bg-gradient-to-br from-white/10 to-transparent'
            : 'bg-gradient-to-br from-gray-200/20 to-transparent'
        }`}
      />
    </div>
  );
}

export default function Dashboard() {
  const [notificationCount, setNotificationCount] = useState(0);
  const [profile, setProfile] = useState(null);
  const [openSlider, setOpenSlider] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const heroRef = useRef(null);
  const navigate = useNavigate();

  const typed = useTyping([
    'Build faster than ever before',
    'Ship code. Change the world.',
    'Collaborate with zero friction.',
  ]);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    try {
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        setProfile(snap.data());
      } else {
        console.log("No profile found in DB");
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  });

  return () => unsubscribe();
}, []);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("toUserId", "==", user.uid),
      where("status", "==", "pending")
    );

    const unsubNotifications = onSnapshot(q, (snapshot) => {
      setNotificationCount(snapshot.size);
    });

    return () => unsubNotifications();
  });

  return () => unsubscribe();
}, []);
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const initials = profile?.fullName
    ? profile.fullName
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  const handleLogout = () => {
    alert('Logout functionality to be implemented');
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 overflow-hidden ${
        darkMode
          ? 'bg-gradient-to-b from-[#0a0e27] via-[#0f1629] to-[#0a0e27] text-white'
          : 'bg-gradient-to-b from-white via-gray-50 to-white text-gray-900'
      }`}
    >
      <div className="fixed inset-0 pointer-events-none">
        {darkMode ? (
          <>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: '1s' }}
            />
          </>
        ) : (
          <>
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: '1s' }}
            />
          </>
        )}
      </div>

<nav
  className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
    scrollPosition > 50
      ? darkMode
        ? "bg-[#0a0e27]/90 backdrop-blur-xl border-b border-white/5"
        : "bg-white/90 backdrop-blur-xl border-b border-gray-200"
      : "bg-transparent border-b border-transparent"
  }`}
>
  <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
    <div className="flex items-center gap-2 group">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
        <Cpu size={20} className="text-white" />
      </div>
      <span
        className={`font-display font-bold text-xl ${
          darkMode
            ? "bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent"
            : "text-indigo-600"
        }`}
      >
        StudentCollabHub
      </span>
    </div>

    <div className="hidden md:flex items-center gap-8">
      <a
        href="#features"
        className={`text-sm font-medium ${
          darkMode
            ? "text-gray-300 hover:text-white"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Platform
      </a>

      <a
        href="#benefits"
        className={`text-sm font-medium ${
          darkMode
            ? "text-gray-300 hover:text-white"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Why Us
      </a>

      <Link
        to="/storedprojects"
        className={`text-sm font-medium ${
          darkMode
            ? "text-gray-300 hover:text-white"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Your Projects
      </Link>
    </div>

    <div className="flex items-center gap-4">

      {/* 🔔 Notification Bell */}
      <Link
        to="/notifications"
        className="relative"
      >
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            darkMode
              ? "bg-white/10 hover:bg-white/20 text-white"
              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
          }`}
        >
          <Bell size={18} />
        </div>

        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {notificationCount}
          </span>
        )}
      </Link>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          darkMode
            ? "bg-white/10 hover:bg-white/20"
            : "bg-gray-200 hover:bg-gray-300"
        }`}
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <button
        onClick={() => setOpenSlider(true)}
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold"
      >
        {initials}
      </button>
    </div>
  </div>
</nav>

      <section ref={heroRef} className="relative pt-32 pb-20 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold mb-6 group hover:border-indigo-500/50 transition-all duration-300 ${
                darkMode
                  ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20'
                  : 'border-indigo-300 bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              Welcome Back, {profile?.fullName?.split(' ')[0] || 'Builder'}
            </div>

            <h1
              className={`font-display text-6xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Build.{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Ship.
              </span>
              <br />
              <span>Scale.</span>
            </h1>

            <p
              className={`text-lg md:text-xl mb-8 font-medium h-8 flex items-center ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              <span className="inline-flex gap-2">
                {typed}
                <span className="cursor-type text-indigo-400">|</span>
              </span>
            </p>

            <p
              className={`text-base mb-8 leading-relaxed max-w-xl ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              The ultimate platform for student teams to collaborate, build projects, and ship code
              together. Real-time sync, AI-powered insights, and zero friction.
            </p>
<div className="flex flex-col md:flex-row gap-4 justify-center items-center">

  {/* 🚀 Start Shipping */}
  <button
    onClick={() => navigate('/selectteamsize')}
    className="relative px-10 py-4 rounded-xl font-semibold text-white 
    bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500
    overflow-hidden transition-all duration-300
    hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]"
  >
    <span className="relative z-10">Start Shipping</span>

    {/* Shine Effect */}
    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
    translate-x-[-100%] group-hover:translate-x-[100%] transition duration-700"></span>
  </button>

  {/* 💻 Explore Team */}
  <button
    onClick={() => navigate('/aimatchmake')}
    className="relative px-10 py-4 rounded-xl font-semibold text-white
    border border-cyan-400/30 bg-white/5 backdrop-blur-md
    overflow-hidden transition-all duration-300
    hover:border-cyan-400 hover:scale-105
    hover:shadow-[0_0_25px_rgba(34,211,238,0.5)]"
  >
    <span className="relative z-10">Create Team</span>

    {/* Glow Overlay */}
    <span className="absolute inset-0 bg-cyan-400/10 opacity-0 hover:opacity-100 transition duration-300"></span>
  </button>

  {/* 🤖 Explore AI Team */}
  <button
    onClick={() => navigate('/storedprojects')}
    className="relative px-10 py-4 rounded-xl font-semibold text-white
    border border-purple-400/30 bg-white/5 backdrop-blur-md
    overflow-hidden transition-all duration-300
    hover:border-purple-400 hover:scale-105
    hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]"
  >
    <span className="relative z-10">Explore Projects</span>

    {/* Glow Overlay */}
    <span className="absolute inset-0 bg-purple-400/10 opacity-0 hover:opacity-100 transition duration-300"></span>
  </button>

</div>

            <div
              className={`flex gap-8 mt-12 pt-8 border-t ${
                darkMode ? 'border-white/10' : 'border-gray-300'
              }`}
            >
              <div>
                <div className={`text-2xl font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  10K+
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Active Builders
                </div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                  50K+
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Projects Built
                </div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  99.9%
                </div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Uptime SLA
                </div>
              </div>
            </div>
          </div>

          <div
            className={`relative h-96 rounded-2xl overflow-hidden border backdrop-blur-xl group ${
              darkMode
                ? 'border-white/10 bg-gradient-to-br from-indigo-500/10 to-blue-500/5'
                : 'border-gray-300 bg-gradient-to-br from-indigo-100/30 to-blue-100/20'
            }`}
          >
            <RotatingRobot />
            <div
              className={`absolute inset-0 pointer-events-none ${
                darkMode ? 'bg-gradient-to-t from-[#0a0e27] to-transparent' : 'bg-gradient-to-t from-white to-transparent'
              }`}
            />
            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl ${
                darkMode
                  ? 'bg-gradient-to-br from-indigo-500/20 to-transparent'
                  : 'bg-gradient-to-br from-indigo-300/20 to-transparent'
              }`}
            />
          </div>
        </div>
      </section>

      <section id="benefits" className={`relative py-20 px-6 md:px-10 max-w-7xl mx-auto ${darkMode ? 'bg-transparent' : 'bg-gray-100/50'}`}>
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-blue-500" />
            <span className={`text-sm font-bold uppercase tracking-widest ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
              Why Choose Us
            </span>
          </div>
          <h2 className={`font-display text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Built for Builders
          </h2>
          <p className={`text-lg max-w-2xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Everything you need to ship amazing projects as a team. From collaboration to deployment,
            we've got you covered.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((benefit, i) => (
            <FeatureCard
              key={i}
              icon={benefit.icon}
              title={benefit.title}
              desc={benefit.desc}
              gradient={benefit.gradient}
              color={benefit.color}
              delay={i}
              darkMode={darkMode}
            />
          ))}
        </div>
      </section>

      <section id="features" className={`relative py-20 px-6 md:px-10 max-w-7xl mx-auto ${darkMode ? 'bg-transparent' : 'bg-white'}`}>
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500" />
            <span className={`text-sm font-bold uppercase tracking-widest ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              Platform Features
            </span>
          </div>
          <h2 className={`font-display text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Powerful Tools for Teams
          </h2>
          <p className={`text-lg max-w-2xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Everything your team needs to collaborate effectively, from real-time coding to AI-powered
            assistance and integrated communication.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Users, title: 'Team Collaboration', desc: 'Work together seamlessly with real-time updates.', color: '#0ea5e9' },
            { icon: BrainCircuit, title: 'AI Assistant', desc: 'Get intelligent code suggestions and automated fixes.', color: '#a855f7' },
            { icon: Shield, title: 'Secure & Fast', desc: 'Enterprise-grade security with sub-millisecond latency.', color: '#10b981' },
            { icon: Video, title: 'Built-in Calls', desc: 'Crystal clear video and audio calls integrated.', color: '#f43f5e' },
            { icon: Zap, title: 'Instant Deploy', desc: 'Deploy your projects instantly with zero configuration.', color: '#fbbf24' },
            { icon: Wifi, title: 'Real-time Sync', desc: 'All changes sync instantly across your team.', color: '#14b8a6' },
          ].map((feature, i) => (
            <div
              key={i}
              className={`group p-6 rounded-2xl border transition-all duration-300 ${
                darkMode
                  ? 'bg-[#111827] border-white/10 hover:border-white/20'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
                  darkMode ? 'bg-white/5' : 'bg-gray-200'
                }`}
                style={{ color: feature.color }}
              >
                <feature.icon size={24} />
              </div>
              <h3 className={`font-semibold text-base mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {feature.title}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className={`relative py-20 px-6 md:px-10 max-w-7xl mx-auto ${darkMode ? 'bg-transparent' : 'bg-gray-100/50'}`}>
        <div
          className={`relative rounded-3xl overflow-hidden border backdrop-blur-xl p-12 md:p-16 group hover:border-white/20 transition-all duration-500 ${
            darkMode
              ? 'border-white/10 bg-gradient-to-br from-indigo-500/10 to-blue-500/5'
              : 'border-gray-300 bg-gradient-to-br from-indigo-100/30 to-blue-100/20'
          }`}
        >
          <div
            className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
              darkMode
                ? 'bg-gradient-to-br from-indigo-500/10 to-transparent'
                : 'bg-gradient-to-br from-indigo-200/20 to-transparent'
            }`}
          />
          <div className="relative z-10 text-center">
            <div className="flex justify-center mb-6">
              <Rocket size={48} className={`animate-float ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            </div>
            <h2
              className={`font-display text-4xl md:text-5xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Ready to Ship?
            </h2>
            <p className={`text-lg mb-8 max-w-2xl mx-auto ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Join thousands of student teams building amazing projects together. Start collaborating
              today with zero setup friction.
            </p>
            <button
              onClick={() => navigate('/selectteamsize')}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl font-semibold text-white hover:shadow-2xl hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300"
            >
              <Zap size={18} />
              Start Shipping Now
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      <footer
        className={`border-t mt-20 py-8 px-6 md:px-10 ${
          darkMode ? 'border-white/5 bg-transparent' : 'border-gray-300 bg-gray-50'
        }`}
      >
        <div
          className={`max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm ${
            darkMode ? 'text-gray-500' : 'text-gray-600'
          }`}
        >
          <p>© 2025 StudentCollabHub · Built for builders by builders</p>
          <div className="flex gap-6">
            <a
              href="#"
              className={`transition-colors ${darkMode ? 'hover:text-gray-300' : 'hover:text-gray-900'}`}
            >
              Docs
            </a>
            <a
              href="#"
              className={`transition-colors ${darkMode ? 'hover:text-gray-300' : 'hover:text-gray-900'}`}
            >
              Privacy
            </a>
            <a
              href="#"
              className={`transition-colors ${darkMode ? 'hover:text-gray-300' : 'hover:text-gray-900'}`}
            >
              Terms
            </a>
          </div>
        </div>
      </footer>

      {openSlider && (
        <div
          className={`fixed inset-0 z-40 backdrop-blur-sm transition-opacity duration-300 ${
            darkMode ? 'bg-black/50' : 'bg-black/30'
          }`}
          onClick={() => setOpenSlider(false)}
        />
      )}

      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-96 flex flex-col transform transition-transform duration-300 ease-out ${
          openSlider ? 'translate-x-0' : 'translate-x-full'
        } ${
          darkMode
            ? 'bg-gradient-to-b from-[#0d1117] to-[#0a0e27]'
            : 'bg-gradient-to-b from-white to-gray-50'
        }`}
      >
        <div className={`flex items-center justify-between px-6 py-6 border-b ${darkMode ? 'border-white/10' : 'border-gray-300'}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>
            <div>
              <p className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {profile?.fullName || 'Loading...'}
              </p>
              <p className={`text-xs font-medium ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                {profile?.role || 'Student'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpenSlider(false)}
            className={`w-9 h-9 rounded-lg transition-colors flex items-center justify-center ${
              darkMode
                ? 'bg-white/10 hover:bg-red-500/20 text-white'
                : 'bg-gray-200 hover:bg-red-200 text-gray-700'
            }`}
          >
            <X size={18} />
          </button>
        </div>

     <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
  {profile ? (
    <>
      <div className="grid grid-cols-2 gap-4">
        <ProfileRow label="Email" value={profile?.email || ""} darkMode={darkMode} />
        <ProfileRow label="Role" value={profile?.role || ""} darkMode={darkMode} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ProfileRow label="Domain" value={profile?.domain || ""} darkMode={darkMode} />
        <ProfileRow label="Experience" value={profile?.experience || ""} darkMode={darkMode} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ProfileRow label="College" value={profile?.college || ""} darkMode={darkMode} />
        <ProfileRow label="Country" value={profile?.country || ""} darkMode={darkMode} />
      </div>

      <ProfileRow label="Course" value={profile?.course || ""} darkMode={darkMode} />
      <ProfileRow label="Education Level" value={profile?.educationLevel || ""} darkMode={darkMode} />
      <ProfileRow label="Team Mode" value={profile?.teamMode || ""} darkMode={darkMode} />

      {profile?.bio && (
        <div>
          <span
            className={`text-xs uppercase tracking-widest font-semibold ${
              darkMode ? 'text-indigo-400' : 'text-indigo-600'
            }`}
          >
            Bio
          </span>
          <p
            className={`text-sm mt-2 leading-relaxed ${
              darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}
          >
            {profile.bio}
          </p>
        </div>
      )}
    </>
  ) : (
    <div className="flex items-center justify-center h-full">
      <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
        Loading profile...
      </p>
    </div>
  )}
</div>

<div
  className={`px-6 pb-6 pt-4 border-t space-y-3 ${
    darkMode ? 'border-white/10' : 'border-gray-300'
  }`}
>
  <button
    onClick={() => {
      setOpenSlider(false);
      navigate('/updateprofile');
    }}
    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg hover:shadow-green-500/40 hover:scale-105 transition-all duration-300"
  >
    <Pencil size={16} />
    Update Profile
  </button>

  <button
    onClick={handleLogout}
    className={`w-full py-3 rounded-xl font-semibold border transition-all duration-300 ${
      darkMode
        ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30 hover:border-red-500/50'
        : 'bg-red-100 hover:bg-red-200 text-red-700 border-red-300 hover:border-red-400'
    }`}
  >
    Logout
  </button>
</div>
      </aside>
    </div>
  );
}
