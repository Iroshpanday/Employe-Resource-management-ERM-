import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Validate password strength (optional)
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Try to find an existing employee with this email to auto-link
    const existingEmployee = await prisma.employee.findUnique({
      where: { email },
      include: { user: true }
    });

    // If employee exists but already has a user account, prevent creation
    if (existingEmployee && existingEmployee.user) {
      return NextResponse.json({ 
        error: "Employee already has a user account" 
      }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || "EMPLOYEE",
        // Auto-link if employee with same email exists and doesn't have a user
        employee: existingEmployee ? { connect: { id: existingEmployee.id } } : undefined,
      },
    });

    return NextResponse.json({ 
      message: "User registered successfully", 
      userId: newUser.id,
      linkedToEmployee: !!existingEmployee,
      employeeId: existingEmployee?.id 
    }, { status: 201 });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}