"use client";

import { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { Employee } from "@/app/(protected)/employee/columns";

interface AddTeamMemberModalProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingMembers: number[]; // Array of existing employee IDs
}

export default function AddTeamMemberModal({ 
  projectId, 
  isOpen, 
  onClose, 
  onSuccess,
  existingMembers 
}: AddTeamMemberModalProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | "">("");
  const [selectedRole, setSelectedRole] = useState<"MEMBER" | "LEAD">("MEMBER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchEmployees = async () => {
    try {
      // ✅ Safe localStorage parsing
      const storedAuth = typeof window !== "undefined" ? localStorage.getItem("auth") : null;
      const token = storedAuth ? JSON.parse(storedAuth)?.token : null;
      if (!token) return; // no token, skip fetch

      const res = await fetch("/api/employee", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch employees");

      const data: Employee[] = await res.json();

      // ✅ Filter out employees already in the project
      const availableEmployees = data.filter(
        (emp) => !existingMembers.includes(emp.id)
      );

      setEmployees(availableEmployees);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isOpen) {
    fetchEmployees();
  }
}, [isOpen, existingMembers]); // ✅ Added missing dependency


 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).token : null;
      
      const res = await fetch("/api/projects/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          employeeId: selectedEmployee,
          role: selectedRole,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to add team member");
      }

      enqueueSnackbar("Team member added successfully!", { variant: "success" });
      onSuccess();
      onClose();
      resetForm();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedEmployee("");
    setSelectedRole("MEMBER");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add Team Member</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Employee *
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(Number(e.target.value))}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">Choose an employee</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName} - {employee.position}
                </option>
              ))}
            </select>
            {employees.length === 0 && !loading && (
              <p className="text-sm text-gray-500 mt-1">All employees are already in this project</p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as "MEMBER" | "LEAD")}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MEMBER">Team Member</option>
              <option value="LEAD">Team Lead</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedEmployee || loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isSubmitting ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}