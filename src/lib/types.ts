// TypeScript types for the DIKS Budget Management System
// Using Prisma generated types as base

import { Prisma } from '@prisma/client'

// Prisma generated types
export type Team = Prisma.TeamGetPayload<Record<string, never>>
export type User = Prisma.UserGetPayload<{
  include: { team: true }
}>
export type Budget = Prisma.BudgetGetPayload<Record<string, never>>
export type Transaction = Prisma.TransactionGetPayload<{
  include: { budget: true; user: true }
}>

// Extended types with computed fields
export interface BudgetWithStatus extends Omit<Budget, 'totalAmount' | 'remainingAmount'> {
  totalAmount: number;
  remainingAmount: number;
  is_active?: boolean;
  usage_percentage?: number;
}

// API Response types
export interface BudgetSummary {
  total_budgets: number;
  total_amount: number;
  total_remaining: number;
  active_budgets: BudgetWithStatus[];
}

export interface TransactionRequest {
  amount: number;
  description: string;
}

export interface TransactionResponse {
  transaction: Transaction;
  selected_budget: BudgetWithStatus;
  remaining_budget_amount: number;
}

// Error types
export interface ApiError {
  error: string;
  details?: string;
}

// Form types
export interface CreateTransactionForm {
  amount: string;
  description: string;
}

// Zustand store types
export interface AppState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

// Query keys for TanStack Query
export const queryKeys = {
  budgets: (teamId: number) => ['budgets', teamId] as const,
  transactions: (teamId: number) => ['transactions', teamId] as const,
  user: (userId: number) => ['user', userId] as const,
  teams: () => ['teams'] as const,
} as const;
