import React, { useContext, createContext, useState, useEffect} from "react";
import {signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut} from "firebase/auth";
import { auth } from "../firebase";
import { docExists } from "../_db/db";

const AuthContext = createContext();

export const AuthContextProvider = ({children}) => {
    const [user, setUser] = useState(null);

    const googleSignIn = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider);
    };

    const logOut = () => {
        signOut(auth)
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser !== null) { // check if the signed in user has a document
                docExists(currentUser.uid);
            }
        })
        return () => unsubscribe()
    }, [user]);

    return (
    <AuthContext.Provider value={{user, googleSignIn, logOut }}>
        {children}
    </AuthContext.Provider>
    );
};

export const UserAuth = () => {
    return useContext(AuthContext)
}