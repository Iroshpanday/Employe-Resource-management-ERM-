"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSnackbar } from "notistack";

const departmentSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters").max(50),
  location: z.string().min(2, "Department location must be at least 2 characters").max(50),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

interface DepartmentFormProps {
  onSuccess: () => void;
  editData?: { id: number; name: string; location?: string } | null;
  onCancel?: () => void;
}

export default function DepartmentForm({ onSuccess, editData, onCancel }: DepartmentFormProps) {
  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: "", location: "" }, // ✅ both fields present
  });

  useEffect(() => {
    if (editData) {
      reset({ name: editData.name ?? "", location: editData.location ?? "" });
    } else {
      reset({ name: "", location: "" });
    }
  }, [editData, reset]);

  const onSubmit = async (data: DepartmentFormValues) => {
    try {
      const res = await fetch(
        editData ? `/api/department/${editData.id}` : `/api/department`,
        {
          method: editData ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to save");
      }

      enqueueSnackbar(editData ? "Department updated" : "Department created", { variant: "success" });
      onSuccess();
      reset({ name: "", location: "" });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "Something went wrong";
      enqueueSnackbar(message, { variant: "error" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium">Department Name</label>
        <input type="text" {...register("name")} className="border rounded px-2 py-1 w-full" />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium">Department Location</label>
        <input type="text" {...register("location")} className="border rounded px-2 py-1 w-full" />
        {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>}
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={isSubmitting} className="bg-blue-500 text-white px-4 py-1 rounded">
          {editData ? "Update" : "Add"}
        </button>
        {editData && (
          <button type="button" onClick={onCancel} className="bg-gray-300 px-4 py-1 rounded">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
