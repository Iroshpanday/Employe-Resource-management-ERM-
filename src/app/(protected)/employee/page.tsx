// app/employee/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EmployeeForm, { EmployeeFormData } from "./EmployeeForm";

import { useAuth } from "@/context/AuthContext";

export default function EmployeePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [editData, setEditData] = useState<EmployeeFormData | null>(null);

  const handleSuccess = () => {
    // fetchEmployees();
    setEditData(null);
  };

  return (
    <div className="p-4 w-full mx-auto">
      <div className="p-6 bg-white rounded-lg shadow">
        {/* Header row: title + Register button */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Employees</h1>

          {(user?.role === "ADMIN" || user?.role === "HR") && (
            <button
              onClick={() => router.push("/register")}
              className="bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 text-sm font-medium transition"
            >
              Register Employee
            </button>
          )}
        </div>

        {/* Keep "Logged in as" exactly where it was */}
        {user && (
          <div className="mb-4 text-sm text-gray-600">
            Logged in as:{" "}
            <span className="font-semibold">{user.role}</span>
          </div>
        )}

        {/* Show employee form for Admin/HR */}
        {(user?.role === "ADMIN" || user?.role === "HR") && (
          <div className="mb-6">
            <EmployeeForm
              onSuccess={handleSuccess}
              editData={editData}
              onCancel={() => setEditData(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
