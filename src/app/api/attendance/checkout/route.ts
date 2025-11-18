import { NextResponse,NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/getAuthUser";

// Utility function to get Nepal time
function getNepalTime(): Date {
  const now = new Date();
  // Nepal is UTC+5:45
  const nepalOffset = 5 * 60 + 45; // 5 hours 45 minutes in minutes
  const localOffset = now.getTimezoneOffset(); // in minutes
  const totalOffset = nepalOffset + localOffset; // total minutes to adjust
  
  return new Date(now.getTime() + totalOffset * 60 * 1000);
}

// Utility function to get today's date in Nepal time (YYYY-MM-DD format)
// function getTodayNepalDate(): string {
//   const nepalTime = getNepalTime();
//   return nepalTime.toISOString().split('T')[0];
// }

// Utility function to format date for start of day in Nepal time
function getStartOfDayNepal(date: Date = new Date()): Date {
  const nepalTime = new Date(date.getTime() + (5 * 60 + 45 + date.getTimezoneOffset()) * 60 * 1000);
  const startOfDay = new Date(nepalTime);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
}

export async function POST(req: NextRequest) {
  try {
    console.log("🔵 CHECK-OUT REQUEST RECEIVED");
    
    // 🔹 Get authenticated user
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔹 Role-based access control
    if (!["ADMIN", "HR","EMPLOYEE"].includes(user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    console.log("🔵 Auth user:", { id: user.id, role: user.role });

    // Handle case where body might be empty or null
    let body: { employeeId?: number | string } = {};
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
      where: { id: user.id },
      include: { employee: true }
    });

    if (!userWithEmployee) {
      console.log("❌ User not found:", user.id);
      return NextResponse.json(
        { error: "User not found" }, 
        { status: 404 }
      );
    }

    console.log("🔵 User with employee:", userWithEmployee);

    // Determine target employee ID based on role and request
    let targetEmployeeId: number | null = null;

    if (user.role === "EMPLOYEE" || user.role === "HR" ) {
      // Employee can only check themselves out
      if (!userWithEmployee.employee) {
        console.log("❌ Employee record not found for user");
        return NextResponse.json(
          { error: "Employee record not found for your account" }, 
          { status: 404 }
        );
      }
      targetEmployeeId = userWithEmployee.employee.id;
    } else {
      // HR/Admin can check out other employees
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

    // Use Nepal time for today's date
    const todayNepal = getStartOfDayNepal();

    // Find today's attendance record (using Nepal date)
    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: targetEmployeeId,
          date: todayNepal
        }
      }
    });

    if (!attendance) {
      console.log("❌ No check-in found for today (Nepal time)");
      return NextResponse.json(
        { error: "No check-in found for today" }, 
        { status: 400 }
      );
    }

    if (attendance.checkOut) {
      console.log("❌ Already checked out today");
      return NextResponse.json(
        { error: "Already checked out today" }, 
        { status: 400 }
      );
    }

    // Use Nepal time for check-out
    const checkOutTimeNepal = getNepalTime();
    const checkInTime = new Date(attendance.checkIn);
    
    // Calculate hours worked (using Nepal times)
    const hoursWorked = (checkOutTimeNepal.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
    const roundedHours = Math.round(hoursWorked * 100) / 100;

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: checkOutTimeNepal,
        hoursWorked: roundedHours
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

    console.log("✅ Check-out successful with Nepal time:", updatedAttendance.id);
    console.log("🔵 Check-in (Nepal):", checkInTime);
    console.log("🔵 Check-out (Nepal):", checkOutTimeNepal);
    console.log("🔵 Hours worked:", roundedHours);
    
    return NextResponse.json(updatedAttendance, { status: 200 });
  } catch (error) {
    console.error("❌ Check-out error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}