import prisma from "@/lib/prisma";
import { hash, compare } from "bcryptjs";

export async function saveRefreshToken(userId: number, token: string, expiresAt: Date) {
  const hashedToken = await hash(token, 10);

  return prisma.refreshToken.create({
    data: {
      userId,
      token: hashedToken,
      expiresAt,
    },
  });
}

export async function validateRefreshToken(userId: number, token: string) {
  const tokens = await prisma.refreshToken.findMany({
    where: { userId, revoked: false },
    orderBy: { createdAt: "desc" },
  });

  for (const t of tokens) {
    if (await compare(token, t.token)) return t;
  }

  return null;
}

export async function revokeRefreshToken(id: number) {
  return prisma.refreshToken.update({
    where: { id },
    data: { revoked: true },
  });
}
