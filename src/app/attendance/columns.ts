import { ColumnDef } from "@tanstack/react-table";

export type Attendance = {
  id: number;
  date: string;
  checkIn: string;
  checkOut: string | null;
  hoursWorked: number | null;
  employee: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export const columns: ColumnDef<Attendance>[] = [
  {
    accessorKey: "employee",
    header: "Employee",
    cell: ({ row }) => {
      const employee = row.original.employee;
      return `${employee.firstName} ${employee.lastName}`;
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
  },
  {
    accessorKey: "checkIn",
    header: "Check In",
    cell: ({ row }) => new Date(row.original.checkIn).toLocaleTimeString(),
  },
  {
    accessorKey: "checkOut",
    header: "Check Out",
    cell: ({ row }) => 
      row.original.checkOut ? new Date(row.original.checkOut).toLocaleTimeString() : "Not checked out",
  },
  {
    accessorKey: "hoursWorked",
    header: "Hours Worked",
    cell: ({ row }) => 
      row.original.hoursWorked ? `${row.original.hoursWorked} hrs` : "-",
  }
];