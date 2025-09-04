import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authMiddleware } from "@/lib/middleware/auth";

// 📌 GET all leave requests (with role-based filtering)
export async function GET(req: NextRequest) {
  try {
    const auth = authMiddleware(req);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");
    
    let whereClause = {};
    
    // Employees can only see their own leave requests
    if (auth.role === "EMPLOYEE") {
      whereClause = { employeeId: auth.id };
    } 
    // HR/Admin can filter by employee or see all
    else if (employeeId) {
      whereClause = { employeeId: parseInt(employeeId) };
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: whereClause,
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
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(leaveRequests, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 📌 CREATE new leave request
export async function POST(req: NextRequest) {
  try {
    const auth = authMiddleware(req, ["EMPLOYEE", "HR", "ADMIN"]);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const { startDate, endDate, reason } = body;

    if (!startDate || !endDate || !reason) {
      return NextResponse.json({ error: "Start date, end date, and reason are required" }, { status: 400 });
    }

    // Employees can only create requests for themselves
    const employeeId = auth.role === "EMPLOYEE" ? auth.id : body.employeeId;
    
    if (!employeeId) {
      return NextResponse.json({ error: "Employee ID is required" }, { status: 400 });
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        employeeId: parseInt(employeeId)
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

    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}