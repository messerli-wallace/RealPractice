'use client'; // potential mess up. I've seen somebody justifying this but it could be problematic
import './globals.css'
import Navbar from "./_components/Navbar"
import { AuthContextProvider } from './context/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* This is where shared UI would go, like header or sidebar */}
      <body>
        <AuthContextProvider>
          <Navbar />
          {children}
        </AuthContextProvider>
        </body>
    </html>
  )
}
