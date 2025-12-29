"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export interface LoanPlan {
  id: string;
  name: string;
  createdAt: string;
}

interface SidebarProps {
  plans: LoanPlan[];
  activePlanId: string | null;
  onPlanSelect: (planId: string) => void;
  onAddNewPlan: () => void;
  activeSection: "loan" | "budget";
  onSectionChange: (section: "loan" | "budget") => void;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

export function DashboardSidebar({
  plans,
  activePlanId,
  onPlanSelect,
  onAddNewPlan,
  activeSection,
  onSectionChange,
  userName = "John Doe",
  userEmail = "john@example.com",
  onLogout,
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem("isAuthenticated");
    sessionStorage.removeItem("userName");
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("verificationEmail");
    sessionStorage.removeItem("devVerificationCode");
    sessionStorage.removeItem("codeExpiresAt");
    sessionStorage.removeItem("emailSent");
    
    // Call custom logout handler if provided
    if (onLogout) {
      onLogout();
    }
    
    // Navigate to landing page
    router.push("/");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const SidebarContent = () => (
    <aside className="flex flex-col h-full bg-white border-r border-slate-200 overflow-hidden">
      {/* User Profile Area - Top */}
      <div className="p-6 border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-lg shadow-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 truncate">{userName}</p>
            <p className="text-sm text-slate-500 truncate">{userEmail}</p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mt-2">
          Welcome back! 👋
        </p>
      </div>

      {/* Loan Plans and Budget Overview - Middle */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Loan Plans Section */}
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
              Loan Plans
            </h2>
            <div className="space-y-1">
              {plans.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No plans yet. Create your first plan!
                </div>
              ) : (
                plans.map((plan) => (
                  <button
                    key={`plan-${plan.id}`}
                    onClick={() => {
                      onPlanSelect(plan.id);
                      onSectionChange("loan");
                    }}
                    type="button"
                    className={cn(
                      "relative w-full text-left py-2.5 transition-colors duration-150 cursor-pointer",
                      "hover:bg-slate-100 rounded-lg",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      activePlanId === plan.id && activeSection === "loan"
                        ? "bg-blue-50 text-slate-900 font-medium pl-4 pr-3"
                        : "text-slate-700 pl-4 pr-3"
                    )}
                    style={{ 
                      paddingLeft: activePlanId === plan.id && activeSection === "loan" ? "calc(1rem - 4px)" : "1rem",
                    }}
                    aria-label={`Select plan: ${plan.name}`}
                    aria-current={activePlanId === plan.id && activeSection === "loan" ? "page" : undefined}
                  >
                    {/* Active indicator - absolute positioned to prevent layout shift */}
                    {activePlanId === plan.id && activeSection === "loan" && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-sm" />
                    )}
                    <div className="relative">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate flex-1">
                          {plan.name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDate(plan.createdAt)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Budget Overview Section */}
          <div>
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
              Budget Management
            </h2>
            <div className="space-y-1">
              <button
                onClick={() => onSectionChange("budget")}
                type="button"
                className={cn(
                  "relative w-full text-left py-2.5 transition-colors duration-150 cursor-pointer",
                  "hover:bg-slate-100 rounded-lg",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  activeSection === "budget"
                    ? "bg-blue-50 text-slate-900 font-medium pl-4 pr-3"
                    : "text-slate-700 pl-4 pr-3"
                )}
                style={{ 
                  paddingLeft: activeSection === "budget" ? "calc(1rem - 4px)" : "1rem",
                }}
                aria-label="Budget Management"
                aria-current={activeSection === "budget" ? "page" : undefined}
              >
                {/* Active indicator */}
                {activeSection === "budget" && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-sm" />
                )}
                <div className="relative">
                  <span className="text-sm font-medium">Your Budget</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Plan Button - Bottom */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-2 flex-shrink-0">
        <Button
          onClick={onAddNewPlan}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200"
          aria-label="Add new loan plan"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Plan
        </Button>
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-slate-200 border-slate-200"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6 text-slate-700" />
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-80 lg:flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed left-0 top-0 bottom-0 w-80 z-50"
          >
            <SidebarContent />
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-white shadow-lg border border-slate-200 border-slate-200"
              aria-label="Close menu"
            >
              <X className="h-5 w-5 text-slate-700" />
            </button>
          </motion.div>
        </>
      )}
    </>
  );
}

