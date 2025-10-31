import { ColumnDef } from "@tanstack/react-table";

export type LeaveRequest = {
  id: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  comments?: string;
  createdAt: string;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
};

type TableMeta = {
  currentUser: {
    employeeId: number;
    role: "ADMIN" | "HR" | "EMPLOYEE";
  };
  onApprove?: (leave: LeaveRequest) => void;
  onReject?: (leave: LeaveRequest) => void;
  onDelete?: (leave: LeaveRequest) => void;
  onCancel?: (leave: LeaveRequest) => void;
};

export const columns: ColumnDef<LeaveRequest>[] = [
  {
    accessorKey: "employee",
    header: "Employee",
    cell: ({ row }) => {
      const employee = row.original.employee;
      return `${employee.firstName} ${employee.lastName}`;
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => new Date(row.original.startDate).toLocaleDateString(),
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => new Date(row.original.endDate).toLocaleDateString(),
  },
  {
    accessorKey: "reason",
    header: "Reason",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusColors = {
        PENDING: "bg-yellow-100 text-yellow-800",
        APPROVED: "bg-green-100 text-green-800",
        REJECTED: "bg-red-100 text-red-800",
      };
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs ${statusColors[status]}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Requested On",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },

  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const leaveRequest = row.original;
      const meta = table.options.meta as TableMeta;
      const currentUser = meta?.currentUser;

      // Permission checks
      const userid = currentUser?.employeeId;
      const employeeid = leaveRequest.employee.id;
      console.log("Current User ID:", userid);
      console.log("Leave Request Employee ID:", employeeid);
      const isOwnRequest = currentUser?.employeeId === leaveRequest.employee.id;
      console.log("Is Own Request:", isOwnRequest);
      const isPending = leaveRequest.status === "PENDING";

      // Only Admin can delete any request
      const canDelete = currentUser?.role === "ADMIN";

      // HR/Admin can approve/reject, but HR cannot approve their own requests
      const canApprove =
        isPending &&
        (currentUser?.role === "ADMIN" ||
          (currentUser?.role === "HR" && !isOwnRequest));

      const canReject =
        isPending &&
        (currentUser?.role === "ADMIN" ||
          (currentUser?.role === "HR" && !isOwnRequest));
          
      const canCancel = isPending && isOwnRequest;

      return (
        <div className="flex gap-2">
          {canApprove && (
            <button
              onClick={() => meta.onApprove?.(leaveRequest)}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Approve
            </button>
          )}
          {canReject && (
            <button
              onClick={() => meta.onReject?.(leaveRequest)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Reject
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => meta.onDelete?.(leaveRequest)}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Delete
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => meta.onCancel?.(leaveRequest)}
              className="text-orange-600 hover:text-orange-800 text-sm font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      );
    },
  },
];
