import { NextResponse,NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/getAuthUser";

// 📌 GET one department by ID
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
    const branches = await prisma.branch.findUnique({
      where: { id: Number((await params).id) },
    });

    if (!branches) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(branches, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 📌 UPDATE department
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
    const { name, location } = body;

    const updated = await prisma.branch.update({
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
    await prisma.branch.delete({
      where: { id: Number((await params).id) },
    });

    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error:message }, { status: 500 });
  }
}
