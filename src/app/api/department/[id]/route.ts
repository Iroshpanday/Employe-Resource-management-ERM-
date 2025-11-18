import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/getAuthUser";

// 📌 GET one department by ID
export async function GET(
  req: Request,
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
    const department = await prisma.department.findUnique({
      where: { id: Number((await params).id) },
    });

    if (!department) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(department, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 📌 UPDATE department
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { name, location } = body;

    const updated = await prisma.department.update({
      where: { id: Number((await params).id) },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(location !== undefined ? { location } : {}),
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 📌 DELETE department
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await prisma.department.delete({
      where: { id: Number((await params).id) },
    });

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error:message }, { status: 500 });
  }
}
