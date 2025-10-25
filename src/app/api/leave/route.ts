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
      // Use auth.employeeId instead of auth.id for employees
      if (!auth.employeeId) {
        return NextResponse.json({ 
          error: "Employee profile not found" 
        }, { status: 400 });
      }
      whereClause = { employeeId: auth.employeeId };
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
// 📌 CREATE new leave request
export async function POST(req: NextRequest) {
  try {
    const auth = authMiddleware(req, ["EMPLOYEE", "HR", "ADMIN"]);
      // Add debug logging
  console.log("Auth result:", auth);
  console.log("Auth type:", typeof auth);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const { 
      startDate, 
      endDate, 
      reason, 
      leaveType, 
      numberOfDays, 
      durationType,
      comments,
      employeeId: bodyEmployeeId 
    } = body;

    // Required field validation
    if (!startDate || !endDate || !reason || !leaveType || !numberOfDays || !durationType) {
      return NextResponse.json({ 
        error: "Start date, end date, reason, leave type, number of days, and duration type are required" 
      }, { status: 400 });
    }

    // Validate number of days is positive
    if (numberOfDays <= 0) {
      return NextResponse.json({ 
        error: "Number of days must be greater than 0" 
      }, { status: 400 });
    }

    // Validate duration type
    if (!["FULL_DAY", "HALF_DAY"].includes(durationType)) {
      return NextResponse.json({ 
        error: "Duration type must be either FULL_DAY or HALF_DAY" 
      }, { status: 400 });
    }

    // Employees can only create requests for themselves
    let finalEmployeeId: number;
    
    if (auth.role === "EMPLOYEE") {
      // ✅ CORRECT - use auth.employeeId for employees
      if (!auth.employeeId) {
        return NextResponse.json({ 
          error: "Employee profile not found. Please contact HR." 
        }, { status: 400 });
      }
      finalEmployeeId = auth.employeeId;
    } else {
      // For HR/Admin, use the provided employeeId
      if (!bodyEmployeeId) {
        return NextResponse.json({ 
          error: "Employee ID is required for HR/Admin users" 
        }, { status: 400 });
      }
      finalEmployeeId = parseInt(bodyEmployeeId.toString());
    }

    // Convert dates to Date objects
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    // Validate date range
    if (startDateObj > endDateObj) {
      return NextResponse.json({ 
        error: "Start date cannot be after end date" 
      }, { status: 400 });
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        startDate: startDateObj,
        endDate: endDateObj,
        reason,
        leaveType,
        numberOfDays: parseInt(numberOfDays),
        durationType,
        comments: comments || null,
        employeeId: finalEmployeeId, // Use the correct employeeId
        // Set approvedBy and approvalDate only if provided (for HR/ADMIN creating pre-approved requests)
        ...(body.approvedById && {
          approvedById: parseInt(body.approvedById),
          approvalDate: new Date(),
          status: "APPROVED"
        })
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (error: unknown) {
    console.error("Leave request error:", error); // Add logging
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}