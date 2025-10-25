// app/employee/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { format } from "date-fns";

/**
 * Employee type used in the table
 */
export type Employee = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  hireDate: Date;
  cvFile?: string;
  gender: "Male" | "Female" | "Other";
  address: string;
  status: "Active" | "Inactive" | "On Leave";
  deletedAt?: Date | null; 
  originalEmail?: string | null; 
  originalPhone?: string | null; 
  branchDept: {
    id: number;
    branch: {
      id: number;
      name: string;
    };
    department: {
      id: number;
      name: string;
    };
  };
};

/**
 * Extend TanStack Table meta to allow
 * passing callbacks for edit + delete.
 */
declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    onEdit?: (row: TData) => void;
    onDelete?: (row: TData) => void;
    onViewCV?: (row: TData) => void;
  }
}

/**
 * Table column definitions for Employee
 */

// Replace your columns array with this updated version
import { ArrowUpDown } from "lucide-react";

export const columns: ColumnDef<Employee>[] = [
  {
    id: "sn",
    header: "SN",
    cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination.pageIndex;
      const pageSize = table.getState().pagination.pageSize;
      return pageIndex * pageSize + row.index + 1;
    },
    enableSorting: false, // Disable sorting for SN column
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.firstName} {row.original.lastName}
      </div>
    ),
  },
  {
    accessorKey: "position",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "department",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Department
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    accessorFn: (row) => row.branchDept.department.name,
  },
  {
    accessorKey: "phone",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Mobile
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "hireDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Joining Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => format(new Date(row.original.hireDate), "MM/dd/yyyy"),
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="truncate max-w-[150px]">{row.original.email}</div>
    ),
  },
  {
    accessorKey: "gender",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Gender
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "address",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Address
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="truncate max-w-[150px]">{row.original.address}</div>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Employee Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          row.original.status === "Active"
            ? "bg-green-100 text-green-800"
            : row.original.status === "On Leave"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {row.original.status}
      </span>
    ),
  },
  {
  accessorKey: "deleteStatus",
  header: "Status",
  cell: ({ row }) => {
    const isDeleted = !!row.original.deletedAt;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          isDeleted
            ? "bg-gray-100 text-gray-800"
            : row.original.status === "Active"
            ? "bg-green-100 text-green-800"
            : row.original.status === "On Leave"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {isDeleted ? "Deleted" : row.original.status}
      </span>
    );
  },
},
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const employee = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              aria-label="Open actions menu"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => table.options.meta?.onEdit?.(employee)}
            >
              Edit
            </DropdownMenuItem>
            {employee.cvFile && (
              <DropdownMenuItem
                onClick={() => table.options.meta?.onViewCV?.(employee)}
              >
                View CV
              </DropdownMenuItem>
            )}
            <ConfirmDialog
              title="Delete Employee"
              description={`Are you sure you want to delete "${employee.firstName} ${employee.lastName}"?`}
              onConfirm={() => table.options.meta?.onDelete?.(employee)}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Delete
                </DropdownMenuItem>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false, // Disable sorting for Actions column
  },
];