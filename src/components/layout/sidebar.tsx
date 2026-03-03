"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  Users,
  FileBarChart,
  Download,
  Settings,
  BookOpen,
  LogOut,
  FileText,
  Building2,
} from "lucide-react";
import { logout } from "@/app/login/actions";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/clients", label: "Clients", icon: Building2 },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/vendors", label: "Vendors", icon: Users },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/reports/quarterly", label: "Quarterly Export", icon: Download },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-slate-900 text-white">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-700">
        <BookOpen className="h-6 w-6 text-blue-400" />
        <span className="text-lg font-semibold">BookKeeper</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-700 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-slate-700">
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors w-full"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            Logout
          </button>
        </form>
      </div>
    </aside>
  );
}
