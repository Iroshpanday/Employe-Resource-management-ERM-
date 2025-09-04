"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSnackbar } from "notistack";
import { useAuth } from "@/context/AuthContext";
 import { Employee } from "../employee/columns";

export const leaveSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().min(5, "Reason must be at least 5 characters").max(500),
  employeeId: z.number().optional(), // For HR/Admin to select employee
});

type LeaveFormValues = z.infer<typeof leaveSchema>;

interface LeaveFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function LeaveForm({ onSuccess, onCancel }: LeaveFormProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  // interface Employee {
  //   id: number;
  //   firstName: string;
  //   lastName: string;
  //   // Add other fields if needed
  // }

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    
    formState: { errors },
  } = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      reason: "",
      employeeId: undefined,
    },
  });

  useEffect(() => {
    // Fetch employees for HR/Admin dropdown
    if (user?.role === "HR" || user?.role === "ADMIN") {
      const fetchEmployees = async () => {
        try {
          const token = user?.token;
          const res = await fetch("/api/employee", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setEmployees(data);
          }
        } catch (error) {
          console.error("Failed to fetch employees:", error);
        }
      };
      fetchEmployees();
    }
  }, [user]);

  const onSubmit = async (data: LeaveFormValues) => {
    setIsSubmitting(true);
    try {
      const token = user?.token;
      const payload = {
        ...data,
        // If employee is not selected (for HR/Admin), use current user's ID
        employeeId: data.employeeId || user?.id,
      };

      const res = await fetch("/api/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create leave request");
      }

      enqueueSnackbar("Leave request submitted successfully", { variant: "success" });
      reset();
      onSuccess();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg shadow">
      <h3 className="text-lg font-semibold">New Leave Request</h3>
      
      {(user?.role === "HR" || user?.role === "ADMIN") && (
        <div>
          <label className="block text-sm font-medium">Employee</label>
          <select
            {...register("employeeId", { valueAsNumber: true })}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Start Date *</label>
          <input
            type="date"
            {...register("startDate")}
            className="border rounded px-2 py-1 w-full"
          />
          {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium">End Date *</label>
          <input
            type="date"
            {...register("endDate")}
            className="border rounded px-2 py-1 w-full"
          />
          {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Reason *</label>
        <textarea
          {...register("reason")}
          rows={3}
          className="border rounded px-2 py-1 w-full"
          placeholder="Please provide a reason for your leave"
        />
        {errors.reason && <p className="text-red-500 text-sm">{errors.reason.message}</p>}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}