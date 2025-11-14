// src/lib/utils/getAuthUser.ts
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/middleware/auth";
import type { JWTPayload } from "@/lib/middleware/auth";


export async function getAuthUser(req?: Request): Promise<JWTPayload | null> {
  try {
    // 🔹 1. Try reading from middleware headers (API routes)
    if (req) {
      const id = req.headers.get("x-user-id");
      const role = req.headers.get("x-user-role");
      const email = req.headers.get("x-user-email");
      const employeeId = req.headers.get("x-employee-id");

      if (id && role && email) {
        return {
          id: Number(id),
          role,
          email,
          employeeId: employeeId ? Number(employeeId) : undefined,
        };
      }
    }

    // 🔹 2. Fallback for server components (decode cookie directly)
    const cookieStore = await cookies(); // ✅ FIXED — now awaited
    const token = cookieStore.get("access_token")?.value;

    if (!token) return null;

    const decoded = verifyAccessToken(token);
    return decoded;
  } catch (err) {
    console.warn("❌ Failed to get authenticated user:", err);
    return null;
  }
}
