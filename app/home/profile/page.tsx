"use client";
import React, { useEffect, useState } from "react";
import { UserAuth } from "../../context/AuthContext";
import LoadingImage from "../../_components/LoadingGif";

const ProfilePage = () => {
  const { user } = UserAuth(); //user data if logged in
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const checkAuthentication = async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      setLoading(false);
    };
    checkAuthentication();
  }, [user]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {loading ? (
        <LoadingImage />
      ) : user ? (
        // user info
        <div>
          <p className="text-base sm:text-lg">Welcome, {user.displayName}</p>
        </div>
      ) : (
        <div className="px-4 py-6 sm:py-8">
          <p className="text-sm sm:text-base">
            You must be logged in to view this page - protected route.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
