import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Doctor {
  id: string;
  email: string;
  full_name: string;
  created_at?: string;
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  doctor: Doctor | null;
  setAuth: (token: string, doctor: Doctor) => void;
  setToken: (token: string) => void;
  setDoctor: (doctor: Doctor) => void;
  setInitialized: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      isInitialized: false,
      doctor: null,
      setAuth: (token, doctor) => set({ token, doctor, isAuthenticated: true }),
      setToken: (token) => set({ token, isAuthenticated: true }),
      setDoctor: (doctor) => set({ doctor }),
      setInitialized: () => set({ isInitialized: true }),
      clearAuth: () =>
        set({
          token: null,
          isAuthenticated: false,
          isInitialized: true,
          doctor: null,
        }),
    }),
    {
      name: "refai-auth",
      partialize: (state) => ({ token: state.token }),
    },
  ),
);
