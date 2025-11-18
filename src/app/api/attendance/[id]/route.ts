import { NextResponse,NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/getAuthUser";

// 📌 GET specific attendance record
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔹 Get authenticated user
        const user = await getAuthUser(req);
        if (!user) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    
        // 🔹 Role-based access control
        if (!["ADMIN", "HR","EMPLOYEE"].includes(user.role)) {
          return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

    const attendance = await prisma.attendance.findUnique({
      where: { id: Number((await params).id) },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!attendance) {
      return NextResponse.json(
        { error: "Attendance record not found" }, 
        { status: 404 }
      );
    }

    // Employees can only see their own records
    if (user.role === "EMPLOYEE" && attendance.employeeId !== user.id) {
      return NextResponse.json(
        { error: "Access denied" }, 
        { status: 403 }
      );
    }

    return NextResponse.json(attendance, { status: 200 });
  } catch (error) {
    console.error("Attendance fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

// 📌 UPDATE attendance record (Admin/HR only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔹 Get authenticated user
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔹 Role-based access control
    if (!["ADMIN", "HR"].includes(user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await req.json();
    const { checkIn, checkOut, hoursWorked } = body;

    const attendance = await prisma.attendance.findUnique({
      where: { id: Number((await params).id) }
    });

    if (!attendance) {
      return NextResponse.json(
        { error: "Attendance record not found" }, 
        { status: 404 }
      );
    }

    const updated = await prisma.attendance.update({
      where: { id: Number((await params).id) },
      data: {
        ...(checkIn !== undefined ? { checkIn: new Date(checkIn) } : {}),
        ...(checkOut !== undefined ? { checkOut: new Date(checkOut) } : {}),
        ...(hoursWorked !== undefined ? { hoursWorked } : {})
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

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Attendance update error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}

// 📌 DELETE attendance record
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 🔹 Get authenticated user
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔹 Role-based access control
    if (!["ADMIN", "HR"].includes(user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const attendance = await prisma.attendance.findUnique({
      where: { id: Number((await params).id) }
    });

    if (!attendance) {
      return NextResponse.json(
        { error: "Attendance record not found" }, 
        { status: 404 }
      );
    }

    await prisma.attendance.delete({
      where: { id: Number((await params).id) }
    });

    return NextResponse.json(
      { message: "Attendance record deleted" }, 
      { status: 200 }
    );
  } catch (error) {
    console.error("Attendance delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}