// app/employee/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { EmployeeFormData } from "./EmployeeForm";
import { columns, Employee } from "./columns";
import { useSnackbar } from "notistack";
import { EmpDataTable } from "./Empdata-table";
import { useAuth } from "@/context/AuthContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import EmployeeForm from "./EmployeeForm";
import { Button } from "@/components/ui/button"; 
import { X } from "lucide-react"; 

export default function EmployeePage() {
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<EmployeeFormData | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      // Use the includeDeleted query parameter based on toggle state
      const url = showDeleted 
        ? "/api/employee?includeDeleted=true" 
        : "/api/employee";

      const res = await fetch(url, {
        cache: "no-store",
        // No Authorization header needed - cookies are sent automatically
      });
      
      if (res.status === 401) {
        throw new Error("Unauthorized - Please login again");
      }
      
      if (res.status === 403) {
        throw new Error("You don't have permission to view employees");
      }
      
      if (!res.ok) throw new Error("Failed to fetch employees");

      const data: Employee[] = await res.json();
      setEmployees(data);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch employees";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar, showDeleted]);

  useEffect(() => {
    if (user) { // Check if user exists (auth context handles loading)
      fetchEmployees();
    }
  }, [fetchEmployees, user]);

  const onDelete = async (employee: Employee) => {
    try {
      const res = await fetch(`/api/employee/${employee.id}`, {
        method: "DELETE",
        // No Authorization header needed - cookies are sent automatically
      });
      
      if (res.status === 401) {
        throw new Error("Unauthorized - Please login again");
      }
      
      if (res.status === 403) {
        throw new Error("You don't have permission to delete employees");
      }
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Delete failed");
      }

      if (editData?.id === employee.id) {
        setEditData(null);
        setShowForm(false);
      }

      enqueueSnackbar("Employee soft deleted successfully", { variant: "success" });
      fetchEmployees();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error deleting employee";
      enqueueSnackbar(message, { variant: "error" });
    }
  };

  const onEdit = (employee: Employee) => {
    // Don't allow editing deleted employees
    if (employee.deletedAt) {
      enqueueSnackbar("Cannot edit deleted employees", { variant: "warning" });
      return;
    }

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
      gender: employee.gender,
      address: employee.address,  
      status: employee.status
    });
    setShowForm(true);
  };

  const onViewCV = (employee: Employee) => {
    if (employee.cvFile) {
      window.open(employee.cvFile, "_blank");
    }
  };

  const handleSuccess = () => {
    console.log("🟢 handleSuccess called in page.tsx");
    console.log("🟢 enqueueSnackbar function exists:", !!enqueueSnackbar);
    console.log("🟢 editData:", editData);
    
    try {
      enqueueSnackbar(
        editData ? "Employee updated successfully!" : "Employee added successfully!",
        { 
          variant: "success",
          autoHideDuration: 3000
        }
      );
      console.log("🟢 enqueueSnackbar was called");
    } catch (error) {
      console.error("🔴 Error calling enqueueSnackbar:", error);
    }
    
    fetchEmployees();
    setEditData(null);
    setShowForm(false);
  };

  const handleCancel = () => {
    setEditData(null);
    setShowForm(false);
  };

  const handleAddEmployee = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditData(null);
    setShowForm(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Employees</h1>
        
        {/* Show Deleted Toggle */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-deleted"
              checked={showDeleted}
              onCheckedChange={setShowDeleted}
            />
            <Label htmlFor="show-deleted">Show Deleted</Label>
          </div>
          
          {/* Add Employee Button - Only show when form is hidden and user has permission */}
          {(user?.role === "ADMIN" || user?.role === "HR") && !showForm && (
            <Button onClick={handleAddEmployee} className="bg-blue-500 hover:bg-blue-600">
              Add Employee
            </Button>
          )}
        </div>
      </div>
      
      {/* Display the user's role */}
      {user && (
        <div className="mb-4 text-sm text-gray-600">
          Logged in as: <span className="font-semibold">{user.role}</span>
        </div>
      )}
      
      {/* Employee Form - Conditionally rendered */}
      {(user?.role === "ADMIN" || user?.role === "HR") && showForm && (
        <div className="mb-6 border rounded-lg shadow">
          {/* Form Header with Close Button */}
          <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-lg">
            <h2 className="text-lg font-semibold">
              {editData ? "Edit Employee" : "Add New Employee"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCloseForm}
              className="h-8 w-8 p-0 hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Form Content */}
          <div className="p-4">
            <EmployeeForm
              onSuccess={handleSuccess}
              editData={editData}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      {loading ? (
        <p className="p-4">Loading employees...</p>
      ) : (
        <EmpDataTable
          columns={columns}
          data={employees}
          meta={{
            onEdit: (user?.role === "ADMIN" || user?.role === "HR") ? onEdit : undefined,
            onDelete: user?.role === "ADMIN" ? onDelete : undefined,
            onViewCV,
          }}
        />
      )}
    </div>
  );
}