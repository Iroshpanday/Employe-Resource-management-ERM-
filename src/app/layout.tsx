// app/layout.tsx
"use client";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SnackbarProvider } from 'notistack';
import { SpeedInsights } from "@vercel/speed-insights/next"

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
          <AuthProvider>{children}
            <SpeedInsights />
          </AuthProvider>
        </SnackbarProvider>
      </body>
    </html>
  );
}