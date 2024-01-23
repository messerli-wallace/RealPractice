"use client";
import React, { useEffect, useState } from "react";
import { UserAuth } from "../../context/AuthContext";
import LoadingImage from "../../_components/LoadingGif";

const profilePage = () => {
    const {user} = UserAuth(); //user data if logged in
    const [loading,setLoading] = useState(true);

    useEffect(() => {
        const checkAuthentication = async () => {
            await new Promise((resolve) => setTimeout(resolve, 50))
            setLoading(false);
        };
        checkAuthentication();
    }, [user]);

    return (
        <div className="p-4">
        {loading ? (<LoadingImage />) : user ? (
                // user info 
                <div>
                <p>Welcome, {user.displayName}</p>
                </div>
            ) : (
                <div className="p-4">
                    You must be logged in to view this page - protected route.
                </div>
            )
        
        }
         </div>
    )
}

export default profilePage;