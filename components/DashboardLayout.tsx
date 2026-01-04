"use client";

import { ReactNode } from "react";
import { DashboardSidebar, type LoanPlan } from "@/components/DashboardSidebar";
import { useAutoLogout } from "@/hooks/useIdleTimer";
import { SessionWarning } from "@/components/SessionWarning";

export type { LoanPlan };

interface DashboardLayoutProps {
  children: ReactNode;
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

export function DashboardLayout({
  children,
  plans,
  activePlanId,
  onPlanSelect,
  onAddNewPlan,
  activeSection,
  onSectionChange,
  userName,
  userEmail,
  onLogout,
}: DashboardLayoutProps) {
  // Auto-logout after 15 minutes of inactivity
  const { showWarning } = useAutoLogout();

  return (
    <>
      <SessionWarning show={showWarning} />
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 overflow-hidden relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(37,99,235,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(16,185,129,0.05),transparent_50%)]" />
        
        {/* Left Panel - Sidebar */}
        <DashboardSidebar
          plans={plans}
          activePlanId={activePlanId}
          onPlanSelect={onPlanSelect}
          onAddNewPlan={onAddNewPlan}
          activeSection={activeSection}
          onSectionChange={onSectionChange}
          userName={userName}
          userEmail={userEmail}
          onLogout={onLogout}
        />

        {/* Right Panel - Main Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden relative z-10">
          {/* Main Content Area */}
          <section className="flex-1 overflow-y-auto min-h-0">
            {children}
          </section>
        </main>
      </div>
    </>
  );
}

