"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    
    const data = await res.json();
    if (res.ok) {
      alert(`User registered! ${data.linkedToEmployee ? 
        'Auto-linked to existing employee' : 
        'No employee linked - create employee profile separately'}`);
      setEmail("");
      setPassword("");
    } else {
      alert(data.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-sm mx-auto space-y-3">
      <h2 className="text-lg font-bold">Register User Account</h2>
      
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
      
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border p-2 w-full rounded"
      >
        <option value="EMPLOYEE">Employee</option>
        <option value="HR">HR</option>
        <option value="ADMIN">Admin</option>
      </select>

      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        disabled={user?.role !== "ADMIN"}
      >
        Register User
      </button>
      
      {user?.role !== "ADMIN" && (
        <p className="text-red-500 text-sm">Only administrators can register new users</p>
      )}
      
      <p className="text-sm text-gray-600">
        Note: If an employee with this email exists, the account will be automatically linked.
        Otherwise, you can link to an employee later.
      </p>
    </form>
  );
}