import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authMiddleware } from "@/lib/middleware/auth";

type CreateBody = {
  projectId: number;
  title: string;
  description?: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  dueDate: string;
  assignedTo?: number;
};

export async function POST(req: NextRequest) {
  const auth = authMiddleware(req, ["ADMIN", "HR"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await req.json()) as CreateBody;
    const { projectId, title, description, priority, dueDate, assignedTo } = body;

    if (!projectId || !title || !priority || !dueDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // If assignedTo is provided, check if employee exists and is in the project
    if (assignedTo) {
      const employeeInProject = await prisma.projectEmployee.findUnique({
        where: {
          projectId_employeeId: {
            projectId,
            employeeId: assignedTo
          }
        }
      });

      if (!employeeInProject) {
        return NextResponse.json({ error: "Employee is not in this project" }, { status: 400 });
      }
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description,
        priority,
        dueDate: new Date(dueDate),
        assignedTo: assignedTo || null,
        status: "PENDING"
      },
      include: {
        assignedEmployee: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}