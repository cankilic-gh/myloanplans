"use client";

import { useEffect, useState } from "react";
import { fetchCategories, createCategory, deleteCategory, type Category } from "@/lib/api/budget/categories";
import { Trash2 } from "lucide-react";

export default function CategoriesList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<"all" | "EXPENSE" | "INCOME">("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [addError, setAddError] = useState<string | null>(null);

  async function loadCategories() {
    try {
      setLoading(true);
      const rows = await fetchCategories();
      setCategories(rows);
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
    const handleChange = () => loadCategories();
    window.addEventListener("category-changed", handleChange);
    return () => window.removeEventListener("category-changed", handleChange);
  }, []);

  const filteredCategories =
    selectedType === "all"
      ? categories
      : categories.filter((c) => c.type === selectedType);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-800 p-4">
        <div className="h-4 bg-slate-200 rounded w-32 mb-4 animate-pulse"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 bg-slate-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">Categories Expense / Income</div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1 text-xs bg-slate-900 dark:bg-slate-700 text-white rounded-md hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
          >
            Add
          </button>
        </div>
        
        {/* Filter buttons */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setSelectedType("all")}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              selectedType === "all"
                ? "bg-slate-900 dark:bg-slate-700 text-white"
                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setSelectedType("EXPENSE")}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              selectedType === "EXPENSE"
                ? "bg-slate-900 dark:bg-slate-700 text-white"
                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setSelectedType("INCOME")}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              selectedType === "INCOME"
                ? "bg-slate-900 dark:bg-slate-700 text-white"
                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            Income
          </button>
        </div>

        {/* Categories list */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredCategories.length === 0 ? (
            <div className="text-sm text-slate-500 dark:text-slate-300">No categories found.</div>
          ) : (
            filteredCategories.map((cat) => (
              <div
                key={cat.id}
                className={`px-3 py-2 rounded-md text-sm flex items-center justify-between group ${
                  cat.type === "INCOME"
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                    : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                }`}
              >
                <span>{cat.name}</span>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (confirm(`Are you sure you want to delete "${cat.name}"?`)) {
                      try {
                        await deleteCategory(cat.id);
                        await loadCategories();
                        window.dispatchEvent(new CustomEvent("category-changed"));
                      } catch (err) {
                        const errorMessage = err instanceof Error ? err.message : "Failed to delete category";
                        alert(errorMessage);
                        console.error("Error deleting category:", err);
                      }
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-200 dark:hover:bg-red-900/30 rounded text-red-700 dark:text-red-400"
                  title="Delete category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Add Category</h2>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setNewCategoryName("");
                  setAddError(null);
                }}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="Category name"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Type</label>
                <select
                  value={newCategoryType}
                  onChange={(e) => setNewCategoryType(e.target.value as "EXPENSE" | "INCOME")}
                  className="w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="EXPENSE">Expense</option>
                  <option value="INCOME">Income</option>
                </select>
              </div>
              {addError && (
                <div className="text-xs text-red-600 dark:text-red-400">{addError}</div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setNewCategoryName("");
                    setAddError(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!newCategoryName.trim()) {
                      setAddError("Please enter a category name");
                      return;
                    }
                    try {
                      setAddError(null);
                      await createCategory({
                        name: newCategoryName.trim(),
                        type: newCategoryType,
                      });
                      setNewCategoryName("");
                      await loadCategories();
                      window.dispatchEvent(new CustomEvent("category-changed"));
                      setIsAddModalOpen(false);
                    } catch (err) {
                      setAddError(err instanceof Error ? err.message : "Failed to add category");
                    }
                  }}
                  className="flex-1 px-4 py-2 text-sm bg-slate-900 dark:bg-slate-700 text-white rounded-md hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

