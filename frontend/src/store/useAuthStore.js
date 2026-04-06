import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      // S7: token removed from state — JWT lives in HttpOnly cookie only,
      // never accessible to JavaScript or stored in localStorage
      login: ({ user }) =>
        set({
          user,
          isAuthenticated: true,
        }),

      // S7: logout clears the HttpOnly cookie server-side, then clears local state
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          // proceed with local clear even if the request fails
        }
        set({ user: null, isAuthenticated: false });
      },

      setUser: (user) =>
        set((state) => ({
          ...state,
          user,
        })),
    }),
    {
      name: 'auth-user', // renamed from 'token' — no JWT stored in localStorage
    },
  ),
);
