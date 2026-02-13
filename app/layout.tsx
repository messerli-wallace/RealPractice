import type { Metadata } from "next";
import "./globals.css";
import {
  AuthContextProvider,
  LogsContextProvider,
  ThemeContextProvider,
  UIContextProvider,
} from "./context";
import { ErrorBoundary } from "./_components/ErrorBoundary";

export const metadata: Metadata = {
  title: "RealPractice",
  description: "Track your practice sessions",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeContextProvider>
          <AuthContextProvider>
            <UIContextProvider>
              <LogsContextProvider>
                <ErrorBoundary>{children}</ErrorBoundary>
              </LogsContextProvider>
            </UIContextProvider>
          </AuthContextProvider>
        </ThemeContextProvider>
      </body>
    </html>
  );
}
