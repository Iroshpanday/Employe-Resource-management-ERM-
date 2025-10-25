"use client";

import { useEffect, useState, useCallback } from "react";
import { useSnackbar } from "notistack";
import { useAuth } from "@/context/AuthContext";
import LeaveForm from "./LeaveForm";
import { LeaveDataTable } from "./LeaveDataTable";
import { columns, LeaveRequest } from "./columns";

export default function LeavePage() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchLeaveRequests = useCallback(async () => {
    setLoading(true);
    try {
      const token = user?.token;
      if (!token) return;

      // const url = user?.role === "EMPLOYEE" 
      //   ? "/api/leave" 
      //   : `/api/leave?employeeId=${user?.id}`;
     let url = "/api/leave";
    if (user?.role === "EMPLOYEE") {
      url = `/api/leave?employeeId=${user?.id}`;
    }
    console.log("urls is:", url);

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("response is:", res);

      if (!res.ok) throw new Error("Failed to fetch leave requests");

      const data: LeaveRequest[] = await res.json();
      setLeaveRequests(data);
      console.log("data is:", data);
      
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [user, enqueueSnackbar]);

  useEffect(() => {
    if (user?.token) {
      fetchLeaveRequests();
    }
  }, [fetchLeaveRequests, user?.token]);

  const handleApprove = async (leave: LeaveRequest) => {
    try {
      const token = user?.token;
      const res = await fetch(`/api/leave/${leave.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "APPROVED" }),
      });

      if (!res.ok) throw new Error("Failed to approve leave");
      
      enqueueSnackbar("Leave approved", { variant: "success" });
      fetchLeaveRequests();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      enqueueSnackbar(errorMessage, { variant: "error" });
    }
  };

  const handleReject = async (leave: LeaveRequest) => {
    try {
      const token = user?.token;
      const res = await fetch(`/api/leave/${leave.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "REJECTED", comments: "Rejected by manager" }),
      });

      if (!res.ok) throw new Error("Failed to reject leave");
      
      enqueueSnackbar("Leave rejected", { variant: "success" });
      fetchLeaveRequests();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      enqueueSnackbar(errorMessage, { variant: "error" });
    }
  };

  const handleDelete = async (leave: LeaveRequest) => {
    try {
      const token = user?.token;
      const res = await fetch(`/api/leave/${leave.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete leave");
      
      enqueueSnackbar("Leave deleted", { variant: "success" });
      fetchLeaveRequests();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      enqueueSnackbar(errorMessage, { variant: "error" });
    }
  };

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
            onClick={() => setShowForm(!showForm)}
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
            onApprove: (user?.role === "HR" || user?.role === "ADMIN") ? handleApprove : undefined,
            onReject: (user?.role === "HR" || user?.role === "ADMIN") ? handleReject : undefined,
            onDelete: handleDelete,
          }}
        />
      )}
    </div>
  );
}