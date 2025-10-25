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

/**
 * Branch type used in the table
 */
export type Branch = {
  id: number;
  name: string;
  location?: string;
};

/**
 * Extend TanStack Table meta to allow
 * passing callbacks for edit + delete.
 */
declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    onEdit?: (row: TData) => void;
    onDelete?: (row: TData) => void;
  }
}

/**
 * Table column definitions for Branch
 */
export const columns: ColumnDef<Branch>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Branch Name",
  },
  {
    accessorKey: "Branch location",
    header: "Location",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const branch = row.original;

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
              onClick={() => table.options.meta?.onEdit?.(branch)}
            >
              Edit
            </DropdownMenuItem>

            {/* Delete action wrapped inside ConfirmDialog */}
            <ConfirmDialog
              title="Delete Department"
              description={`Are you sure you want to delete "${branch.name}"?`}
              onConfirm={() => table.options.meta?.onDelete?.(branch)}
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
