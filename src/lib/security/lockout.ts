import prisma from "@/lib/prisma";

const MAX_ATTEMPTS = 5; 
const LOCKOUT_MINUTES = 15;

export async function recordLoginAttempt(params: {
  email?: string;
  userId?: number;
  ip: string;
  success: boolean;
}) {
  const { email, userId, ip, success } = params;

  await prisma.loginAttempt.create({
    data: { email, userId, ip, success },
  });

  if (success) return; // nothing more to check

  // Count failed attempts in last 15 minutes
  const since = new Date(Date.now() - LOCKOUT_MINUTES * 60 * 1000);

  const attempts = await prisma.loginAttempt.count({
    where: {
      email,
      ip,
      success: false,
      createdAt: { gte: since },
    },
  });

  // If too many failures → lock account
  if (attempts >= MAX_ATTEMPTS && email) {
    await prisma.user.updateMany({
      where: { email },
      data: { lockedUntil: new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000) },
    });
  }
}

export async function isAccountLocked(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { lockedUntil: true },
  });

  if (!user?.lockedUntil) return false;

  // If lockout expired → clear it
  if (user.lockedUntil < new Date()) {
    await prisma.user.update({
      where: { email },
      data: { lockedUntil: null },
    });
    return false;
  }

  return true;
}

export function getBackoffDelay(attemptCount: number) {
  return Math.min(2000 * Math.pow(2, attemptCount), 15000); 
}
