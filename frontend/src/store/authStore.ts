import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService, User } from '../services/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (identifier: string, password: string) => {
        try {
          const response = await authService.login({ identifier, password });
          set({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ user: null, isAuthenticated: false });
          throw error;
        }
      },

      logout: async () => {
        await authService.logout();
        set({ user: null, isAuthenticated: false });
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      initializeAuth: async () => {
        // Use sessionStorage for tab-independent sessions
        const token = sessionStorage.getItem('authToken');
        const storedUser = authService.getStoredUser();

        if (!token || !storedUser) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        // Verify token matches stored user by fetching current user from backend
        try {
          const currentUser = await authService.getCurrentUser();

          // Check if stored user matches current user from token
          if (currentUser.user_id === storedUser.user_id && currentUser.role_id === storedUser.role_id) {
            set({
              user: currentUser,
              isAuthenticated: true,
              isLoading: false,
            });
            // Update stored user to ensure it's in sync
            sessionStorage.setItem('user', JSON.stringify(currentUser));
          } else {
            // Mismatch - clear and logout
            await authService.logout();
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          // Token invalid or expired
          await authService.logout();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'hostel-auth-storage',
      // Use sessionStorage instead of localStorage for tab-independent sessions
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// No cross-tab sync listener - each tab maintains its own independent session
