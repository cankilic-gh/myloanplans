"use client";

import { create } from "zustand";

type AuthMode = "login" | "signup";

interface UIStore {
  isAuthModalOpen: boolean;
  authMode: AuthMode;
  openAuthModal: (mode?: AuthMode) => void;
  closeAuthModal: () => void;
  setAuthMode: (mode: AuthMode) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isAuthModalOpen: false,
  authMode: "login",
  openAuthModal: (mode = "login") =>
    set({ isAuthModalOpen: true, authMode: mode }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  setAuthMode: (mode) => set({ authMode: mode }),
}));





