import { auth } from "../firebase/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Dashboard() {

  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">

      <div className="w-full max-w-md border border-gray-200 rounded-2xl p-8 shadow-sm">

        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Student Collaboration Hub
        </h1>

        <p className="text-gray-500 text-sm text-center mt-2">
          Enhance your profile to get matched with the right team
        </p>

        <div className="flex flex-col items-center mt-6">

          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-2xl font-semibold">
            {user?.email?.charAt(0).toUpperCase()}
          </div>

          <p className="mt-4 text-gray-700 font-medium">
            {user?.email || "Loading..."}
          </p>

        </div>

        <button
          onClick={() => navigate("/profilesetup")}
          className="w-full mt-6 bg-gray-900 text-white py-2.5 rounded-lg"
        >
          Complete Your Profile
        </button>

        <button
          onClick={handleLogout}
          className="w-full mt-3 border border-gray-300 py-2.5 rounded-lg"
        >
          Logout
        </button>

      </div>

    </div>
  );
}