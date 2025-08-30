import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 📌 GET all departments
export async function GET() {
  try {
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
export async function POST(req: Request) {
  try {
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
