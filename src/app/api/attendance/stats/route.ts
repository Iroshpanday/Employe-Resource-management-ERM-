import { NextResponse,NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authMiddleware } from "@/lib/middleware/auth";

// 📌 GET attendance statistics
export async function GET(req: NextRequest) {
  try {
    const auth = authMiddleware(req);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let whereClause = {};
    
    if (auth.role === "EMPLOYEE") {
      whereClause = { employeeId: auth.id };
    } else if (employeeId) {
      whereClause = { employeeId: parseInt(employeeId) };
    }

    if (startDate && endDate) {
      whereClause = {
        ...whereClause,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };
    }

    // Get total records count
    const totalRecords = await prisma.attendance.count({
      where: whereClause
    });

    // Get records with checkOut (completed days)
    const completedDays = await prisma.attendance.count({
      where: {
        ...whereClause,
        checkOut: { not: null }
      }
    });

    // Get average hours worked
    const avgHours = await prisma.attendance.aggregate({
      where: {
        ...whereClause,
        hoursWorked: { not: null }
      },
      _avg: {
        hoursWorked: true
      }
    });

    // Get today's attendance status
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayWhereClause = {
      ...whereClause,
      date: today
    };

    const todayCheckedIn = await prisma.attendance.count({
      where: todayWhereClause
    });

    const todayCheckedOut = await prisma.attendance.count({
      where: {
        ...todayWhereClause,
        checkOut: { not: null }
      }
    });

    const stats = {
      totalRecords,
      completedDays,
      averageHours: avgHours._avg.hoursWorked || 0,
      today: {
        checkedIn: todayCheckedIn,
        checkedOut: todayCheckedOut,
        pendingCheckOut: todayCheckedIn - todayCheckedOut
      }
    };

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}