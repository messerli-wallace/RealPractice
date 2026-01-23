"use client"; // CHECK THIS AT SOME POINT: hypothetically, all 'home' components are client, but I've seen arguing against.
import "../globals.css";
import Navbar from "../_components/Navbar";
import {
  AuthContextProvider,
  PostsContextProvider,
  UIContextProvider,
} from "../context";
import { ErrorBoundary } from "../_components/ErrorBoundary";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* This is where shared UI would go, like header or sidebar */}
      <body>
        <AuthContextProvider>
          <UIContextProvider>
            <PostsContextProvider>
              <ErrorBoundary>
                <Navbar />
                {children}
              </ErrorBoundary>
            </PostsContextProvider>
          </UIContextProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
