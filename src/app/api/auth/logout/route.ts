// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
  try {
    // You can add server-side logout logic here if needed
    // For example: blacklist token, clear server sessions, etc.
    
    const response = NextResponse.json(
      { message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear auth cookie if you're using cookies
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // Expire immediately
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}