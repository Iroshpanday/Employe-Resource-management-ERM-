// src/app/api/branch/route.ts
import { NextResponse,NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/getAuthUser";


export async function GET(req: NextRequest) {
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

    // 🔹 Fetch data
    const branches = await prisma.branch.findMany({
      orderBy: { id: "desc" },
    });

    return NextResponse.json(branches, { status: 200 });
  } catch (error: unknown) {
    console.error("❌ Error fetching branches:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
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

    // 🔹 Validate input
    const body = await req.json();
    const { name, location } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Branch name is required" }, { status: 400 });
    }

    // 🔹 Create branch
    const branch = await prisma.branch.create({
      data: { name: name.trim(), location: location?.trim() || null },
    });

    return NextResponse.json(branch, { status: 201 });
  } catch (error: unknown) {
    console.error("❌ Error creating branch:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
