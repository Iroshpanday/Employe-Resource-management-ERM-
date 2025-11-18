// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { comparePassword } from "@/lib/auth/hash";
import {
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/auth/jwt";
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "@/lib/auth/cookies";
import { rateLimit } from "@/lib/security/rateLimit";
import { validateEmail } from "@/lib/validation/authValidation";

import { saveRefreshToken } from "@/lib/auth/refreshToken";
import { recordLoginAttempt, isAccountLocked, getBackoffDelay } from "@/lib/security/lockout";

export async function POST(req: NextRequest) {
  console.time("LOGIN_ENDPOINT");

  // Get client IP for rate-limiting and lockout
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // Rate limit: 8 attempts per 10 minutes
  const limit = rateLimit(ip, "login", 8, 600);
  if (!limit.success) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // --- 1️⃣ Check Account Lockout ---
    if (await isAccountLocked(email)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Account temporarily locked due to too many failed login attempts. Please try again later.",
        },
        { status: 423 } // 423 Locked
      );
    }

    // --- 2️⃣ Database Lookup ---
    console.time("DB_LOOKUP");
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        employeeId: true,
      },
    });
    console.timeEnd("DB_LOOKUP");

    // Generic message for security
    if (!user) {
      await recordLoginAttempt({ email, ip, success: false });
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // --- 3️⃣ Exponential Backoff ---
    const attempts = await prisma.loginAttempt.count({
      where: { email, success: false },
    });
    const backoff = getBackoffDelay(attempts);
    await new Promise((resolve) => setTimeout(resolve, backoff));

    // --- 4️⃣ Password Compare ---
    console.time("PASSWORD_COMPARE");
    const valid = await comparePassword(password, user.password);
    console.timeEnd("PASSWORD_COMPARE");

    if (!valid) {
      await recordLoginAttempt({ email, userId: user.id, ip, success: false });
      return NextResponse.json(
        { success: false, error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // --- 5️⃣ Successful login → Record Attempt ---
    await recordLoginAttempt({ email, userId: user.id, ip, success: true });

    // --- 6️⃣ Token Generation ---
    console.time("TOKEN_CREATION");
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId ?? undefined,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    console.timeEnd("TOKEN_CREATION");

    // --- 7️⃣ Set Cookies & Save Refresh Token ---
    const res = NextResponse.json({
      success: true,
      message: "Login successful",
      user: payload,
    });

    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);

    // Save refresh token in DB (hashed)
    await saveRefreshToken(
      user.id,
      refreshToken,
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    );

    console.timeEnd("LOGIN_ENDPOINT");
    return res;
  } catch (error) {
    console.timeEnd("LOGIN_ENDPOINT");
    console.error("Login Error:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
