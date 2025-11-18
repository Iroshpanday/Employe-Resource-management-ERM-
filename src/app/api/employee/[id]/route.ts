import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authMiddleware } from "@/lib/middleware/auth";
import { softDeleteEmployee } from "@/lib/softDeleteUtils"; // Import the soft delete utility
import { getAuthUser } from "@/lib/auth/getAuthUser";

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
  status?: string; // Add status field for manual status updates
}>;

// GET - any logged-in user can view employees (only non-deleted by default)
export async function GET(req: NextRequest, { params }: Param) {
 // 🔹 Get authenticated user
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔹 Role-based access control
    if (!["ADMIN", "HR","EMPLOYEE"].includes(user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
  try {
    const id = Number((await params).id);
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    // Check if client wants to include deleted employees
    const url = new URL(req.url);
    const includeDeleted = url.searchParams.get('includeDeleted') === 'true';

    const employee = await prisma.employee.findUnique({
      where: { 
        id,
        ...(includeDeleted ? {} : { deletedAt: null }) // Only non-deleted by default
      },
      include: { 
        branchDept: { include: { branch: true, department: true } },
        user: { // Include user info
          select: {
            id: true,
            email: true,
            role: true,
            deletedAt: true
          }
        }
      },
    });

    if (!employee) return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    return NextResponse.json(employee, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH - only ADMIN allowed
export async function PATCH(req: NextRequest, { params }: Param) {
  // 🔹 Get authenticated user
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔹 Role-based access control
    if (!["ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
  
  try {
    const id = Number((await params).id);
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = (await req.json()) as PatchBody;

    // Check if employee exists and is not deleted
    const existingEmployee = await prisma.employee.findUnique({
      where: { id, deletedAt: null }
    });

    if (!existingEmployee) {
      return NextResponse.json({ error: "Employee not found or has been deleted" }, { status: 404 });
    }

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
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(branchDeptId !== undefined ? { branchDeptId } : {}),
      },
      include: { 
        branchDept: { include: { branch: true, department: true } },
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE - only ADMIN allowed (now soft delete)
export async function DELETE(req: NextRequest, { params }: Param) {
  const auth = authMiddleware(req, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;
  
  try {
    const id = Number((await params).id);
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    // Use soft delete instead of hard delete
    await softDeleteEmployee(id);
    
    return NextResponse.json({ message: "Employee soft deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// NEW: RESTORE endpoint - only ADMIN allowed
export async function POST(req: NextRequest, { params }: Param) {
  const auth = authMiddleware(req, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;
  
  try {
    const id = Number((await params).id);
    if (Number.isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    // Check if employee exists (including deleted)
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    if (employee.deletedAt === null) {
      return NextResponse.json({ error: "Employee is not deleted" }, { status: 400 });
    }

    // Restore the employee
    const restoredEmployee = await prisma.employee.update({
      where: { id },
      data: {
        status: "Active",
        deletedAt: null,
        email: employee.originalEmail || employee.email,
        phone: employee.originalPhone || employee.phone,
        originalEmail: null,
        originalPhone: null
      },
      include: { 
        branchDept: { include: { branch: true, department: true } },
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      },
    });

    // Restore user if exists
    if (employee.user) {
      await prisma.user.update({
        where: { id: employee.user.id },
        data: {
          deletedAt: null,
          email: employee.user.originalEmail || employee.user.email,
          originalEmail: null
        }
      });
    }

    return NextResponse.json({ 
      message: "Employee restored successfully",
      employee: restoredEmployee 
    }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}