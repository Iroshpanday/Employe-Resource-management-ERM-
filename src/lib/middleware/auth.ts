// lib/middleware/auth.ts
import { NextResponse, NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export type JWTPayload = {
  id: number;
  role: string;
  email: string;
  employeeId?: number | null;
  iat?: number;
  exp?: number;
};

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET ;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET ;
// 1. 🚨 MANDATORY: FATAL CHECK (Senior Developer requirement)
if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  // This ensures the application fails to start if secrets are missing.
  // This is a must-have for production-grade security.
  throw new Error(
    "FATAL ERROR: JWT_ACCESS_SECRET and/or JWT_REFRESH_SECRET environment variables are not set."
  );
}

// Hash & compare utilities (unchanged)
export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};
export const comparePassword = async (password: string, hash: string) =>
  bcrypt.compare(password, hash);

// 🔐 Access token generator (short life)
export const generateAccessToken = (payload: JWTPayload) => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};

// 🔄 Refresh token generator (long life)
export const generateRefreshToken = (payload: JWTPayload) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "30d" });
};

// ✅ Verifiers
export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, ACCESS_TOKEN_SECRET) as JWTPayload;
};
export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as JWTPayload;
};

// Middleware helper (unchanged logic, still checks allowedRoles)
export function authMiddleware(req: NextRequest, allowedRoles?: string[]) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return NextResponse.json({ error: "No token provided" }, { status: 401 });

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    if (allowedRoles && !allowedRoles.includes(decoded.role))
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });

    return decoded;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}
