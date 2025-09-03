// app/api/employee/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type CreateBody = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  cvFile?: string; // path returned from /api/upload
  branchId: number;
  departmentId: number;
};

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { id: "desc" },
      include: {
        branchDept: {
          include: {
            branch: true,
            department: true,
          },
        },
      },
    });
    return NextResponse.json(employees, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateBody;
    const { firstName, lastName, email, phone, position, cvFile, branchId, departmentId } = body;

    if (!firstName || !lastName || !email || !position || !branchId || !departmentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // find or create the BranchDepartment link
    const branchDept = await prisma.branchDepartment.upsert({
      where: { branchId_departmentId: { branchId, departmentId } },
      update: {}, // nothing to update for link row
      create: { branchId, departmentId },
      select: { id: true },
    });

    const created = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        position,
        cvFile,
        branchDeptId: branchDept.id,
      },
      include: {
        branchDept: { include: { branch: true, department: true } },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
