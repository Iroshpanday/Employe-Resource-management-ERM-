// lib/auth/checkRole.ts
import { Role } from "./types";

export function hasRole(userRole: Role, allowedRoles: Role[]) {
  return allowedRoles.includes(userRole);
}
