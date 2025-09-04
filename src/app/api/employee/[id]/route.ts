import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authMiddleware } from "@/lib/middleware/auth";

type Param = { params: Promise<{ id: string }> };

type PatchBody = Partial<{
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  position: string;
  cvFile?: string;
  branchId: number;
  departmentId: number;
}>;

// GET - any logged-in user can view employees
export async function GET(req: NextRequest, { params }: Param) {
  const auth = authMiddleware(req);
  if (auth instanceof NextResponse) return auth;
  
  try {
    const id = Number((await params).id);
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { branchDept: { include: { branch: true, department: true } } },
    });

    if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(employee, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH - only ADMIN allowed
export async function PATCH(req: NextRequest, { params }: Param) {
  const auth = authMiddleware(req, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;
  
  try {
    const id = Number((await params).id);
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = (await req.json()) as PatchBody;

    let branchDeptId: number | undefined = undefined;
    if (body.branchId && body.departmentId) {
      const bd = await prisma.branchDepartment.upsert({
        where: { branchId_departmentId: { branchId: body.branchId, departmentId: body.departmentId } },
        update: {},
        create: { branchId: body.branchId, departmentId: body.departmentId },
        select: { id: true },
      });
      branchDeptId = bd.id;
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        ...(body.firstName !== undefined ? { firstName: body.firstName } : {}),
        ...(body.lastName !== undefined ? { lastName: body.lastName } : {}),
        ...(body.email !== undefined ? { email: body.email } : {}),
        ...(body.phone !== undefined ? { phone: body.phone } : {}),
        ...(body.position !== undefined ? { position: body.position } : {}),
        ...(body.cvFile !== undefined ? { cvFile: body.cvFile } : {}),
        ...(branchDeptId !== undefined ? { branchDeptId } : {}),
      },
      include: { branchDept: { include: { branch: true, department: true } } },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE - only ADMIN allowed
export async function DELETE(req: NextRequest, { params }: Param) {
  const auth = authMiddleware(req, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;
  
  try {
    const id = Number((await params).id);
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    await prisma.employee.delete({ where: { id } });
    return NextResponse.json({ message: "Deleted" }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
