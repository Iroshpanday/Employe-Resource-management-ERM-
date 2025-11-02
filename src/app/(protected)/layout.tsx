// app/(protected)/layout.tsx
"use client";
import React from "react";
import Sidebar from "@/components/shared/Sidebar";
import { Bell, Search, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface LayoutProps {
  children: React.ReactNode;
}

// Helper function to get breadcrumb data based on route
const getBreadcrumbData = (pathname: string) => {
  const routes: { [key: string]: { label: string; path: string }[] } = {
    "/dashboard": [
      { label: "Home", path: "/" },
      { label: "Dashboard", path: "/dashboard" }
    ],
    "/employee": [
      { label: "Home", path: "/" },
      { label: "Employees", path: "/employee" }
    ],
    "/attendance": [
      { label: "Home", path: "/" },
      { label: "Attendance", path: "/attendance" }
    ],
    "/leave": [
      { label: "Home", path: "/" },
      { label: "Leave Management", path: "/leave" }
    ],
    "/project": [
      { label: "Home", path: "/" },
      { label: "Projects", path: "/project" }
    ],
    "/task": [
      { label: "Home", path: "/" },
      { label: "Tasks", path: "/task" }
    ],
    "/department": [
      { label: "Home", path: "/" },
      { label: "Departments", path: "/department" }
    ],
    "/branch": [
      { label: "Home", path: "/" },
      { label: "Branches", path: "/branch" }
    ],
    "/profile": [
      { label: "Home", path: "/" },
      { label: "Profile", path: "/profile" }
    ],
    "/settings": [
      { label: "Home", path: "/" },
      { label: "Settings", path: "/settings" }
    ]
  };

  // Find the matching route or use the pathname
  const matchedRoute = Object.keys(routes).find(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (matchedRoute) {
    return routes[matchedRoute];
  }

  // Default breadcrumb for unknown routes
  const segments = pathname.split('/').filter(segment => segment);
  const breadcrumb = [{ label: "Home", path: "/" }];
  
  let currentPath = "";
  segments.forEach(segment => {
    currentPath += `/${segment}`;
    breadcrumb.push({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      path: currentPath
    });
  });

  return breadcrumb;
};

const TopNavbar = () => {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Get breadcrumb data based on current route
  const breadcrumbItems = getBreadcrumbData(pathname);

  // Show loading state in navbar while auth is being checked
  if (loading) {
    return (
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>🏠</span>
            <span>Home</span>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 font-medium">Loading...</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="animate-pulse bg-gray-200 rounded-lg w-64 h-10"></div>
            <div className="animate-pulse bg-gray-200 rounded-full w-10 h-10"></div>
            <div className="animate-pulse bg-gray-200 rounded-full w-10 h-10"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="animate-pulse bg-gray-200 rounded w-20 h-4 mb-1"></div>
                <div className="animate-pulse bg-gray-200 rounded w-16 h-3"></div>
              </div>
              <div className="animate-pulse bg-gray-200 rounded-full w-8 h-8"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Dynamic Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          {breadcrumbItems.map((item, index) => (
            <div key={item.path} className="flex items-center gap-2">
              {index === 0 ? (
                <span>🏠</span>
              ) : (
                <span className="text-gray-400">›</span>
              )}
              
              {index === breadcrumbItems.length - 1 ? (
                // Last item - current page (not clickable)
                <span className="text-gray-900 font-medium">{item.label}</span>
              ) : (
                // Clickable breadcrumb items
                <Link 
                  href={item.path} 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
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

          {/* Logout Button */}
          <Link 
            href="/logout"
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </Link>

          {/* Country flag */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
              <span className="text-white text-xs">🇺🇸</span>
            </div>
          </div>

          {/* User profile */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role?.toLowerCase() || 'User'}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// Create a separate component that handles the protection
function ProtectedLayoutContent({ children }: LayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

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

export default function ProtectedLayout({ children }: LayoutProps) {
  return <ProtectedLayoutContent>{children}</ProtectedLayoutContent>;
}