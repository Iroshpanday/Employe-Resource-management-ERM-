// app/(protected)/logout/page.tsx
"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const { logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only proceed if auth is initialized and user is logged in
    if (!loading) {
      const performLogout = async () => {
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
          });
        } catch (error) {
          console.error("Logout API error:", error);
        } finally {
          logout();
          router.push("/login");
        }
      };

      performLogout();
    }
  }, [logout, router, loading]);

  // Show loading while auth is being initialized
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900">Logging out...</h2>
        <p className="text-gray-600 mt-2">Please wait while we securely log you out.</p>
      </div>
    </div>
  );
}