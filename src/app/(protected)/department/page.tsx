"use client";

import { useEffect, useState } from "react";
import DepartmentForm from "./DepartmentForm";
import { DataTable } from "@/components/data-table";
import { columns, Department } from "./columns";
import { useSnackbar } from "notistack";
import { useCallback } from "react";

export default function DepartmentPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<Department | null>(null);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/department", { cache: "no-store" });
      const data: Department[] = await res.json();
      setDepartments(data);
    } catch {
      enqueueSnackbar("Failed to fetch departments", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  

  const onDelete = async (dept: Department) => {
    try {
      const res = await fetch(`/api/department/${dept.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      enqueueSnackbar("Department deleted", { variant: "success" });
      fetchDepartments();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Error deleting department";
      enqueueSnackbar(message, { variant: "error" });
    }
  };

  const onEdit = (dept: Department) => setEditData(dept);

  const handleSuccess = () => {
    fetchDepartments();
    setEditData(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Departments</h1>

      <DepartmentForm onSuccess={handleSuccess} editData={editData} onCancel={() => setEditData(null)} />

      {loading ? (
        <p className="p-4">Loading...</p>
      ) : (
        <DataTable
          columns={columns}
          data={departments}
          meta={{ onEdit, onDelete }}
        />
      )}
    </div>
  );
}
