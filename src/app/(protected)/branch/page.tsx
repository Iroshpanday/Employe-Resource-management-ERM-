"use client";

import { useEffect, useState, useCallback } from "react";
import BranchForm from "./BranchForm";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { useSnackbar } from "notistack";
import { Branch } from "./columns";


export default function BranchPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState<Branch | null>(null);

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/branch", { cache: "no-store" });
      const data: Branch[] = await res.json();
      setBranches(data);
      console.log(data);
    } catch {
      enqueueSnackbar("Failed to fetch branches", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const onDelete = async (branch: Branch) => {
    try {
      const res = await fetch(`/api/branch/${branch.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      enqueueSnackbar("Branch deleted", { variant: "success" });
      fetchBranches();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Error deleting branch";
      enqueueSnackbar(message, { variant: "error" });
    }
  };

  const onEdit = (branch: Branch) => setEditData(branch);

  const handleSuccess = () => {
    fetchBranches();
    setEditData(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Branches</h1>

      <BranchForm
        onSuccess={handleSuccess}
        editData={editData}
        onCancel={() => setEditData(null)}
      />

      {loading ? (
        <p className="p-4">Loading...</p>
      ) : (
        <DataTable
          columns={columns}
          data={branches}
          meta={{ onEdit, onDelete }}
        />
      )}
    </div>
  );
}