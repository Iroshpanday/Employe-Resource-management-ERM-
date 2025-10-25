"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface DashboardStats {
  totalEmployees: number;
  pendingLeaves: number;
  todayCheckedIn: number;
  todayPendingCheckout: number;
}

export default function DashboardStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = user?.token;
        if (!token) return;

        const [employeesRes, leavesRes, attendanceRes] = await Promise.all([
          fetch("/api/employee", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/leave?status=PENDING", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/attendance/stats", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const totalEmployees = employeesRes.ok ? (await employeesRes.json()).length : 0;
        const pendingLeaves = leavesRes.ok ? (await leavesRes.json()).length : 0;
        const attendanceStats = attendanceRes.ok ? await attendanceRes.json() : {};

        setStats({
          totalEmployees,
          pendingLeaves,
          todayCheckedIn: attendanceStats.today?.checkedIn || 0,
          todayPendingCheckout: attendanceStats.today?.pendingCheckOut || 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchStats();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-gray-600 text-sm font-medium">Total Employees</h3>
        <p className="text-3xl font-bold text-blue-600">{stats?.totalEmployees || 0}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-gray-600 text-sm font-medium">Pending Leaves</h3>
        <p className="text-3xl font-bold text-yellow-600">{stats?.pendingLeaves || 0}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-gray-600 text-sm font-medium">Today&#39;s Check-ins</h3>
        <p className="text-3xl font-bold text-green-600">{stats?.todayCheckedIn || 0}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-gray-600 text-sm font-medium">Pending Check-out</h3>
        <p className="text-3xl font-bold text-red-600">{stats?.todayPendingCheckout || 0}</p>
      </div>
    </div>
  );
}