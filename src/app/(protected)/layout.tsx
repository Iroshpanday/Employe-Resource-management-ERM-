// src/app/(protected)/layout.tsx
import React from "react";
import Sidebar from "@/components/shared/Sidebar";
import { Bell, Search, Settings } from "lucide-react";
import Image from "next/image";


interface LayoutProps {
  children: React.ReactNode;
}

const TopNavbar = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>🏠</span>
          <span>Home</span>
          <span className="text-gray-400">›</span>
          <span className="text-gray-900 font-medium">Dashboard 2</span>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          {/* Country flag */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
              <span className="text-white text-xs">🇺🇸</span>
            </div>
          </div>

          {/* User profile */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Ella Jones</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
              <Image 
                src="/user.jpg" 
                alt="Ella Jones"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default function ProtectedLayout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full z-40">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Top Navbar */}
        <TopNavbar />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}