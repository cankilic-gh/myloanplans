"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { fetchTransactions } from "@/lib/api/budget/transactions";
import { fetchCategories, type Category } from "@/lib/api/budget/categories";
import { fetchRecurringExpenses, type RecurringExpense } from "@/lib/api/budget/recurring";

type ChartDataPoint = {
  month: string;
  monthLabel: string;
  [key: string]: string | number; // Dynamic category keys
};

// Generate color based on category type and amount
function getColorForAmount(categoryType: "INCOME" | "EXPENSE", amount: number, maxAmount: number): string {
  if (amount === 0) {
    // Return a very light color for zero amounts
    return categoryType === "INCOME" ? "#d1fae5" : "#fee2e2";
  }
  
  // Normalize amount to 0-1 range (0 = no amount, 1 = max amount)
  const normalizedAmount = maxAmount > 0 ? Math.min(amount / maxAmount, 1) : 0;
  
  // Map normalized amount to color intensity (0.4 to 1.0 for better visibility)
  const intensity = 0.4 + (normalizedAmount * 0.6);
  
  if (categoryType === "INCOME") {
    // Green tones for income (emerald scale)
    // Light: #86efac (emerald-300), Medium: #34d399 (emerald-400), Dark: #10b981 (emerald-500), Darker: #059669 (emerald-600)
    if (intensity < 0.5) {
      return "#86efac"; // emerald-300
    } else if (intensity < 0.7) {
      return "#34d399"; // emerald-400
    } else if (intensity < 0.9) {
      return "#10b981"; // emerald-500
    } else {
      return "#059669"; // emerald-600
    }
  } else {
    // Red tones for expense
    // Light: #fca5a5 (red-300), Medium: #f87171 (red-400), Dark: #ef4444 (red-500), Darker: #dc2626 (red-600)
    if (intensity < 0.5) {
      return "#fca5a5"; // red-300
    } else if (intensity < 0.7) {
      return "#f87171"; // red-400
    } else if (intensity < 0.9) {
      return "#ef4444"; // red-500
    } else {
      return "#dc2626"; // red-600
    }
  }
}

export default function Chart() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryColorMap, setCategoryColorMap] = useState<Map<string, number>>(new Map());

  async function loadChartData() {
    try {
      setLoading(true);
      
      // Load categories first
      const allCategories = await fetchCategories();
      setCategories(allCategories);
      
      // Get last 12 months
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      // Get transactions and recurring expenses for last 12 months
      const [transactions, recurringExpenses] = await Promise.all([
        fetchTransactions(5000), // Get many transactions
        fetchRecurringExpenses(), // Get all recurring expenses
      ]);
      
      console.log("[Chart] Fetched transactions:", transactions.length);
      console.log("[Chart] Fetched recurring expenses:", recurringExpenses.length);
      
      // Group transactions by month and category
      const monthDataMap = new Map<string, Map<string, number>>(); // month -> categoryId -> amount
      
      // Process regular transactions
      transactions.forEach(tx => {
        if (!tx.category) return; // Skip transactions without category
        
        const txDate = new Date(tx.date);
        const txYear = txDate.getFullYear();
        const txMonth = txDate.getMonth();
        
        // Calculate months ago (0 = current month, 11 = 11 months ago)
        const monthsAgo = (currentYear - txYear) * 12 + (currentMonth - txMonth);
        
        if (monthsAgo < 0 || monthsAgo >= 12) return; // Outside last 12 months
        
        const monthKey = `${txYear}-${String(txMonth + 1).padStart(2, '0')}`;
        const categoryId = tx.category.id;
        
        if (!monthDataMap.has(monthKey)) {
          monthDataMap.set(monthKey, new Map<string, number>());
        }
        
        const categoryMap = monthDataMap.get(monthKey)!;
        const currentAmount = categoryMap.get(categoryId) || 0;
        categoryMap.set(categoryId, currentAmount + tx.amount);
      });
      
      // Process recurring expenses
      const virtualCategories: Category[] = [];
      
      recurringExpenses.forEach(recurring => {
        // Parse date string directly to avoid timezone issues
        // nextDueDate format: "2025-12-01" or "2025-12-01T00:00:00.000Z"
        const dateStr = recurring.nextDueDate.split('T')[0]; // Get YYYY-MM-DD part
        const [yearStr, monthStr] = dateStr.split('-');
        const dueYear = parseInt(yearStr, 10);
        const dueMonth = parseInt(monthStr, 10) - 1; // Convert to 0-indexed month
        
        // Calculate months ago (0 = current month, 11 = 11 months ago)
        const monthsAgo = (currentYear - dueYear) * 12 + (currentMonth - dueMonth);
        
        if (monthsAgo < 0 || monthsAgo >= 12) return; // Outside last 12 months
        
        // Use 1-indexed month for monthKey (as we do for transactions)
        const monthKey = `${dueYear}-${String(dueMonth + 1).padStart(2, '0')}`;
        
        // Use category if available AND category type matches recurring type, otherwise create a virtual category based on recurring type
        let categoryId: string;
        let categoryType: "INCOME" | "EXPENSE" = recurring.type === "income" ? "INCOME" : "EXPENSE";
        
        if (recurring.categoryId && recurring.category) {
          // Only use the category if its type matches the recurring expense type
          // This ensures that a recurring expense with type "expense" doesn't show as income
          // even if it's linked to an income category
          if (recurring.category.type.toUpperCase() === categoryType) {
            categoryId = recurring.categoryId;
          } else {
            // Category type doesn't match recurring type, create virtual category
            const virtualCategoryName = recurring.name.toLowerCase().replace(/\s+/g, '-');
            categoryId = `recurring-${virtualCategoryName}`;
            
            if (!allCategories.find(cat => cat.id === categoryId) && 
                !virtualCategories.find(cat => cat.id === categoryId)) {
              const virtualCategory: Category = {
                id: categoryId,
                userId: recurring.userId,
                name: recurring.name,
                type: categoryType,
                createdAt: recurring.createdAt,
              };
              virtualCategories.push(virtualCategory);
            }
          }
        } else {
          // Create a virtual category ID for recurring expenses without category
          // Use the recurring name as a unique identifier
          const virtualCategoryName = recurring.name.toLowerCase().replace(/\s+/g, '-');
          categoryId = `recurring-${virtualCategoryName}`;
          
          // If this virtual category doesn't exist, create it
          if (!allCategories.find(cat => cat.id === categoryId) && 
              !virtualCategories.find(cat => cat.id === categoryId)) {
            const virtualCategory: Category = {
              id: categoryId,
              userId: recurring.userId,
              name: recurring.name,
              type: categoryType,
              createdAt: recurring.createdAt,
            };
            virtualCategories.push(virtualCategory);
          }
        }
        
        if (!monthDataMap.has(monthKey)) {
          monthDataMap.set(monthKey, new Map<string, number>());
        }
        
        const categoryMap = monthDataMap.get(monthKey)!;
        const currentAmount = categoryMap.get(categoryId) || 0;
        categoryMap.set(categoryId, currentAmount + recurring.amount);
        
        console.log("[Chart] Added recurring expense to chart:", {
          name: recurring.name,
          amount: recurring.amount,
          monthKey,
          categoryId,
          type: recurring.type,
        });
      });
      
      // Combine real and virtual categories
      const allCategoriesWithVirtual = [...allCategories, ...virtualCategories];
      setCategories(allCategoriesWithVirtual);
      
      // Calculate max amount per category for color intensity
      const categoryMaxAmounts = new Map<string, number>();
      allCategoriesWithVirtual.forEach(cat => {
        let maxAmount = 0;
        monthDataMap.forEach((categoryMap) => {
          const amount = categoryMap.get(cat.id) || 0;
          if (amount > maxAmount) {
            maxAmount = amount;
          }
        });
        categoryMaxAmounts.set(cat.id, maxAmount);
      });
      
      // Create chart data for last 12 months
      const chartDataPoints: ChartDataPoint[] = [];
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentYear, currentMonth - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth();
        const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
        
        const dataPoint: ChartDataPoint = {
          month: monthKey,
          monthLabel,
        };
        
        // Add amount for each category (including virtual ones)
        const categoryMap = monthDataMap.get(monthKey) || new Map();
        allCategoriesWithVirtual.forEach(cat => {
          const amount = categoryMap.get(cat.id) || 0;
          dataPoint[cat.id] = amount;
        });
        
        chartDataPoints.push(dataPoint);
      }
      
      // Store max amounts for color calculation
      setCategoryColorMap(categoryMaxAmounts as any);
      
      console.log("[Chart] Final chart data:", chartDataPoints);
      setChartData(chartDataPoints);
    } catch (err) {
      console.error("[Chart] Error loading chart data:", err);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadChartData();
    const handleChange = () => loadChartData();
    window.addEventListener("transaction-changed", handleChange);
    return () => window.removeEventListener("transaction-changed", handleChange);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonth = (monthLabel: string) => {
    return monthLabel;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-center min-h-[300px]">
        <div className="text-sm text-slate-500">Loading chart...</div>
      </div>
    );
  }

  // Custom tooltip to show category names
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-slate-900 mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => {
              const category = categories.find(cat => cat.id === entry.dataKey);
              if (!category || entry.value === 0) return null;
              return (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-slate-600">{category.name}:</span>
                  <span className="font-medium text-slate-900">
                    {formatCurrency(entry.value)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
      <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col">
      <div className="text-sm font-semibold text-slate-700 mb-4">Income vs Expenses (Last 12 Months)</div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="monthLabel" 
            tickFormatter={formatMonth}
            stroke="#64748b"
            style={{ fontSize: "12px" }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tickFormatter={(value) => formatCurrency(value)}
            stroke="#64748b"
            style={{ fontSize: "12px" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
            formatter={(value) => {
              const category = categories.find(cat => cat.id === value);
              return category ? category.name : value;
            }}
          />
          {categories.map((category) => {
            const maxAmount = categoryColorMap.get(category.id) || 1;
            return (
              <Bar
                key={category.id}
                dataKey={category.id}
                stackId="a"
                name={category.name}
              >
                {chartData.map((entry, index) => {
                  const amount = entry[category.id] as number || 0;
                  const color = getColorForAmount(
                    category.type as "INCOME" | "EXPENSE",
                    amount,
                    maxAmount
                  );
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Bar>
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

