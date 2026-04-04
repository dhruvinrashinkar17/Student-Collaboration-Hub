import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function StoredProjects() {
  const [teamProjects, setTeamProjects] = useState([]);
  const [soloProjects, setSoloProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("team");

  useEffect(() => {
    let unsubOwned = null;
    let unsubMember = null;
    let unsubSolo = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      // TEAM - created
      const ownedQuery = query(
        collection(db, "teams"),
        where("createdBy", "==", user.uid)
      );

      // TEAM - member
      const memberQuery = query(
        collection(db, "teams"),
        where("members", "array-contains", user.uid)
      );

      // SOLO
      const soloQuery = query(
        collection(db, "projects"),
        where("createdBy", "==", user.uid)
      );

      let owned = [];
      let member = [];

      unsubOwned = onSnapshot(ownedQuery, (snap) => {
        owned = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        merge();
      });

      unsubMember = onSnapshot(memberQuery, (snap) => {
        member = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        merge();
      });

      unsubSolo = onSnapshot(soloQuery, (snap) => {
        const solo = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSoloProjects(solo);
        setLoading(false);
      });

      function merge() {
        const map = new Map();

        [...owned, ...member].forEach(p => {
          map.set(p.id, p);
        });

        setTeamProjects(Array.from(map.values()));
        setLoading(false);
      }
    });

    return () => {
      unsubOwned && unsubOwned();
      unsubMember && unsubMember();
      unsubSolo && unsubSolo();
      unsubAuth();
    };
  }, []);

  const getTeamRoute = (p) => `/aiteamdashboard/${p.id}`;
  const getSoloRoute = (p) => `/project/${p.id}`;

  if (loading) {
    return <div className="p-6 text-gray-400">Loading...</div>;
  }

  const projectsToShow =
    activeTab === "team" ? teamProjects : soloProjects;

  return (
    <div className="p-6">

      {/* Toggle */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab("team")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === "team"
              ? "bg-blue-600 text-white"
              : "bg-slate-800 text-gray-300 hover:bg-slate-700"
          }`}
        >
          Team Projects
        </button>

        <button
          onClick={() => setActiveTab("solo")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            activeTab === "solo"
              ? "bg-blue-600 text-white"
              : "bg-slate-800 text-gray-300 hover:bg-slate-700"
          }`}
        >
          Solo Projects
        </button>
      </div>

      {projectsToShow.length === 0 && (
        <p className="text-gray-400">
          No {activeTab} projects
        </p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projectsToShow.map((p) => (
          <Link
            key={p.id}
            to={
              activeTab === "team"
                ? getTeamRoute(p)
                : getSoloRoute(p)
            }
          >
            <div className="bg-slate-800 hover:bg-slate-700 transition rounded-xl p-4 border border-slate-700 cursor-pointer">
              
              <h3 className="text-white font-semibold">
                {p.projectName || "Untitled"}
              </h3>

              <p className="text-sm text-gray-300 mt-2">
                {p.description}
              </p>

              {activeTab === "team" && (
                <div className="flex justify-between mt-3 text-xs text-gray-500">
                  <span>{p.matchType}</span>
                  <span>
                    {p.members?.length || 1} members
                  </span>
                </div>
              )}

            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}