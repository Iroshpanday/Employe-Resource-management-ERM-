// app/employee/EmployeeForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSnackbar } from "notistack";
import { Branch } from "../branch/columns";
import { Department } from "../department/columns";
import { useAuth } from "@/context/AuthContext";

export const employeeSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  position: z.string().min(2, "Position must be at least 2 characters").max(50),
  cvFile: z.string().optional(),
  branchId: z.number().min(1, "Please select a branch"),
  departmentId: z.number().min(1, "Please select a department"),
  // new fields
  gender: z.enum(["Male", "Female", "Other"]),
  address: z.string().min(5, "Address must be at least 5 characters"),
  status: z.enum(["Active", "Inactive", "On Leave"]),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  onSuccess: () => void;
  editData?: EmployeeFormData | null;
  onCancel?: () => void;
}

export type EmployeeFormData = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  cvFile?: string;
  branchId: number;
  departmentId: number;
  //NEW FIELDS
  gender: "Male" | "Female" | "Other";
  address: string;
  status?: "Active" | "Inactive" | "On Leave";
};

export default function EmployeeForm({
  onSuccess,
  editData,
  onCancel,
}: EmployeeFormProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      position: "",
      cvFile: "",
      branchId: 0,
      departmentId: 0,
      gender: "Male",
      address: "",
      status: "Active",
    },
  });

  const cvFile = watch("cvFile");

  useEffect(() => {
    // Fetch branches and departments for dropdowns
    const fetchData = async () => {
      try {
        const token = user?.token;
        if (!token) return;

        const [branchesRes, departmentsRes] = await Promise.all([
          fetch("/api/branch", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("/api/department", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (branchesRes.ok) {
          const branchesData = await branchesRes.json();
          setBranches(branchesData);
        }

        if (departmentsRes.ok) {
          const departmentsData = await departmentsRes.json();
          setDepartments(departmentsData);
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : typeof error === "string"
            ? error
            : "Failed to load form data";
        enqueueSnackbar(message, { variant: "error" });
      }
    };

    fetchData();
  }, [enqueueSnackbar, user?.token]);

  useEffect(() => {
    if (editData) {
      reset({
        firstName: editData.firstName,
        lastName: editData.lastName,
        email: editData.email,
        phone: editData.phone || "",
        position: editData.position,
        cvFile: editData.cvFile || "",
        branchId: editData.branchId,
        departmentId: editData.departmentId,
        gender: editData.gender,
    address: editData.address,
    status: editData.status,
      });
    } else {
      reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        position: "",
        cvFile: "",
        branchId: 0,
        departmentId: 0,
      });
    }
  }, [editData, reset]);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No authentication token found");
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setValue("cvFile", data.path);
      enqueueSnackbar("CV uploaded successfully", { variant: "success" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Upload failed";
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: EmployeeFormValues) => {
    try {
      const token = user?.token;
      if (!token) {
        throw new Error("No authentication token found");
      }

      const url = editData ? `/api/employee/${editData.id}` : `/api/employee`;
      const method = editData ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to save employee");
      }

      
      console.log("✅ onSuccess() called from EmployeeForm");
      onSuccess();
      reset();
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 p-4 border rounded-lg shadow"
    >
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium">
            First Name *
          </label>
          <input
            id="firstName"
            type="text"
            {...register("firstName")}
            className="border rounded px-2 py-1 w-full"
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium">
            Last Name *
          </label>
          <input
            id="lastName"
            type="text"
            {...register("lastName")}
            className="border rounded px-2 py-1 w-full"
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm mt-1">
              {errors.lastName.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email *
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="border rounded px-2 py-1 w-full"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium">
            Phone
          </label>
          <input
            id="phone"
            type="text"
            {...register("phone")}
            className="border rounded px-2 py-1 w-full"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="position" className="block text-sm font-medium">
            Position *
          </label>
          <input
            id="position"
            type="text"
            {...register("position")}
            className="border rounded px-2 py-1 w-full"
          />
          {errors.position && (
            <p className="text-red-500 text-sm mt-1">
              {errors.position.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="branchId" className="block text-sm font-medium">
            Branch *
          </label>
          <select
            id="branchId"
            {...register("branchId", { valueAsNumber: true })}
            className="border rounded px-2 py-1 w-full"
          >
            <option value={0}>Select a branch</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          {errors.branchId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.branchId.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="departmentId" className="block text-sm font-medium">
            Department *
          </label>
          <select
            id="departmentId"
            {...register("departmentId", { valueAsNumber: true })}
            className="border rounded px-2 py-1 w-full"
          >
            <option value={0}>Select a department</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {errors.departmentId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.departmentId.message}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="cvFile" className="block text-sm font-medium">
            CV Upload
          </label>
          <div className="flex items-center gap-2">
            <input
              id="cvFile"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) =>
                e.target.files?.[0] && handleFileUpload(e.target.files[0])
              }
              className="border rounded px-2 py-1 flex-1"
              disabled={isUploading}
            />
            {isUploading && (
              <span className="text-sm text-gray-500">Uploading...</span>
            )}
          </div>
          {cvFile && (
            <p className="text-sm text-green-600 mt-1">
              CV uploaded:{" "}
              <a
                href={cvFile}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                View
              </a>
            </p>
          )}
          {errors.cvFile && (
            <p className="text-red-500 text-sm mt-1">{errors.cvFile.message}</p>
          )}
        </div>


        <div>
  <label htmlFor="gender" className="block text-sm font-medium">Gender *</label>
  <select
    id="gender"
    {...register("gender")}
    className="border rounded px-2 py-1 w-full"
  >
    <option value="Male">Male</option>
    <option value="Female">Female</option>
    <option value="Other">Other</option>
  </select>
  {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
</div>

<div>
  <label htmlFor="status" className="block text-sm font-medium">Status *</label>
  <select
    id="status"
    {...register("status")}
    className="border rounded px-2 py-1 w-full"
  >
    <option value="Active">Active</option>
    <option value="Inactive">Inactive</option>
    <option value="On Leave">On Leave</option>
  </select>
  {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
</div>

<div className="md:col-span-2">
  <label htmlFor="address" className="block text-sm font-medium">Address *</label>
  <input
    id="address"
    type="text"
    {...register("address")}
    className="border rounded px-2 py-1 w-full"
  />
  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
</div>

      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
        >
          {editData ? "Update" : "Add"} Employee
        </button>
        {editData && (
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
