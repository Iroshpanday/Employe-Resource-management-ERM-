// app/api/auth/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth/getAuthUser";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json(
        { user: null, error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json(
      { user: null, error: "Unauthorized:",err },
      { status: 401 }
    );
  }
}
