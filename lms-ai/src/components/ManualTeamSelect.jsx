import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  query,
  where
} from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";

export default function ManualTeamSelect() {
  const { teamId } = useParams();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [required, setRequired] = useState(1);
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const teamSnap = await getDoc(doc(db, "teams", teamId));
      if (!teamSnap.exists()) return;

      const teamData = teamSnap.data();

      const membersList = teamData.members || [];
      const teamSize = teamData.teamSize || 1;

      setMembers(membersList);
      setRequired(teamSize - membersList.length);
      setTeamName(teamData.projectName || "Unnamed Project");

      const isMember = membersList.includes(auth.currentUser.uid);
      const isCreator = teamData.createdBy === auth.currentUser.uid;
      const isFull = membersList.length >= teamSize;

      // receiver goes directly to dashboard
      if (isMember && !isCreator) {
        navigate(`/aiteamdashboard/${teamId}`);
        return;
      }

      // if team completed
      if (isFull) {
        navigate(`/aiteamdashboard/${teamId}`);
        return;
      }

      // fetch users
      const usersSnap = await getDocs(collection(db, "users"));

      const allUsers = usersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const list = allUsers.filter(
        u => u.id !== auth.currentUser.uid
      );

      setUsers(list);
    };

    fetchData();
  }, [teamId, navigate]);

  const toggle = (user) => {
    if (members.includes(user.id)) return;

    if (selected.find(u => u.id === user.id)) {
      setSelected(selected.filter(u => u.id !== user.id));
    } else {
      if (selected.length >= required) return;
      setSelected([...selected, user]);
    }
  };

  const sendRequests = async () => {
    if (selected.length !== required) return;

    setSending(true);

    try {
      for (const user of selected) {
        const q = query(
          collection(db, "notifications"),
          where("teamId", "==", teamId),
          where("toUserId", "==", user.id),
          where("status", "==", "pending")
        );

        const snap = await getDocs(q);
        if (!snap.empty) continue;

        await addDoc(collection(db, "notifications"), {
          toUserId: user.id,
          fromUserId: auth.currentUser.uid,
          fromName: auth.currentUser.displayName || "Someone",
          teamId,
          teamName,
          status: "pending",
          createdAt: serverTimestamp()
        });
      }

      // creator goes to dashboard after sending
      navigate(`/aiteamdashboard/${teamId}`);

    } catch (err) {
      console.error("Error sending requests:", err);
    }

    setSending(false);
  };

  return (
    <div className="p-6 bg-slate-950 min-h-screen text-white">
      <h1 className="text-xl mb-4">
        Select {required} collaborator(s) for "{teamName}"
      </h1>

      {users.length === 0 && (
        <p className="text-gray-400">No available users found</p>
      )}

      <div className="grid grid-cols-3 gap-4">
        {users.map(user => {
          const isSelected = selected.find(u => u.id === user.id);
          const isMember = members.includes(user.id);

          return (
            <div
              key={user.id}
              onClick={() => !isMember && toggle(user)}
              className={`p-4 rounded transition ${
                isMember
                  ? "bg-slate-700 opacity-50 cursor-not-allowed"
                  : isSelected
                  ? "bg-blue-700 cursor-pointer"
                  : "bg-slate-800 cursor-pointer"
              }`}
            >
              <h3>{user.fullName || "Unnamed"}</h3>
              <p className="text-sm text-gray-400">{user.country}</p>
              <p className="text-sm text-gray-500">{user.domain}</p>

              {isMember && (
                <p className="text-xs text-green-400 mt-1">
                  Already in team
                </p>
              )}
            </div>
          );
        })}
      </div>

      <button
        disabled={sending || required <= 0}
        onClick={sendRequests}
        className="mt-6 bg-green-600 px-4 py-2 rounded disabled:opacity-50"
      >
        {sending ? "Sending..." : "Send Requests"}
      </button>
    </div>
  );
}