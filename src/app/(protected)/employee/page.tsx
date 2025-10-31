// app/employee/page.tsx
"use client";

import { useState } from "react";
import EmployeeForm, { EmployeeFormData } from "./EmployeeForm";
import {  Employee } from "./columns";


import { useAuth } from "@/context/AuthContext";

export default function EmployeePage() {
  const { user } = useAuth();
  


  const [editData, setEditData] = useState<EmployeeFormData | null>(null);










  const handleSuccess = () => {
    // fetchEmployees();
    setEditData(null);
  };

  return (
   // app/employee/page.tsx - Update the container div
<div className="p-4 w-full mx-auto">
  <div className="p-6 bg-white rounded-lg shadow">
    <h1 className="text-xl font-bold mb-4">Employees</h1>
    
    {/* Display the user's role */}
    {user && (
      <div className="mb-4 text-sm text-gray-600">
        Logged in as: <span className="font-semibold">{user.role}</span>
      </div>
    )}

    {user?.role === "ADMIN" || user?.role === "HR" ? (
      <div className="mb-6">
        <EmployeeForm
          onSuccess={handleSuccess}
          editData={editData}
          onCancel={() => setEditData(null)}
        />
      </div>
    ): null}

    
  </div>
</div>
  );
}