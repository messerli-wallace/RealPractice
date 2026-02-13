import { useState, useEffect } from "react";
import Link from "next/link";
import { UserAuth } from "../context/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const { user, googleSignIn, logOut, isGoogleSignInLoading, isLogOutLoading } =
    UserAuth();

  const handleSignIn = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      let errorMessage = "Failed to sign in. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("network")) {
          errorMessage = "Network error. Please check your connection.";
        } else if (
          error.message.includes("popup") ||
          error.message.includes("cancel")
        ) {
          errorMessage = "Sign in was cancelled.";
        } else if (error.message.includes("auth")) {
          errorMessage = "Authentication failed. Please try again.";
        }
      }

      alert(errorMessage);
    }
  };

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      await new Promise((resolve) => setTimeout(resolve, 50));
      setLoading(false);
    };
    checkAuthentication();
  }, [user]);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarContainer}>
        <div className={styles.navbarContent}>
          {/* Left side - Logo and Navigation links */}
          <div className={styles.leftSection}>
            <Link href="/">
              <div className={styles.logoLink}>
                <div className={styles.logoIcon}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                    />
                  </svg>
                </div>
                <span className={styles.logoText}>RealPractice</span>
              </div>
            </Link>
            <Link
              href="/"
              className={`${styles.navLink} ${styles.navLinkHidden}`}
            >
              Home
            </Link>
            <Link href="/home/search" className={styles.navLink}>
              Search
            </Link>
          </div>

          {/* Right side - Auth buttons */}
          {!loading && (
            <div className={styles.rightSection}>
              {!user ? (
                <>
                  <button
                    onClick={handleSignIn}
                    disabled={isGoogleSignInLoading}
                    className={styles.authButton}
                  >
                    {isGoogleSignInLoading ? "Loading..." : "Login"}
                  </button>
                  <button
                    onClick={handleSignIn}
                    disabled={isGoogleSignInLoading}
                    className={styles.signUpButton}
                  >
                    {isGoogleSignInLoading ? (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <svg
                          className={styles.spinner}
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className={styles.spinnerCircle}
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className={styles.spinnerPath}
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      "Sign Up"
                    )}
                  </button>
                </>
              ) : (
                <>
                  <ThemeToggle />
                  <Link href="/home/profile">
                    <div className={styles.userProfile}>
                      <div className={styles.userAvatar}>
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className={styles.userName}>
                        {user.displayName}
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={logOut}
                    disabled={isLogOutLoading}
                    className={styles.signOutButton}
                  >
                    {isLogOutLoading ? "Signing out..." : "Sign Out"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
