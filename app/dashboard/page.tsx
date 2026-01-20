"use client";

import { useState, useEffect } from "react";
import { DashboardLayout, LoanPlan } from "@/components/DashboardLayout";
import { LoanTab } from "@/components/LoanTab";
import BudgetTab from "@/components/BudgetTab";
import { saveUserData, loadUserData } from "@/lib/storage";
import { fetchLoanPlans } from "@/lib/api/loan-plans";

const initialPlans: LoanPlan[] = [];

// Guest mode localStorage keys
const GUEST_PLANS_KEY = "guest_loan_plans";
const GUEST_BUDGET_KEY = "guest_budget_data";

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState<"loan" | "budget">("loan");
  const [plans, setPlans] = useState<LoanPlan[]>(initialPlans);
  const [activePlanId, setActivePlanId] = useState<string | null>(initialPlans[0]?.id || null);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Guest User");
  const [userEmail, setUserEmail] = useState<string>("guest@local");
  const [isGuest, setIsGuest] = useState(false);

  // Check authentication - allow guest mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAuthenticated = sessionStorage.getItem("isAuthenticated");
      const guestMode = sessionStorage.getItem("isGuest");

      // Allow guest mode without redirecting to login
      if (isAuthenticated !== "true" && guestMode !== "true") {
        // Set guest mode automatically for first-time visitors
        sessionStorage.setItem("isGuest", "true");
        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("userName", "Guest User");
        sessionStorage.setItem("userEmail", "guest@local");
      }

      setIsGuest(guestMode === "true");
    }
  }, []);

  // Load user info and loan plans from API or localStorage (guest mode)
  useEffect(() => {
    async function loadData() {
      try {
        if (typeof window !== "undefined") {
          const storedName = sessionStorage.getItem("userName");
          const storedEmail = sessionStorage.getItem("userEmail");
          const guestMode = sessionStorage.getItem("isGuest");

          if (storedName) setUserName(storedName);
          if (storedEmail) setUserEmail(storedEmail);

          // Guest mode: Load from localStorage only
          if (guestMode === "true") {
            const savedPlans = localStorage.getItem(GUEST_PLANS_KEY);
            if (savedPlans) {
              const parsedPlans = JSON.parse(savedPlans) as LoanPlan[];
              if (parsedPlans.length > 0) {
                setPlans(parsedPlans);
                setActivePlanId(parsedPlans[0].id);
              } else {
                // No plans, create default one
                const defaultPlan: LoanPlan = {
                  id: Date.now().toString(),
                  name: "Loan Plan 1",
                  createdAt: new Date().toISOString().split("T")[0],
                };
                setPlans([defaultPlan]);
                setActivePlanId(defaultPlan.id);
                localStorage.setItem(GUEST_PLANS_KEY, JSON.stringify([defaultPlan]));
              }
            } else {
              // No saved plans, create default one
              const defaultPlan: LoanPlan = {
                id: Date.now().toString(),
                name: "Loan Plan 1",
                createdAt: new Date().toISOString().split("T")[0],
              };
              setPlans([defaultPlan]);
              setActivePlanId(defaultPlan.id);
              localStorage.setItem(GUEST_PLANS_KEY, JSON.stringify([defaultPlan]));
            }
            setIsLoading(false);
            return;
          }

          if (storedEmail && storedEmail !== "guest@local") {
            // Authenticated user: Load from API
            try {
              const apiPlans = await fetchLoanPlans();
              if (apiPlans && apiPlans.length > 0) {
                const formattedPlans: LoanPlan[] = apiPlans.map(plan => ({
                  id: plan.id,
                  name: plan.name,
                  createdAt: typeof plan.createdAt === 'string'
                    ? plan.createdAt.split("T")[0]
                    : new Date(plan.createdAt).toISOString().split("T")[0],
                }));
                setPlans(formattedPlans);
                setActivePlanId(formattedPlans[0].id);
              } else {
                // No plans from API, create default one
                const defaultPlan: LoanPlan = {
                  id: Date.now().toString(),
                  name: "Loan Plan 1",
                  createdAt: new Date().toISOString().split("T")[0],
                };
                setPlans([defaultPlan]);
                setActivePlanId(defaultPlan.id);
              }
            } catch (apiError) {
              console.error("Error fetching loan plans from API:", apiError);
              const savedData = loadUserData(storedEmail);
              if (savedData && savedData.plans.length > 0) {
                setPlans(savedData.plans);
                setActivePlanId(savedData.plans[0]?.id || null);
              } else {
                // No saved plans, create default one
                const defaultPlan: LoanPlan = {
                  id: Date.now().toString(),
                  name: "Loan Plan 1",
                  createdAt: new Date().toISOString().split("T")[0],
                };
                setPlans([defaultPlan]);
                setActivePlanId(defaultPlan.id);
              }
            }
          } else {
            // No stored email, create default plan
            const defaultPlan: LoanPlan = {
              id: Date.now().toString(),
              name: "Loan Plan 1",
              createdAt: new Date().toISOString().split("T")[0],
            };
            setPlans([defaultPlan]);
            setActivePlanId(defaultPlan.id);
          }
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        // Error occurred, create default plan
        const defaultPlan: LoanPlan = {
          id: Date.now().toString(),
          name: "Loan Plan 1",
          createdAt: new Date().toISOString().split("T")[0],
        };
        setPlans([defaultPlan]);
        setActivePlanId(defaultPlan.id);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
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

    // Guest mode: Save to localStorage
    if (isGuest) {
      localStorage.setItem(GUEST_PLANS_KEY, JSON.stringify(updatedPlans));
    } else if (userEmail) {
      const savedData = loadUserData(userEmail);
      saveUserData(userEmail, updatedPlans, savedData?.savedPlansData || new Map());
    }
  };

  const handlePlanSelect = (planId: string) => {
    setActivePlanId(planId);
    setActiveSection("loan"); // Switch to loan section when selecting a plan
  };

  const handlePlansChange = (updatedPlans: LoanPlan[]) => {
    // Update plans list (called immediately for UI responsiveness)
    setPlans(updatedPlans);
    if (updatedPlans.length > 0) {
      setActivePlanId(updatedPlans[0].id);
    } else {
      setActivePlanId(null);
    }

    // Guest mode: Save to localStorage
    if (isGuest) {
      localStorage.setItem(GUEST_PLANS_KEY, JSON.stringify(updatedPlans));
    }
  };

  // Listen for loan plan deletion to reload from API
  useEffect(() => {
    const handleLoanPlanDeleted = async () => {
      try {
        if (userEmail) {
          const apiPlans = await fetchLoanPlans();
          if (apiPlans && apiPlans.length > 0) {
            const formattedPlans: LoanPlan[] = apiPlans.map(plan => ({
              id: plan.id,
              name: plan.name,
              createdAt: typeof plan.createdAt === 'string' 
                ? plan.createdAt.split("T")[0] 
                : new Date(plan.createdAt).toISOString().split("T")[0],
            }));
            setPlans(formattedPlans);
            setActivePlanId(formattedPlans.length > 0 ? formattedPlans[0].id : null);
          } else {
            setPlans(initialPlans);
            setActivePlanId(null);
          }
        }
      } catch (error) {
        console.error("Error reloading plans:", error);
      }
    };

    window.addEventListener("loan-plan-deleted", handleLoanPlanDeleted);
    return () => window.removeEventListener("loan-plan-deleted", handleLoanPlanDeleted);
  }, [userEmail]);

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
            onPlansChange={handlePlansChange}
            userEmail={userEmail}
          />
        ) : (
          <BudgetTab />
        )}
      </div>
    </DashboardLayout>
  );
}
