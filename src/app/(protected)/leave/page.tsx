"use client";

import { useEffect, useState, useCallback } from "react";
import { useSnackbar } from "notistack";
import LeaveForm from "./LeaveForm";
import { LeaveDataTable } from "./LeaveDataTable";
import { columns, LeaveRequest } from "./columns";
import { useAuth } from "@/context/AuthContext";

export default function LeavePage() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchLeaveRequests = useCallback(async () => {
    setLoading(true);
    try {
      let url = "/api/leave";
      if (user?.role === "EMPLOYEE") {
        url = `/api/leave?employeeId=${user.id}`;
      }

      const res = await fetch(url, {
        credentials: "include", // important for cookie-based auth
      });

      if (!res.ok) throw new Error("Failed to fetch leave requests");

      const data: LeaveRequest[] = await res.json();
      setLeaveRequests(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [user, enqueueSnackbar]);

  useEffect(() => {
    if (user) fetchLeaveRequests();
  }, [fetchLeaveRequests, user]);

  const handleAction = async (
    leave: LeaveRequest,
    method: string,
    body?: Record<string, unknown>,
    successMessage?: string
  ) => {
    try {
      const res = await fetch(`/api/leave/${leave.id}`, {
        method,
        credentials: "include",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) throw new Error(`Failed to ${successMessage?.toLowerCase() || "perform action"}`);

      enqueueSnackbar(successMessage || "Action completed", { variant: "success" });
      fetchLeaveRequests();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      enqueueSnackbar(message, { variant: "error" });
    }
  };

  const handleApprove = (leave: LeaveRequest) =>
    handleAction(leave, "PATCH", { status: "APPROVED" }, "Leave approved");

  const handleReject = (leave: LeaveRequest) =>
    handleAction(leave, "PATCH", { status: "REJECTED", comments: "Rejected by manager" }, "Leave rejected");

  const handleDelete = (leave: LeaveRequest) =>
    handleAction(leave, "DELETE", undefined, "Leave deleted");

  const handleCancel = (leave: LeaveRequest) =>
    handleAction(leave, "PATCH", { status: "CANCELLED" }, "Leave request cancelled");

  const handleSuccess = () => {
    setShowForm(false);
    fetchLeaveRequests();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leave Requests</h1>
        {(user?.role === "EMPLOYEE" || user?.role === "HR" || user?.role === "ADMIN") && (
          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {showForm ? "Cancel" : "New Leave Request"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <LeaveForm onSuccess={handleSuccess} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {loading ? (
        <p className="p-4">Loading leave requests...</p>
      ) : (
        <LeaveDataTable
          columns={columns}
          data={leaveRequests}
          meta={{
            currentUser: user || undefined,
            onApprove: handleApprove,
            onReject: handleReject,
            onDelete: handleDelete,
            onCancel: handleCancel,
          }}
        />
      )}
    </div>
  );
}
