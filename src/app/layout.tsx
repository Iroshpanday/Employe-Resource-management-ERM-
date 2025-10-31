// src/app/layout.tsx
"use client"; // Add this directive

import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { SnackbarProvider } from 'notistack';

// Since we're using "use client", we can't use export const metadata
// We'll use a different approach for metadata

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>EMS System</title>
        <meta name="description" content="Employee Management System" />
      </head>
      <body>
        <SnackbarProvider 
          maxSnack={3}
          autoHideDuration={3000}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <AuthProvider>{children}</AuthProvider>
        </SnackbarProvider>
      </body>
    </html>
  );
}