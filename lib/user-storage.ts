// Client-side user storage utilities
// Stores user credentials in localStorage (for development only)
// In production, use proper backend authentication

export interface UserCredentials {
  email: string;
  name: string;
  password: string; // In production, this should be hashed
}

export function saveUserCredentials(user: UserCredentials) {
  if (typeof window === "undefined") return;

  try {
    // Get existing users or create new array
    const existingUsers = getStoredUsers();
    const userIndex = existingUsers.findIndex((u) => u.email === user.email);

    if (userIndex >= 0) {
      // Update existing user
      existingUsers[userIndex] = user;
    } else {
      // Add new user
      existingUsers.push(user);
    }

    localStorage.setItem("app_users", JSON.stringify(existingUsers));
  } catch (error) {
    console.error("Failed to save user credentials:", error);
  }
}

export function getStoredUsers(): UserCredentials[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem("app_users");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load user credentials:", error);
    return [];
  }
}

export function getUserByEmail(email: string): UserCredentials | null {
  const users = getStoredUsers();
  return users.find((u) => u.email === email) || null;
}

export function clearUserCredentials() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem("app_users");
  } catch (error) {
    console.error("Failed to clear user credentials:", error);
  }
}

