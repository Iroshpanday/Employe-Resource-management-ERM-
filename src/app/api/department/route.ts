import { NextResponse,NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/getAuthUser";



// 📌 GET all departments
export async function GET(req: NextRequest) {
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
    const departments = await prisma.department.findMany({orderBy:{id:'desc'}});
    return NextResponse.json(departments, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}

// 📌 CREATE new department
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
    const body = await req.json();
    const { name,location } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const department = await prisma.department.create({
      data: { name , location },
    });

    return NextResponse.json(department, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
}
