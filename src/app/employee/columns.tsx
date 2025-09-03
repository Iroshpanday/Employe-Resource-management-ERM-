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
export const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "position",
    header: "Position",
  },
  {
    accessorKey: "branchDept.branch.name",
    header: "Branch",
    cell: ({ row }) => row.original.branchDept.branch.name,
  },
  {
    accessorKey: "branchDept.department.name",
    header: "Department",
    cell: ({ row }) => row.original.branchDept.department.name,
  },
  {
    accessorKey: "hireDate",
    header: "Hire Date",
    cell: ({ row }) => format(new Date(row.original.hireDate), "MMM dd, yyyy"),
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

            {/* Edit action */}
            <DropdownMenuItem
              onClick={() => table.options.meta?.onEdit?.(employee)}
            >
              Edit
            </DropdownMenuItem>

            {/* View CV action */}
            {employee.cvFile && (
              <DropdownMenuItem
                onClick={() => table.options.meta?.onViewCV?.(employee)}
              >
                View CV
              </DropdownMenuItem>
            )}

            {/* Delete action wrapped inside ConfirmDialog */}
            <ConfirmDialog
              title="Delete Employee"
              description={`Are you sure you want to delete "${employee.firstName} ${employee.lastName}"?`}
              onConfirm={() => table.options.meta?.onDelete?.(employee)}
              trigger={
                // Prevent dropdown from closing immediately before confirm
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Delete
                </DropdownMenuItem>
              }
            />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];