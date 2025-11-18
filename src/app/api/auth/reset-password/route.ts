import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/hash";
import {
  validatePasswordResetToken,
  markResetTokenUsed
} from "@/lib/auth/passwordReset";

export async function POST(req: NextRequest) {
  const { id, token, newPassword } = await req.json();

  if (!id || !token || !newPassword) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }

  // Validate token
  const record = await validatePasswordResetToken(Number(id), token);
  if (!record) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }

  // Update password
  const hashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: Number(id) },
    data: { password: hashed }
  });

  // Mark token used
  await markResetTokenUsed(record.id);

  return NextResponse.json({ success: true });
}
