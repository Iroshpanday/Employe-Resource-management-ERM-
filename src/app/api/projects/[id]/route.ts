import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/getAuthUser";

type Param = { params: Promise<{ id: string }> };

type PatchBody = Partial<{
  title: string;
  description: string;
  clientName: string;
  startDate: string;
  endDate: string;
  deadline: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "ACTIVE" | "DEACTIVE" | "COMPLETED";
  progress: number;
  category: string;
  image: string;
}>;

// GET - get specific project
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

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        projectEmployees: {
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
        },
        tasks: {
          include: {
            assignedEmployee: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    // Employees can only access projects they are enrolled in
    if (user.role === "EMPLOYEE") {
      const isEnrolled = project.projectEmployees.some(pe => pe.employeeId === user.employeeId);
      if (!isEnrolled) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    const projectWithStats = {
      ...project,
      numberOfMembers: project.projectEmployees.length,
      openTasks: project.tasks.filter(task => task.status !== "COMPLETED").length
    };

    return NextResponse.json(projectWithStats, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH - update project (Admin only)
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

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.clientName !== undefined && { clientName: body.clientName }),
        ...(body.startDate !== undefined && { startDate: new Date(body.startDate) }),
        ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
        ...(body.deadline !== undefined && { deadline: new Date(body.deadline) }),
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.progress !== undefined && { progress: body.progress }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.image !== undefined && { image: body.image }),
      },
      include: {
        projectEmployees: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        tasks: {
          select: {
            id: true,
            status: true
          }
        }
      },
    });

    const updatedWithStats = {
      ...updated,
      numberOfMembers: updated.projectEmployees.length,
      openTasks: updated.tasks.filter(task => task.status !== "COMPLETED").length
    };

    return NextResponse.json(updatedWithStats, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE - delete project (Admin only)
export async function DELETE(req: NextRequest, { params }: Param) {
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

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Delete project (this will cascade delete related records due to onDelete: Cascade)
    await prisma.project.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Project deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}