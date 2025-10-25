import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authMiddleware } from "@/lib/middleware/auth";

type CreateBody = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  cvFile?: string;
  branchId: number;
  departmentId: number;
  gender: "Male" | "Female" | "Other";
  address: string;
  status: "Active" | "Inactive" | "On Leave";
};

// GET - any logged-in user can view employees
export async function GET(req: NextRequest) {
  const auth = authMiddleware(req);
  const url = new URL(req.url);
  const includeDeleted = url.searchParams.get('includeDeleted') === 'true';

  if (auth instanceof NextResponse) return auth;

  try {
    const employees = await prisma.employee.findMany({
      where: { 
        
        ...(includeDeleted ? {} : { deletedAt: null }) // Only non-deleted by default
      },
      orderBy: { id: "desc" },
      include: { branchDept: { include: { branch: true, department: true } } },
    });
    return NextResponse.json(employees, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST - only ADMIN can add employees
export async function POST(req: NextRequest) {
  const auth = authMiddleware(req, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await req.json()) as CreateBody;
    const { firstName, lastName, email, phone, position, cvFile, branchId, departmentId,gender,address,status } = body;

    if (!firstName || !lastName || !email || !position || !branchId || !departmentId || !gender || !address || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if email already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { email }
    });

    if (existingEmployee) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const branchDept = await prisma.branchDepartment.upsert({
      where: { branchId_departmentId: { branchId, departmentId } },
      update: {},
      create: { branchId, departmentId },
      select: { id: true },
    });

    const created = await prisma.employee.create({
      data: { firstName, lastName, email, phone, position, cvFile, branchDeptId: branchDept.id, gender,address,status },
      include: { branchDept: { include: { branch: true, department: true } } },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}