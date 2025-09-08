"use client";

import { useEffect, useState, useCallback } from "react";
import { useSnackbar } from "notistack";
import { useAuth } from "@/context/AuthContext";
import AttendanceActions from "./AttendanceActions";
import { AttendanceDataTable } from "./AttendanceDataTable";
import { columns, Attendance } from "./columns";

export default function AttendancePage() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: ""
  });

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const token = user?.token;
      if (!token) return;

      let url = "/api/attendance";
      const params = new URLSearchParams();

      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch attendance records");

      const data = await res.json();
      setAttendance(data);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [user, filters, enqueueSnackbar]);

  useEffect(() => {
    if (user?.token) {
      fetchAttendance();
    }
  }, [fetchAttendance, user]);

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({ startDate: "", endDate: "" });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Attendance Records</h1>
      </div>

      {(user?.role === "EMPLOYEE" || user?.role === "HR" || user?.role === "ADMIN") && (
        <AttendanceActions onAction={fetchAttendance} />
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Attendance History</h3>
          <span className="text-sm text-gray-600">
            {attendance.length} records found
          </span>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p>Loading attendance records...</p>
          </div>
        ) : (
          <AttendanceDataTable columns={columns} data={attendance} />
        )}
      </div>
    </div>
  );
}