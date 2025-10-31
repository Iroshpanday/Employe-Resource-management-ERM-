"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();

  if (res.ok) {
    console.log("Login response data:", data); // Add this debug log
    
    // FIX: Make sure you're passing employeeId from data.user.employeeId
    login(data.user.email, data.token, {
      id: data.user.id,
      role: data.user.role,
      employeeId: data.user.employeeId // ← This must come from data.user.employeeId
    });
    router.push("/employee");
  } else {
    alert(data.error);
  }
};

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-sm mx-auto space-y-3">
      <h2 className="text-lg font-bold">Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full rounded"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 w-full rounded"
        required
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
        Login
      </button>
    </form>
  );
}