// app/employee/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import EmployeeForm, { EmployeeFormData } from "./EmployeeForm";

import { columns, Employee } from "./columns";
import { useSnackbar } from "notistack";
import {EmpDataTable} from "./Empdata-table";




export default function EmployeePage() {
  const { enqueueSnackbar } = useSnackbar();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<EmployeeFormData | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/employee", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch employees");
      
      const data: Employee[] = await res.json();
      setEmployees(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch employees";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const onDelete = async (employee: Employee) => {
    try {
      const res = await fetch(`/api/employee/${employee.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      
      if (editData?.id === employee.id) {
      setEditData(null);
    }
      
      enqueueSnackbar("Employee deleted", { variant: "success" });
      fetchEmployees();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error deleting employee";
      enqueueSnackbar(message, { variant: "error" });
    }
  };

  const onEdit = (employee: Employee) => {
    setEditData({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      cvFile: employee.cvFile,
      branchId: employee.branchDept.branch.id,
      departmentId: employee.branchDept.department.id,
    });
  };

  const onViewCV = (employee: Employee) => {
    if (employee.cvFile) {
      window.open(employee.cvFile, "_blank");
    }
  };

  const handleSuccess = () => {
    fetchEmployees();
    setEditData(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Employees</h1>

      <EmployeeForm 
        onSuccess={handleSuccess} 
        editData={editData} 
        onCancel={() => setEditData(null)} 
      />

      {loading ? (
        <p className="p-4">Loading employees...</p>
      ) : (
        <EmpDataTable
          columns={columns}
          data={employees}
          meta={{ onEdit, onDelete, onViewCV }}
        />
      )}
    </div>
  );
}