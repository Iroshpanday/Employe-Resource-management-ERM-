"use client";

import { useState } from "react";
import { useSnackbar } from "notistack";
import { useAuth } from "@/context/AuthContext";

export default function AttendanceActions({ onAction }: { onAction: () => void }) {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState({ checkIn: false, checkOut: false });

  const handleCheckIn = async () => {
    setLoading({ ...loading, checkIn: true });
    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Omit body entirely - backend will handle from auth token
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // No body - backend uses auth token to determine employee
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to check in (${res.status})`);
      }


      if (user?.role !== "EMPLOYEE") {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Attendance Actions</h3>
      <p className="text-gray-600">
        {user?.role === "HR" || user?.role === "ADMIN" 
          ? "HR/Admin users must use the management interface to check employees in/out"
          : "Please contact your administrator for attendance actions"}
      </p>
    </div>
  );
}

      
      enqueueSnackbar("Checked in successfully", { variant: "success" });
      onAction();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading({ ...loading, checkIn: false });
    }
  };

  const handleCheckOut = async () => {
    setLoading({ ...loading, checkOut: true });
    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Omit body entirely - backend will handle from auth token
      const res = await fetch("/api/attendance/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // No body - backend uses auth token to determine employee
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to check out (${res.status})`);
      }

      
      enqueueSnackbar("Checked out successfully", { variant: "success" });
      onAction();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading({ ...loading, checkOut: false });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Attendance Actions</h3>
      <div className="flex gap-4">
        <button
          onClick={handleCheckIn}
          disabled={loading.checkIn}
          className="bg-green-500 text-white px-6 py-2 rounded disabled:bg-green-300"
        >
          {loading.checkIn ? "Checking In..." : "Check In"}
        </button>
        <button
          onClick={handleCheckOut}
          disabled={loading.checkOut}
          className="bg-red-500 text-white px-6 py-2 rounded disabled:bg-red-300"
        >
          {loading.checkOut ? "Checking Out..." : "Check Out"}
        </button>
      </div>
    </div>
  );
}