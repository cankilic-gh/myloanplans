"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  isAuthenticated: boolean;
  isGuest: boolean;
  userName: string | null;
  userEmail: string | null;
  verificationEmail: string | null;
  devVerificationCode: string | null;
  codeExpiresAt: number | null;
  emailSent: boolean;
}

interface AuthActions {
  login: (name: string, email: string) => void;
  loginAsGuest: () => void;
  logout: () => void;
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
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: (name: string, email: string) => {
        set({
          isAuthenticated: true,
          isGuest: false,
          userName: name,
          userEmail: email,
        });
      },

      loginAsGuest: () => {
        set({
          isAuthenticated: true,
          isGuest: true,
          userName: "Guest User",
          userEmail: "guest@local",
        });
      },

      logout: () => {
        set(initialState);
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
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        isGuest: state.isGuest,
        userName: state.userName,
        userEmail: state.userEmail,
        verificationEmail: state.verificationEmail,
        devVerificationCode: state.devVerificationCode,
        codeExpiresAt: state.codeExpiresAt,
        emailSent: state.emailSent,
      }),
    }
  )
);
