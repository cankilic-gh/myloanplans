// API client for budget categories

export interface Category {
  id: string;
  userId: string;
  name: string;
  type: string; // "INCOME" | "EXPENSE"
  budgetLimit?: number | null;
  createdAt: string;
}

export interface NewCategory {
  name: string;
  type: "INCOME" | "EXPENSE";
  budgetLimit?: number | null;
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch('/api/budget/categories', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch categories');
  }

  const data = await response.json();
  return data.categories;
}

export async function createCategory(category: NewCategory): Promise<Category> {
  const response = await fetch('/api/budget/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(category),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create category');
  }

  const data = await response.json();
  return data.category;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const response = await fetch(`/api/budget/categories/${categoryId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete category');
  }
}
