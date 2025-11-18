import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/getAuthUser";

type CreateBody = {
  projectId: number;
  employeeId: number;
  role: "MEMBER" | "LEAD";
};

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
    
    const body = (await req.json()) as CreateBody;
    const { projectId, employeeId, role } = body;

    if (!projectId || !employeeId || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check if employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId, deletedAt: null }
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Check if employee is already in the project
    const existingAssignment = await prisma.projectEmployee.findUnique({
      where: {
        projectId_employeeId: {
          projectId,
          employeeId
        }
      }
    });

    if (existingAssignment) {
      return NextResponse.json({ error: "Employee is already in this project" }, { status: 400 });
    }

    // Add employee to project
    const projectEmployee = await prisma.projectEmployee.create({
      data: {
        projectId,
        employeeId,
        role
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true
          }
        }
      }
    });

    return NextResponse.json(projectEmployee, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}