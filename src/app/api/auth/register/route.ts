// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/hash";
import { rateLimit } from "@/lib/security/rateLimit";
import { validateEmail, validatePassword } from "@/lib/validation/authValidation";

export async function POST(req: NextRequest) {
  // Rate Limit: Max 5 register attempts per 5 minutes per IP
const ip =
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  req.headers.get("x-real-ip") ||
  "unknown";
  const limitResult = rateLimit(ip, "register", 5, 300);

  if (!limitResult.success) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Try again later." },
      { status: 429 }
    ); 
  }

  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role = body.role || "EMPLOYEE";

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already used" },
        { status: 400 }
      );
    }

    // Check if employee exists to auto-link
    const employee = await prisma.employee.findUnique({
      where: { email },
      include: { user: true }
    });

    if (employee?.user) {
      return NextResponse.json(
        { success: false, error: "Employee already linked to another user" },
        { status: 400 }
      );
    }

    // Hash password
    const hashed = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role,
        employee: employee ? { connect: { id: employee.id } } : undefined,
      },
      select: {
        id: true,
        email: true,
        role: true,
        employeeId: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user: newUser,
        linkedToEmployee: !!employee,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
