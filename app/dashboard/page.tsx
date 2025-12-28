"use client";

import { useState, useEffect } from "react";
import { DashboardLayout, LoanPlan } from "@/components/DashboardLayout";
import { LoanTab } from "@/components/LoanTab";
import BudgetTab from "@/components/BudgetTab";
import { saveUserData, loadUserData } from "@/lib/storage";

const initialPlans: LoanPlan[] = [];

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<"loan" | "budget">("budget");
  const [plans, setPlans] = useState<LoanPlan[]>(initialPlans);
  const [activePlanId, setActivePlanId] = useState<string | null>(initialPlans[0]?.id || null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>("John Doe");
  const [userEmail, setUserEmail] = useState<string>("john@example.com");

  // Check authentication and redirect if needed
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuthenticated = sessionStorage.getItem("isAuthenticated");
      if (isAuthenticated !== "true") {
        window.location.href = "/login";
        return;
      }
    }
  }, []);

  // Load user info and saved data from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const storedName = sessionStorage.getItem("userName");
        const storedEmail = sessionStorage.getItem("userEmail");
        
        if (storedName) setUserName(storedName);
        if (storedEmail) {
          setUserEmail(storedEmail);
          
          // Load saved plans data from localStorage
          const savedData = loadUserData(storedEmail);
          if (savedData && savedData.plans.length > 0) {
            setPlans(savedData.plans);
            const firstPlanId = savedData.plans[0].id;
            setActivePlanId(firstPlanId);
          } else {
            setPlans(initialPlans);
            setActivePlanId(initialPlans[0]?.id || null);
          }
        } else {
          setPlans(initialPlans);
          setActivePlanId(initialPlans[0]?.id || null);
        }
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setPlans(initialPlans);
      setActivePlanId(initialPlans[0]?.id || null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddNewPlan = () => {
    const newPlan: LoanPlan = {
      id: Date.now().toString(),
      name: `Loan Plan ${plans.length + 1}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    
    const updatedPlans = [...plans, newPlan];
    setPlans(updatedPlans);
    setActivePlanId(newPlan.id);
    setActiveSection("loan"); // Switch to loan section when adding a new plan
    
    if (userEmail) {
      const savedData = loadUserData(userEmail);
      saveUserData(userEmail, updatedPlans, savedData?.savedPlansData || new Map());
    }
  };

  const handlePlanSelect = (planId: string) => {
    setActivePlanId(planId);
    setActiveSection("loan"); // Switch to loan section when selecting a plan
  };

  const handleLogout = () => {
    if (userEmail) {
      const savedData = loadUserData(userEmail);
      if (savedData) {
        saveUserData(userEmail, plans, savedData.savedPlansData);
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout
        plans={plans}
        activePlanId={activePlanId}
        onPlanSelect={handlePlanSelect}
        onAddNewPlan={handleAddNewPlan}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userName={userName}
        userEmail={userEmail}
        onLogout={handleLogout}
      >
        <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      plans={plans}
      activePlanId={activePlanId}
      onPlanSelect={handlePlanSelect}
      onAddNewPlan={handleAddNewPlan}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      userName={userName}
      userEmail={userEmail}
      onLogout={handleLogout}
    >
      <div className="flex-1 overflow-y-auto">
        {activeSection === "loan" ? (
          <LoanTab
            plans={plans}
            activePlanId={activePlanId}
            onPlanSelect={handlePlanSelect}
            onAddNewPlan={handleAddNewPlan}
            onPlansChange={setPlans}
            userEmail={userEmail}
          />
        ) : (
          <BudgetTab />
        )}
      </div>
    </DashboardLayout>
  );
}
