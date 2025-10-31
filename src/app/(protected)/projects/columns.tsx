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
import { ArrowUpDown } from "lucide-react";
import { Task } from "@prisma/client";

/**
 * Project type used in the table
 */
export type Project = {
  id: number;
  title: string;
  description: string;
  clientName: string;
  startDate: string;
  endDate: string ;
  deadline: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "ACTIVE" | "DEACTIVE" | "COMPLETED";
  progress: number;
  category: string;
  image?: string;
  numberOfMembers: number;
  openTasks: number;
  tasks: Task[];
  projectEmployees: {
    employee: {
      id: number;
      firstName: string;
      lastName: string;
      email?: string;
    };
    
    role: string;
  }[];
};

/**
 * Extend TanStack Table meta to allow
 * passing callbacks for actions.
 */
declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    onEdit?: (row: TData) => void;
    onDelete?: (row: TData) => void;
    onViewDetails?: (row: TData) => void;
    currentUser?: {
      role: string;
    };
  }
}

/**
 * Table column definitions for Project
 */
export const columns: ColumnDef<Project>[] = [
  {
    id: "sn",
    header: "SN",
    cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination.pageIndex;
      const pageSize = table.getState().pagination.pageSize;
      return pageIndex * pageSize + row.index + 1;
    },
    enableSorting: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Project Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.title.length > 20 
          ? `${row.original.title.substring(0, 20)}...` 
          : row.original.title}
      </div>
    ),
  },
  {
    accessorKey: "clientName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Client Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Start Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => format(new Date(row.original.startDate), "MM/dd/yyyy"),
  },
  {
    accessorKey: "endDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          End Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => 
      row.original.endDate 
        ? format(new Date(row.original.endDate), "MM/dd/yyyy")
        : "-",
  },
  {
    accessorKey: "deadline",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Deadline
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => format(new Date(row.original.deadline), "MM/dd/yyyy"),
  },
  {
    accessorKey: "numberOfMembers",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          No of Members
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="text-center">{row.original.numberOfMembers}</div>
    ),
  },
  {
    accessorKey: "priority",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Priority
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const priority = row.original.priority;
      const priorityColors = {
        HIGH: "bg-red-100 text-red-800",
        MEDIUM: "bg-yellow-100 text-yellow-800",
        LOW: "bg-green-100 text-green-800",
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${priorityColors[priority]}`}>
          {priority}
        </span>
      );
    },
  },
  {
    accessorKey: "progress",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Progress
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-16 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${row.original.progress}%` }}
          ></div>
        </div>
        <span className="text-sm text-gray-600 w-8">{row.original.progress}%</span>
      </div>
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
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.original.status;
      const statusColors = {
        ACTIVE: "bg-green-100 text-green-800",
        DEACTIVE: "bg-red-100 text-red-800",
        COMPLETED: "bg-blue-100 text-blue-800",
      };
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${statusColors[status]}`}>
          {status}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const project = row.original;
      const currentUser = table.options.meta?.currentUser;

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
              onClick={() => table.options.meta?.onViewDetails?.(project)}
            >
              View Details
            </DropdownMenuItem>
            
            {/* Only Admin can edit and delete */}
            {currentUser?.role === "ADMIN" && (
              <>
                <DropdownMenuItem
                  onClick={() => table.options.meta?.onEdit?.(project)}
                >
                  Edit
                </DropdownMenuItem>
                <ConfirmDialog
                  title="Delete Project"
                  description={`Are you sure you want to delete "${project.title}"?`}
                  onConfirm={() => table.options.meta?.onDelete?.(project)}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      Delete
                    </DropdownMenuItem>
                  }
                />
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
  },
];