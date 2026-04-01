"use client";

import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  isGuest: boolean;
  userName: string | null;
  userEmail: string | null;
  verificationEmail: string | null;
  devVerificationCode: string | null;
  codeExpiresAt: number | null;
  emailSent: boolean;
  initialized: boolean;
}

interface AuthActions {
  login: (name: string, email: string) => void;
  loginAsGuest: () => void;
  logout: () => void;
  initialize: () => Promise<void>;
  setVerificationData: (email: string, code?: string, expiresAt?: number, emailSent?: boolean) => void;
  clearVerificationData: () => void;
  isUserAuthenticated: () => boolean;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  isAuthenticated: false,
  isGuest: false,
  userName: null,
  userEmail: null,
  verificationEmail: null,
  devVerificationCode: null,
  codeExpiresAt: null,
  emailSent: false,
  initialized: false,
};

export const useAuthStore = create<AuthStore>()((set, get) => ({
  ...initialState,

  login: (name: string, email: string) => {
    set({
      isAuthenticated: true,
      isGuest: false,
      userName: name,
      userEmail: email,
      initialized: true,
    });
  },

  loginAsGuest: () => {
    set({
      isAuthenticated: true,
      isGuest: true,
      userName: "Guest User",
      userEmail: "guest@local",
      initialized: true,
    });
  },

  logout: () => {
    set({ ...initialState, initialized: true });
  },

  initialize: async () => {
    // Skip if already authenticated (e.g. guest mode or already logged in)
    const state = get();
    if (state.isAuthenticated) {
      set({ initialized: true });
      return;
    }

    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "same-origin",
      });

      if (response.ok) {
        const data = await response.json();
        set({
          isAuthenticated: true,
          isGuest: false,
          userName: data.user?.name || data.name || null,
          userEmail: data.user?.email || data.email || null,
          initialized: true,
        });
      } else {
        // 401 or other error - keep current state
        set({ initialized: true });
      }
    } catch {
      // Network error - keep current state
      set({ initialized: true });
    }
  },

  setVerificationData: (email: string, code?: string, expiresAt?: number, emailSent?: boolean) => {
    set({
      verificationEmail: email,
      devVerificationCode: code ?? null,
      codeExpiresAt: expiresAt ?? null,
      emailSent: emailSent ?? false,
    });
  },

  clearVerificationData: () => {
    set({
      verificationEmail: null,
      devVerificationCode: null,
      codeExpiresAt: null,
      emailSent: false,
    });
  },

  isUserAuthenticated: () => {
    const state = get();
    return state.isAuthenticated;
  },
}));
