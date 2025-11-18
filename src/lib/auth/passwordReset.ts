import crypto from "crypto";
import prisma from "@/lib/prisma";
import { hash, compare } from "bcryptjs";

export async function createPasswordResetToken(userId: number) {
  const plain = crypto.randomBytes(32).toString("hex");
  const hashed = await hash(plain, 10);

  // Invalidate all previous reset tokens
  await prisma.passwordResetToken.updateMany({
    where: { userId },
    data: { used: true }
  });

  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      userId,
      token: hashed,
      expiresAt
    }
  });

  return plain; // This is what gets emailed
}

export async function validatePasswordResetToken(userId: number, plain: string) {
  const record = await prisma.passwordResetToken.findFirst({
    where: { userId, used: false },
    orderBy: { createdAt: "desc" }
  });

  if (!record) return null;
  if (record.expiresAt < new Date()) return null;

  const match = await compare(plain, record.token);
  return match ? record : null;
}

export async function markResetTokenUsed(id: number) {
  await prisma.passwordResetToken.update({
    where: { id },
    data: { used: true }
  });
}
