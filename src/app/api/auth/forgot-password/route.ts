import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateEmail } from "@/lib/validation/authValidation";
import { createPasswordResetToken } from "@/lib/auth/passwordReset";
import { sendResetEmail } from "@/lib/email/sendResetEmail";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const normalized = email?.trim().toLowerCase();

  if (!validateEmail(normalized)) {
    return NextResponse.json({ success: false }, { status: 200 }); 
    // same response to avoid user enumeration
  }

  const user = await prisma.user.findUnique({
    where: { email: normalized }
  });

  // Return same response even if user doesn't exist
  if (!user) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  const token = await createPasswordResetToken(user.id);

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}&uid=${user.id}`;

  await sendResetEmail(user.email, url);

  return NextResponse.json({ success: true });
}
