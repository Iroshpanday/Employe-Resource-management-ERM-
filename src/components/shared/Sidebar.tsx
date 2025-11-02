// src/components/shared/Sidebar.tsx
"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Users, 
  Calendar, 
  ClipboardList, 
  Briefcase,
  // DollarSign,
  UserCheck,
  Briefcase as Jobs,
  Building2,
  GraduationCap,
  ChevronRight,
  ChevronDown,
  Store
} from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import Image from "next/image";

// Define menu structure with categories
const menuCategories = [
  {
    title: "MAIN",
    items: [
      { 
        name: "Dashboard", 
        href: "/dashboard", 
        icon: Home,
        hasSubmenu: true,
        submenu: [
          { name: "Dashboard 1", href: "/dashboard" },
          { name: "Dashboard 2", href: "/dashboard-2" }
        ]
      },
      { 
        name: "Projects", 
        href: "/projects", 
        icon: Briefcase,
        hasSubmenu: false
      },
      { 
        name: "Employees", 
        href: "/employee", 
        icon: Users,
        hasSubmenu: true,
        submenu: [
          { name: "Add Employee", href: "/employee" },
           { name: "All Employee", href: "/allemployee" },
        ]
      },
      { 
        name: "Leave Management", 
        href: "/leave", 
        icon: Calendar,
        hasSubmenu: false
      },
      { 
        name: "Attendance", 
        href: "/attendance", 
        icon: ClipboardList,
        hasSubmenu: false
      },
      // { 
      //   name: "Holidays", 
      //   href: "/holidays", 
      //   icon: Calendar,
      //   hasSubmenu: false
      // },
      // { 
      //   name: "Clients", 
      //   href: "/clients", 
      //   icon: Users,
      //   hasSubmenu: false
      // },
      // { 
      //   name: "Payroll", 
      //   href: "/payroll", 
      //   icon: DollarSign,
      //   hasSubmenu: false
      // },
      { 
        name: "Leaders", 
        href: "/leaders", 
        icon: UserCheck,
        hasSubmenu: false
      },
      { 
        name: "Jobs", 
        href: "/jobs", 
        icon: Jobs,
        hasSubmenu: false
      },
      { 
        name: "Branch", 
        href: "/branch", 
        icon: Store,
        hasSubmenu: false
      },
      { 
        name: "Departments", 
        href: "/department", 
        icon: Building2,
        hasSubmenu: false
      },
      { 
        name: "Training", 
        href: "/training", 
        icon: GraduationCap,
        hasSubmenu: false
      }
    ]
  }
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
   const { user } = useAuth();

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className={clsx(
      "bg-white border-r border-gray-200 w-64 min-h-screen overflow-y-auto",
      className
    )}>
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">EMS</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">EMS</span>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            <Image 
              src="/user.jpg" 
              alt="Sarah Smith"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.email?.split('@')[0] || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user?.role?.toLowerCase() || 'User'}</p>
          </div>
        </div>
      </div>

      

      {/* Navigation Menu */}
      <nav className="p-4 space-y-6">
        {menuCategories.map((category) => (
          <div key={category.title}>
            {/* Category Title */}
            <div className="mb-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {category.title}
              </span>
            </div>

            {/* Menu Items */}
            <div className="space-y-1">
              {category.items.map((item) => (
                <div key={item.name}>
                  {/* Main Menu Item */}
                  <div className="relative">
                    {item.hasSubmenu ? (
                      <button
                        onClick={() => toggleExpanded(item.name)}
                        className={clsx(
                          "w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group",
                          isActive(item.href)
                            ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={clsx(
                            "w-5 h-5",
                            isActive(item.href) ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                          )} />
                          <span>{item.name}</span>
                        </div>
                        {expandedItems.includes(item.name) ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className={clsx(
                          "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group",
                          isActive(item.href)
                            ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <item.icon className={clsx(
                          "w-5 h-5",
                          isActive(item.href) ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"
                        )} />
                        <span>{item.name}</span>
                      </Link>
                    )}
                  </div>

                  {/* Submenu Items */}
                  {item.hasSubmenu && expandedItems.includes(item.name) && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.submenu?.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={clsx(
                            "block px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                            isActive(subItem.href)
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          )}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Help Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-200">
        <div className="text-center">
          {/* <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-blue-600 text-xs">?</span>
          </div>
          <p className="text-xs text-gray-600 mb-2">Need help?</p> */}
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}