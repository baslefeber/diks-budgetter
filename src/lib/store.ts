// Zustand store for local UI state management
// Handles current user, loading states, and UI-specific state

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User } from './types';

interface AppState {
  // User state
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Transaction form state
  isTransactionModalOpen: boolean;
  setIsTransactionModalOpen: (open: boolean) => void;
  
  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Demo mode (for switching between users in demo)
  isDemoMode: boolean;
  setIsDemoMode: (demo: boolean) => void;
}

// Create the store with devtools and persistence
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentUser: null,
        isLoading: false,
        isTransactionModalOpen: false,
        error: null,
        isDemoMode: true, // Enable for demo purposes
        
        // Actions
        setCurrentUser: (user) => set({ currentUser: user }),
        setIsLoading: (loading) => set({ isLoading: loading }),
        setIsTransactionModalOpen: (open) => set({ isTransactionModalOpen: open }),
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),
        setIsDemoMode: (demo) => set({ isDemoMode: demo }),
      }),
      {
        name: 'diks-budget-store', // Name for localStorage
        partialize: (state) => ({
          currentUser: state.currentUser,
          isDemoMode: state.isDemoMode,
        }), // Only persist these fields
      }
    ),
    {
      name: 'DIKS Budget Store', // Name for Redux DevTools
    }
  )
);

// Selector hooks for better performance
export const useCurrentUser = () => useAppStore((state) => state.currentUser);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useError = () => useAppStore((state) => state.error);
export const useIsDemoMode = () => useAppStore((state) => state.isDemoMode);
