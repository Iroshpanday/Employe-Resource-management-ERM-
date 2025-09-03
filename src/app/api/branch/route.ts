import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 📌 GET all branches
export async function GET() {
  try {
    const branches = await prisma.branch.findMany({orderBy:{id:'desc'}});
    return NextResponse.json(branches, { status: 200 });
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

    const branches = await prisma.branch.create({
      data: { name , location },
    });

    return NextResponse.json(branches, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
}
