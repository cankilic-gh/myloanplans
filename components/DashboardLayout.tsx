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
      <div className="flex h-screen bg-slate-50 overflow-hidden">
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
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Main Content Area */}
        <section className="flex-1 overflow-y-auto min-h-0">
          {children}
        </section>
      </main>
    </div>
    </>
  );
}

