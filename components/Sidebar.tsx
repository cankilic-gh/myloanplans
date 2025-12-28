"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, PiggyBank, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = {
  main: [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Budget", href: "/budget", icon: Wallet },
  ],
  planning: [
    { name: "Loans", href: "/loans", icon: PiggyBank },
    { name: "Settings", href: "/settings", icon: Settings },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Financial Super App
        </h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        <div className="mb-4">
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Main
          </p>
          <div className="mt-2 space-y-1">
            {navigation.main.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
        <div>
          <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Planning
          </p>
          <div className="mt-2 space-y-1">
            {navigation.planning.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

