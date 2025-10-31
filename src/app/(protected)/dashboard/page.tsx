"use client";

import { useEffect,useCallback ,useState } from "react";
import { useSnackbar } from "notistack";
import { useAuth } from "@/context/AuthContext";
import DashboardStats from "../components/DashboardStats";
import AttendanceActions from "../attendance/AttendanceActions";
import { AttendanceDataTable } from "../attendance/AttendanceDataTable";
import { columns, Attendance } from "../attendance/columns";

export default function DashboardPage() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentAttendance = useCallback(async () => {
    try {
      const token = user?.token;
      if (!token) return;

      const res = await fetch("/api/attendance?limit=10", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch attendance");

      const data = await res.json();
      setAttendance(data);
    }catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "Something went wrong";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [user?.token, enqueueSnackbar]);

  useEffect(() => {
    if (user?.token) {
      fetchRecentAttendance();
    }
  }, [user?.token, fetchRecentAttendance]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <DashboardStats />

      {(user?.role === "EMPLOYEE" || user?.role === "HR" ) && (
        <AttendanceActions onAction={fetchRecentAttendance} />
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Attendance</h2>
        {loading ? (
          <p>Loading attendance records...</p>
        ) : (
          <AttendanceDataTable columns={columns} data={attendance} />
        )}
      </div>
    </div>
  );
}