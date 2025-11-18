// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "@/lib/auth/jwt";
import {
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "@/lib/auth/cookies";
import prisma from "@/lib/prisma";
import { JwtPayload } from "jsonwebtoken";

// Public routes that require no login
const PUBLIC_ROUTES = ["/login", "/api/auth/login"];

// Role-based route access control
const ROLE_ACCESS: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/employee": ["ADMIN", "HR"],
  "/allemployee": ["ADMIN", "HR","EMPLOYEE"],
  "/branch": ["ADMIN", "HR"],
  "/department": ["ADMIN", "HR"],
  "/project": ["ADMIN", "HR", "EMPLOYEE"],
  "/attendance": ["ADMIN", "HR", "EMPLOYEE"],
  "/profile": ["EMPLOYEE", "HR", "ADMIN"],
  "/dashboard": ["ADMIN", "HR", "EMPLOYEE"],
  "/leave": ["ADMIN", "HR", "EMPLOYEE"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1️⃣ Allow public routes
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // 2️⃣ Try validating access token
  const accessToken = req.cookies.get("access_token")?.value;
  let payload;

  try {
    if (!accessToken) throw new Error("Missing access token");
    payload = verifyAccessToken(accessToken);
  } catch (err) {
    console.warn("❌ Access token expired:", err);

    // 3️⃣ Try refreshing token
    const refreshToken = req.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      return redirectToLogin(req, pathname);
    }

    try {
      const decodedRefresh = verifyRefreshToken(refreshToken);

      // Ensure user still exists
      const user = await prisma.user.findUnique({
        where: { id: decodedRefresh.id },
      });

      if (!user) return redirectToLogin(req, pathname);

      // 4️⃣ Rotate tokens
      const newPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId ?? undefined,
      };

      const newAccessToken = generateAccessToken(newPayload);
      const newRefreshToken = generateRefreshToken(newPayload);

      const res = NextResponse.next();

      setAccessTokenCookie(res, newAccessToken);
      setRefreshTokenCookie(res, newRefreshToken);

      payload = newPayload;

      return attachHeaders(res, req, payload);
    } catch {
      console.warn("❌ Refresh token invalid");
      return redirectToLogin(req, pathname);
    }
  }

  // 5️⃣ Role-based access
  for (const [prefix, roles] of Object.entries(ROLE_ACCESS)) {
    if (pathname.startsWith(prefix) && !roles.includes(payload.role)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // 6️⃣ Attach user headers
  return attachHeaders(NextResponse.next(), req, payload);
}

function attachHeaders(
  response: NextResponse,
  req: NextRequest,
  payload: JwtPayload
) {
  const headers = new Headers(req.headers);

  headers.set("x-user-id", String(payload.id));
  headers.set("x-user-role", payload.role);
  headers.set("x-user-email", payload.email);
  if (payload.employeeId) {
    headers.set("x-employee-id", String(payload.employeeId));
  }

  return NextResponse.next({ request: { headers } });
}

function redirectToLogin(req: NextRequest, pathname: string) {
  const url = new URL("/login", req.url);
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url); 
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth/login).*)"],
};
