// src/lib/auth/getAuthUser.ts
import { cookies } from "next/headers";
import { verifyAccessToken } from "./jwt";
import type { JWTPayload } from "./types";
import type { NextRequest } from "next/server";

/**
 * Returns user payload from:
 * 1. Middleware injected headers (preferred)
 * 2. Access token cookie (fallback)
 */
export async function getAuthUser(req?: NextRequest): Promise<JWTPayload | null> {
  try {
    // 1️⃣ Check injected headers from middleware
    if (req) {
      const id = req.headers.get("x-user-id");
      const email = req.headers.get("x-user-email");
      const role = req.headers.get("x-user-role");
      const employeeId = req.headers.get("x-employee-id");

      if (id && email && role) {
        return {
          id: Number(id),
          email,
          role,
          employeeId: employeeId ? Number(employeeId) : undefined,
        };
      }
    }

    // 2️⃣ Fallback for SSR / RSC
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) return null;

    return verifyAccessToken(token);
  } catch (err) {
    console.warn("❌ getAuthUser failed:", err);
    return null;
  }
}
