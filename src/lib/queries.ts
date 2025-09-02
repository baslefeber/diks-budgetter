// TanStack Query hooks for server state management
// Handles API calls, caching, background updates, and optimistic updates

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, BudgetWithStatus, Transaction, User, TransactionRequest, BudgetSummary, TransactionResponse } from './types';

// API base URL
const API_BASE = '/api';

// Helper function for API calls
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// BUDGET QUERIES

export function useBudgets(teamId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.budgets(teamId!),
    queryFn: async (): Promise<{ budgets: BudgetWithStatus[]; summary: BudgetSummary }> => {
      return fetchApi(`/budgets?teamId=${teamId}`);
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 1, // Refetch every minute for real-time updates
  });
}

// TRANSACTION QUERIES

export function useTransactions(teamId: number | undefined, limit = 50) {
  return useQuery({
    queryKey: queryKeys.transactions(teamId!),
    queryFn: async (): Promise<{ transactions: Transaction[] }> => {
      return fetchApi(`/transactions?teamId=${teamId}&limit=${limit}`);
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TransactionRequest & { userId: number; teamId: number }): Promise<TransactionResponse> => {
      return fetchApi('/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.budgets(variables.teamId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions(variables.teamId) });
    },
    // Optimistic updates could be added here for better UX
    onMutate: async (newTransaction) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.budgets(newTransaction.teamId) });
      
      // Snapshot the previous value
      const previousBudgets = queryClient.getQueryData(queryKeys.budgets(newTransaction.teamId));
      
      // Optimistically update the cache
      queryClient.setQueryData(queryKeys.budgets(newTransaction.teamId), (old: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (!old) return old;
        
        // Find the budget that would be used and decrease its remaining amount
        const updatedBudgets = old.budgets.map((budget: BudgetWithStatus) => {
          if (budget.is_active && budget.remainingAmount >= newTransaction.amount) {
            return {
              ...budget,
              remainingAmount: budget.remainingAmount - newTransaction.amount,
            };
          }
          return budget;
        });
        
        return {
          ...old,
          budgets: updatedBudgets,
        };
      });
      
      return { previousBudgets };
    },
    onError: (err, newTransaction, context) => {
      // Rollback optimistic update on error
      if (context?.previousBudgets) {
        queryClient.setQueryData(queryKeys.budgets(newTransaction.teamId), context.previousBudgets);
      }
    },
  });
}

// USER QUERIES

export function useUser(userId: number | undefined) {
  return useQuery({
    queryKey: queryKeys.user(userId!),
    queryFn: async (): Promise<{ user: User }> => {
      return fetchApi(`/users?userId=${userId}`);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutes (user data changes infrequently)
  });
}

export function useUserByEmail(email: string | undefined) {
  return useQuery({
    queryKey: ['user', 'email', email],
    queryFn: async (): Promise<{ user: User }> => {
      return fetchApi(`/users?email=${encodeURIComponent(email!)}`);
    },
    enabled: !!email,
    staleTime: 1000 * 60 * 10,
  });
}

export function useTeamUsers(teamId: number | undefined) {
  return useQuery({
    queryKey: ['users', 'team', teamId],
    queryFn: async (): Promise<{ users: User[] }> => {
      return fetchApi('/users', {
        method: 'POST',
        body: JSON.stringify({ teamId }),
      });
    },
    enabled: !!teamId,
    staleTime: 1000 * 60 * 5,
  });
}

// Get all users for demo mode
export function useAllUsers() {
  return useQuery({
    queryKey: ['users', 'all'],
    queryFn: async (): Promise<{ users: User[] }> => {
      return fetchApi('/users/all');
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ADMIN QUERIES

export function useSeedDatabase() {
  return useMutation({
    mutationFn: async (): Promise<{ message: string }> => {
      return fetchApi('/admin/seed', {
        method: 'POST',
      });
    },
  });
}

// Get all transactions across all teams for admin users
export function useAdminTransactions(limit = 50, offset = 0) {
  return useQuery({
    queryKey: ['admin', 'transactions', limit, offset],
    queryFn: async (): Promise<{
      transactions: (Transaction & {
        user: User & { team: { id: number; name: string } };
        budget: { id: number; name: string; team: { id: number; name: string } };
      })[];
      pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
      };
    }> => {
      return fetchApi(`/admin/transactions?limit=${limit}&offset=${offset}`);
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

// Get budget history across all teams for admin users
export function useAdminBudgetHistory(limit = 50, offset = 0) {
  return useQuery({
    queryKey: ['admin', 'budget-history', limit, offset],
    queryFn: async (): Promise<{
      budgets: Array<{
        id: number;
        name: string;
        team: { id: number; name: string };
        totalAmount: number;
        remainingAmount: number;
        spentAmount: number;
        usagePercentage: number;
        validFrom: string;
        validUntil: string;
        isActive: boolean;
        daysRemaining: number;
        transactionCount: number;
        lastTransactionDate: string | null;
        createdAt: string;
        updatedAt: string;
      }>;
      pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
      };
    }> => {
      return fetchApi(`/admin/budget-history?limit=${limit}&offset=${offset}`);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
