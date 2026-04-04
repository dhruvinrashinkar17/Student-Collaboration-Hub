import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  arrayUnion,
  getDoc
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let unsub = null;

    const authUnsub = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const q = query(
        collection(db, "notifications"),
        where("toUserId", "==", user.uid)
      );

      unsub = onSnapshot(q, (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setNotifications(list);
        setLoading(false);
      });
    });

    return () => {
      unsub && unsub();
      authUnsub();
    };
  }, []);

  const acceptRequest = async (notif) => {
    const uid = auth.currentUser.uid;
    setAccepting(notif.id);

    try {
      const teamRef = doc(db, "teams", notif.teamId);
      const teamSnap = await getDoc(teamRef);
      const teamData = teamSnap.data();

      if (!teamData.members?.includes(uid)) {
        await updateDoc(teamRef, {
          members: arrayUnion(uid),
        });
      }

      await updateDoc(doc(db, "notifications", notif.id), {
        status: "accepted"
      });

      if (teamData.matchType === "manual") {
        navigate(`/manual-team/${notif.teamId}`);
      } else {
        navigate(`/aiteamdashboard/${notif.teamId}`);
      }

    } catch (err) {
      console.error("Accept error:", err);
      setAccepting(null);
    }
  };

  const declineRequest = async (notif) => {
    try {
      await updateDoc(doc(db, "notifications", notif.id), {
        status: "declined"
      });
    } catch (err) {
      console.error("Decline error:", err);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-slate-950 text-white">
      <h1 className="text-2xl mb-6">
        Notifications ({notifications.length})
      </h1>

      {loading && <p>Loading...</p>}

      {notifications.map((notif) => (
        <div
          key={notif.id}
          className="p-4 bg-slate-800 rounded mb-3"
        >
          <p>
            {notif.fromName} invited you to "{notif.teamName}"
          </p>

          {notif.status === "pending" && (
            <div className="flex gap-2 mt-2">
              <button
                disabled={accepting === notif.id}
                onClick={() => acceptRequest(notif)}
                className="bg-blue-600 px-3 py-1 rounded"
              >
                Accept
              </button>

              <button
                onClick={() => declineRequest(notif)}
                className="bg-gray-600 px-3 py-1 rounded"
              >
                Decline
              </button>
            </div>
          )}

          {notif.status === "accepted" && (
            <p className="text-green-400 mt-2 text-sm">
              Accepted
            </p>
          )}

          {notif.status === "declined" && (
            <p className="text-red-400 mt-2 text-sm">
              Declined
            </p>
          )}
        </div>
      ))}
    </div>
  );
}