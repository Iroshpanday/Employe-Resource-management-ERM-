// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/auth/cookies";

export async function POST() {
  const res = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );

  clearAuthCookies(res);

  return res;
}
