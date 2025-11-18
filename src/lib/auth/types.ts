// lib/auth/types.ts

export type Role = "ADMIN" | "HR" | "employee";

export interface JWTPayload {
  id: number;
  role: string; 
  email: string; 
  employeeId?: number | null; 
  iat?: number; 
  exp?: number;
}
