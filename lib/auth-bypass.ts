// lib/auth-bypass.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// This is for DEVELOPMENT ONLY - REMOVE before production
interface AuthBypassStore {
  bypassEnabled: boolean;
  mockUser: {
    id: string;
    email: string;
    role: string;
    permissions: string[];
  };
  toggleBypass: () => void;
}

export const useAuthBypass = create<AuthBypassStore>()(
  persist(
    (set) => ({
      bypassEnabled: true, // Default to enabled for now
      mockUser: {
        id: 'mock-user-id',
        email: 'admin@example.com',
        role: 'Admin',
        permissions: ['*'],
      },
      toggleBypass: () => set((state) => ({ bypassEnabled: !state.bypassEnabled })),
    }),
    {
      name: 'auth-bypass-storage',
    }
  )
);