// lib/auth/cookies.ts
import { NextResponse } from "next/server";

export function setAccessTokenCookie(res: NextResponse, token: string) {
  res.cookies.set("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 15 * 60,
  });
}

export function setRefreshTokenCookie(res: NextResponse, token: string) {
  res.cookies.set("refresh_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/auth/refresh",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.delete("access_token");
  res.cookies.delete("refresh_token");
}
