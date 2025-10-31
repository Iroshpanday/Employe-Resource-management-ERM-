import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Include the employee relation to get employeeId
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: {
        employee: {
          select: {
            id: true // Only select the employee id
          }
        }
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
     // DEBUG: Log what we found
    console.log("User found:", {
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      employeeId: user.employee?.id,
      hasEmployee: !!user.employee
    });


    // Create token with employeeId included
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        employeeId: user.employee?.id // Include employeeId if it exists
      },
      SECRET,
      { expiresIn: "1d" }
    );

     // DEBUG: Verify the token contains what we expect
    const decoded = jwt.verify(token, SECRET);
    console.log("Token will contain:", decoded);

    // Return all required user data including id and employeeId
    return NextResponse.json({ 
      token, 
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employee?.id // Also return in user object
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}