// lib/security/rateLimit.ts

const store = new Map<
  string,
  { count: number; expires: number }
>();

export function rateLimit(
  key: string,
  action: string,
  maxAttempts: number,
  windowSeconds: number
) {
  const now = Date.now();
  const keyName = `${action}:${key}`;

  const record = store.get(keyName);

  if (!record) {
    store.set(keyName, {
      count: 1,
      expires: now + windowSeconds * 1000,
    });
    return { success: true };
  }

  // Reset window if expired
  if (now > record.expires) {
    store.set(keyName, {
      count: 1,
      expires: now + windowSeconds * 1000,
    });
    return { success: true };
  }

  // Over limit
  if (record.count >= maxAttempts) {
    return { success: false };
  }

  // Count attempt
  record.count++;
  store.set(keyName, record);

  return { success: true };
}
