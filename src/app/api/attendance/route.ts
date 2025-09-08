import { NextResponse,NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authMiddleware } from "@/lib/middleware/auth";

type DateFilter = {
  gte?: Date;
  lte?: Date;
};

type AttendanceWhere = {
      date?: DateFilter;
      employeeId?: number;
    };

// 📌 GET attendance records with filters
export async function GET(req: NextRequest) {
  try {
    console.log("🔵 GET ATTENDANCE REQUEST RECEIVED");
    
    const auth = authMiddleware(req, ["EMPLOYEE", "HR", "ADMIN"]);
    if (auth instanceof NextResponse) return auth;

    console.log("🔵 Auth user:", { id: auth.id, role: auth.role });

    // Get query parameters for filtering
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const employeeId = searchParams.get('employeeId');

    console.log("🔵 Query params:", { startDate, endDate, employeeId });

    // Build where clause for filtering
    const where: AttendanceWhere = {};

    // Date range filter
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
        // Set end of day for end date
        where.date.lte.setHours(23, 59, 59, 999);
      }
    }

    // Employee filter - HR/Admin can view all, employees can only view their own
    if (auth.role === "EMPLOYEE") {
      // Get the user's employee ID
      const userWithEmployee = await prisma.user.findUnique({
        where: { id: auth.id },
        include: { employee: true }
      });

      if (!userWithEmployee?.employee) {
        console.log("❌ Employee record not found for user");
        return NextResponse.json(
          { error: "Employee record not found for your account" }, 
          { status: 404 }
        );
      }
      where.employeeId = userWithEmployee.employee.id;
    } else if (employeeId) {
      // HR/Admin can filter by specific employee
      where.employeeId = parseInt(employeeId);
    }

    console.log("🔵 Prisma where clause:", where);

    // Fetch attendance records with employee details
    const attendanceRecords = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    console.log("✅ Found", attendanceRecords.length, "attendance records");
    return NextResponse.json(attendanceRecords, { status: 200 });

  } catch (error) {
    console.error("❌ GET attendance error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

// 📌 CREATE check-in record
export async function POST(req: NextRequest) {
  try {
    console.log("🔵 CHECK-IN REQUEST RECEIVED");
    
    const auth = authMiddleware(req, ["EMPLOYEE", "HR", "ADMIN"]);
    if (auth instanceof NextResponse) return auth;

    console.log("🔵 Auth user:", { id: auth.id, role: auth.role });

    // Handle case where body might be empty or null
    type AttendanceBody = { employeeId?: number | string };
    let body: AttendanceBody = {};
    try {
      body = await req.json();
      console.log("🔵 Request body:", body);
    } catch  {
      // If no body is provided, use empty object
      console.log("🔵 No body provided or JSON parse error");
      body = {};
    }
    
    const { employeeId } = body;
    console.log("🔵 Extracted employeeId:", employeeId);

    // Get the user with employee relation to find the correct employee ID
    const userWithEmployee = await prisma.user.findUnique({
      where: { id: auth.id },
      include: { employee: true }
    });

    if (!userWithEmployee) {
      console.log("❌ User not found:", auth.id);
      return NextResponse.json(
        { error: "User not found" }, 
        { status: 404 }
      );
    }

    console.log("🔵 User with employee:", userWithEmployee);

    // Determine target employee ID based on role and request
    let targetEmployeeId: number | null = null;

    if (auth.role === "EMPLOYEE") {
      // Employee can only check themselves in
      if (!userWithEmployee.employee) {
        console.log("❌ Employee record not found for user");
        return NextResponse.json(
          { error: "Employee record not found for your account" }, 
          { status: 404 }
        );
      }
      targetEmployeeId = userWithEmployee.employee.id;
    } else {
      // HR/Admin can check in other employees
      if (employeeId) {
        targetEmployeeId = typeof employeeId === "string" ? parseInt(employeeId) : employeeId;
      } else {
        console.log("❌ HR/Admin error: Employee ID required");
        return NextResponse.json(
          { error: "Employee ID is required for HR/Admin users" }, 
          { status: 400 }
        );
      }
    }

    console.log("🔵 Target employee ID:", targetEmployeeId);

    if (!targetEmployeeId) {
      console.log("❌ General error: Employee ID required");
      return NextResponse.json(
        { error: "Employee ID is required" }, 
        { status: 400 }
      );
    }

    // Verify the target employee exists
    const employeeExists = await prisma.employee.findUnique({
      where: { id: targetEmployeeId },
      select: { id: true, firstName: true, lastName: true }
    });

    if (!employeeExists) {
      console.log("❌ Employee not found:", targetEmployeeId);
      return NextResponse.json(
        { error: "Employee not found" }, 
        { status: 404 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: targetEmployeeId,
          date: today
        }
      }
    });

    if (existingAttendance) {
      console.log("❌ Already checked in today");
      return NextResponse.json(
        { error: "Already checked in today" }, 
        { status: 400 }
      );
    }

    const checkInTime = new Date();

    const attendance = await prisma.attendance.create({
      data: {
        employeeId: targetEmployeeId,
        date: today,
        checkIn: checkInTime,
        checkOut: null,
        hoursWorked: null
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    console.log("✅ Check-in successful:", attendance.id);
    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error("❌ Check-in error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}