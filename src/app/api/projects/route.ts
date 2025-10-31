import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { authMiddleware } from "@/lib/middleware/auth";
import type { Prisma } from "@prisma/client";

type CreateBody = {
  title: string;
  description: string;
  clientName: string;
  startDate: string;
  endDate?: string;
  deadline: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  category: string;
  image?: string;
};


// GET - all projects with role-based filtering
export async function GET(req: NextRequest) {
  const auth = authMiddleware(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    let whereClause: Prisma.ProjectWhereInput = {};

    // Employees can only see projects they are enrolled in
    if (auth.role === "EMPLOYEE") {
      if (!auth.employeeId) {
        return NextResponse.json({ error: "Employee profile not found" }, { status: 400 });
      }
      
      whereClause = {
        projectEmployees: {
          some: {
            employeeId: auth.employeeId
          }
        }
      };
    }
    
    // Additional filters for HR/Admin
    if (category && (auth.role === "HR" || auth.role === "ADMIN")) {
      whereClause.category = category;
    }
    
    if (status && (auth.role === "HR" || auth.role === "ADMIN")) {
      whereClause.status = status;
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
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
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format response with member count and open tasks
    const projectsWithStats = projects.map(project => ({
      ...project,
      numberOfMembers: project.projectEmployees.length,
      openTasks: project.tasks.filter(task => task.status !== "COMPLETED").length
    }));

    return NextResponse.json(projectsWithStats, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST - create new project (Admin only)
export async function POST(req: NextRequest) {
  const auth = authMiddleware(req, ["ADMIN"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = (await req.json()) as CreateBody;
    const { 
      title, 
      description, 
      clientName, 
      startDate, 
      endDate, 
      deadline, 
      priority, 
      category, 
      image 
    } = body;

    // Validate required fields
    if (!title || !clientName || !startDate || !deadline || !priority || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if project with same title already exists
    const existingProject = await prisma.project.findFirst({
      where: { title }
    });

    if (existingProject) {
      return NextResponse.json({ error: "Project with this title already exists" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        clientName,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        deadline: new Date(deadline),
        priority,
        category,
        image,
        status: "ACTIVE",
        progress: 0
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
        }
      }
    });

    return NextResponse.json({
      ...project,
      numberOfMembers: 0,
      openTasks: 0
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}