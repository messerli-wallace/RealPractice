"use client";
import Navbar from "../_components/Navbar";
import {
  AuthContextProvider,
  LogsContextProvider,
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
        <LogsContextProvider>
          <ErrorBoundary>
            <Navbar />
            {children}
          </ErrorBoundary>
        </LogsContextProvider>
      </UIContextProvider>
    </AuthContextProvider>
  );
}
