import { NextResponse,NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authMiddleware } from "@/lib/middleware/auth";

export async function POST(req: NextRequest) {
  try {
    console.log("🔵 CHECK-OUT REQUEST RECEIVED");
    
    const auth = authMiddleware(req, ["EMPLOYEE", "HR", "ADMIN"]);
    if (auth instanceof NextResponse) return auth;

    console.log("🔵 Auth user:", { id: auth.id, role: auth.role });

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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance record
    const attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: targetEmployeeId,
          date: today
        }
      }
    });

    if (!attendance) {
      console.log("❌ No check-in found for today");
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

    const checkOutTime = new Date();
    const checkInTime = new Date(attendance.checkIn);
    
    // Calculate hours worked
    const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
    const roundedHours = Math.round(hoursWorked * 100) / 100;

    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: checkOutTime,
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

    console.log("✅ Check-out successful:", updatedAttendance.id);
    return NextResponse.json(updatedAttendance, { status: 200 });
  } catch (error) {
    console.error("❌ Check-out error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}