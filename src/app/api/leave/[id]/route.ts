import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/getAuthUser";

// 📌 GET one leave request by ID
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

    const leaveRequest = await prisma.leaveRequest.findUnique({
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

    if (!leaveRequest) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // // Employees can only see their own leave requests
    // if (auth.role === "EMPLOYEE" && leaveRequest.employeeId !== auth.id) {
    //   // let role = auth.role;
    //   // let employeeId = leaveRequest.employeeId;
    //   // let id = auth.id;
    //   // console.log("role:", role);
    //   // console.log("employeeId:", employeeId);
    //   // console.log("id :", id);
    //   return NextResponse.json({ error: "Access denied " }, { status: 403 });
    // }

    return NextResponse.json(leaveRequest, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 📌 UPDATE leave request status (Approve/Reject)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only HR and Admin can update leave requests

    // 🔹 Get authenticated user
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔹 Role-based access control
    if (!["ADMIN", "HR",].includes(user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await req.json();
    const { status, comments } = body;

    if (!status || !["APPROVED", "REJECTED", "PENDING", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Valid status is required" }, { status: 400 });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id: Number((await params).id) },
      data: {
        status,
        ...(comments !== undefined ? { comments } : {})
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 📌 DELETE leave request
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
    if (!["ADMIN", "HR","EMPLOYEE"].includes(user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: Number((await params).id) }
    });

    if (!leaveRequest) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Employees can only delete their own pending requests
    // HR/Admin can delete any request
    if (user.role === "EMPLOYEE") {
      if (leaveRequest.employeeId !== user.employeeId) {
        console.log("Access denied details - auth.id:", user.id, "leaveRequest.employeeId:", leaveRequest.employeeId);
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
      if (leaveRequest.status !== "PENDING") {
        return NextResponse.json({ error: "Only pending requests can be deleted" }, { status: 400 });
      }
    }

    await prisma.leaveRequest.delete({
      where: { id: Number((await params).id) }
    });

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}