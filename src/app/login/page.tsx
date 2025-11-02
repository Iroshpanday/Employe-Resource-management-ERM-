// app/(protected)/login/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type UserRole = "admin" | "employee" | "HR";

const roleCredentials = {
  admin: {
    email: "admin@gmail.com",
    password: "admin@123"
  },
  employee: {
    email: "kapil@gmail.com",
    password: "kapil@123"
  },
  HR: {
    email: "kisu@gmail.com",
    password: "kisu@123"
  }
};

export default function LoginForm() {
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user, login } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  // Set credentials when role is selected
  useEffect(() => {
    setEmail(roleCredentials[selectedRole].email);
    setPassword(roleCredentials[selectedRole].password);
  }, [selectedRole]);

  const handleRoleClick = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();

      if (res.ok) {
        console.log("Login response data:", data);
        
        login(data.user.email, data.token, {
          id: data.user.id,
          role: data.user.role,
          employeeId: data.user.employeeId
        });
        
        router.push("/");
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex overflow-hidden">
        {/* Left side - Form */}
        <div className="w-full md:w-1/2 p-10">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h2>
            <p className="text-gray-500 text-sm">Enter your credentials to log in</p>
          </div>

          {/* Role Selection Buttons */}
          <div className="flex gap-3 mb-8">
            <button
              type="button"
              onClick={() => handleRoleClick("admin")}
              className={`px-6 py-2 rounded-full font-medium text-sm transition-all ${
                selectedRole === "admin"
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleRoleClick("employee")}
              className={`px-6 py-2 rounded-full font-medium text-sm transition-all ${
                selectedRole === "employee"
                  ? "bg-orange-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Employee
            </button>
            <button
              type="button"
              onClick={() => handleRoleClick("HR")}
              className={`px-6 py-2 rounded-full font-medium text-sm transition-all ${
                selectedRole === "HR"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              HR
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username/Email Field */}
            <div>
              <label className="block text-xs text-gray-600 mb-2">Username*</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-900"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs text-gray-600 mb-2">Password*</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-900"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <a href="#" className="text-sm text-gray-500 hover:text-purple-600">
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-amber-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <a href="#" className="text-purple-600 hover:text-purple-700 font-medium">
                Sign up
              </a>
            </p>
          </form>
        </div>

        {/* Right side - Illustration */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-orange-100 via-pink-100 to-blue-100 items-center justify-center p-10">
          <div className="relative">
            {/* Decorative circles */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-br from-orange-300 to-pink-300 rounded-full opacity-60 blur-2xl"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-blue-300 to-purple-300 rounded-full opacity-40 blur-xl"></div>
            
            {/* Flower pot illustration */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Flower */}
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-pink-300 to-orange-300 rounded-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </div>
                </div>
                {/* Leaves */}
                <div className="absolute -left-8 top-12 w-16 h-24 border-l-2 border-gray-400 rounded-bl-full"></div>
                <div className="absolute -right-8 top-12 w-16 h-24 border-r-2 border-gray-400 rounded-br-full"></div>
                {/* Stem */}
                <div className="absolute left-1/2 -translate-x-1/2 top-20 w-1 h-32 bg-gradient-to-b from-green-400 to-green-600"></div>
              </div>
              
              {/* Pot */}
              <div className="w-40 h-32 bg-gradient-to-b from-teal-600 to-teal-700 rounded-b-3xl flex items-center justify-center relative">
                <div className="absolute top-0 w-full h-8 bg-teal-600 rounded-t-lg"></div>
                {/* Pot pattern */}
                <div className="absolute inset-0 flex flex-col justify-center items-center space-y-2 opacity-30">
                  <div className="w-3/4 h-1 bg-teal-400 rounded"></div>
                  <div className="w-3/4 h-1 bg-teal-400 rounded"></div>
                  <div className="w-3/4 h-1 bg-teal-400 rounded"></div>
                </div>
                {/* Pot handles */}
                <div className="absolute -left-4 top-8 w-8 h-12 border-4 border-teal-600 rounded-l-full"></div>
                <div className="absolute -right-4 top-8 w-8 h-12 border-4 border-teal-600 rounded-r-full"></div>
              </div>
              
              {/* Saucer */}
              <div className="w-48 h-4 bg-gradient-to-b from-gray-300 to-gray-400 rounded-full mt-2 shadow-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}