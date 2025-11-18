// app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/auth/jwt";
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
  clearAuthCookies
} from "@/lib/auth/cookies";
import {
  saveRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
} from "@/lib/auth/refreshToken";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { success: false, error: "Refresh token missing" },
      { status: 401 }
    );
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid refresh token" },
      { status: 401 }
    );
  }

  // 1️⃣ Ensure user still exists
  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 401 }
    );
  }

  // 2️⃣ Validate refresh token against DB (hashed comparison)
  const storedToken = await validateRefreshToken(decoded.id, refreshToken);

  // If not found → token reuse attack!
  if (!storedToken) {
    const res = NextResponse.json(
      {
        success: false,
        error: "Token reuse detected. Logged out of all sessions.",
      },
      { status: 403 }
    );

    clearAuthCookies(res);
    

    return res;
  }

  // 3️⃣ Rotate token → revoke old one
  await revokeRefreshToken(storedToken.id);

  // Generate new tokens
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    employeeId: user.employeeId ?? undefined,
  };

  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  // Save new refresh token in DB
  await saveRefreshToken(
    user.id,
    newRefreshToken,
    new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days expiry
  );

  const res = NextResponse.json({
    success: true,
    message: "Token refreshed successfully",
    user: payload,
  });

  setAccessTokenCookie(res, newAccessToken);
  setRefreshTokenCookie(res, newRefreshToken);

  return res;
}
