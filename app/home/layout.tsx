"use client";
import Navbar from "../_components/Navbar";
import {
  AuthContextProvider,
  PostsContextProvider,
  UIContextProvider,
} from "../context";
import { ErrorBoundary } from "../_components/ErrorBoundary";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
  );
}
