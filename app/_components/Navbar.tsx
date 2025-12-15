import { useState, useEffect } from "react";
import Link from "next/link";
import { UserAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, googleSignIn, logOut } = UserAuth();

  const handleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.log(error);
    }
  };
  // console.log(user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      setLoading(false);
    };
    checkAuthentication();
  }, [user]);

  return (
    <div className="h-20 w-fill border-b-2 flex items-center justify-between p-2">
      <ul className="flex">
        <li className="p-2 cursor-pointer">
          <Link href="/">Home</Link>
        </li>
        <li className="p-2 cursor-pointer">
          <Link href="/home/search">Search</Link>
        </li>

        {!user ? null : (
          <li className="p-2 cursor-pointer">
            <Link href="/home/profile">Profile</Link>
          </li>
        )}
      </ul>

      {loading ? null : !user ? (
        <ul className="flex">
          <li>
            <button onClick={handleSignIn} className="p-2 cursor-pointer">
              Login
            </button>
          </li>
          <li>
            <button onClick={handleSignIn} className="p-2 cursor-pointer">
              Sign Up
            </button>
          </li>
        </ul>
      ) : (
        <div className="flex">
          <p className="p-2">Signed in as {user.displayName}</p>
          <button onClick={logOut} className="p-2 cursor-pointer">
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export default Navbar;
