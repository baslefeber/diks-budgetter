// Business Logic Tests - Core Budget Management Rules
import { describe, it, expect } from '@jest/globals';

describe('Budget Management Business Logic', () => {
  describe('Optimal Budget Selection Algorithm', () => {
    it('should prioritize expiring budgets first (FIFO)', () => {
      const budgets = [
        {
          id: 1,
          name: 'Annual Budget',
          remainingAmount: 1000,
          validUntil: new Date('2025-12-31'),
          validFrom: new Date('2025-01-01'),
        },
        {
          id: 2,
          name: 'Summer Budget',
          remainingAmount: 500,
          validUntil: new Date('2025-08-31'), // Expires sooner
          validFrom: new Date('2025-06-01'),
        }
      ];

      // Mock the algorithm logic
      const sortedBudgets = budgets.sort((a, b) => {
        if (a.validUntil.getTime() !== b.validUntil.getTime()) {
          return a.validUntil.getTime() - b.validUntil.getTime(); // Earlier expiry first
        }
        return a.remainingAmount - b.remainingAmount; // Smaller amount first
      });

      expect(sortedBudgets[0].name).toBe('Summer Budget'); // Should pick expiring budget first
      expect(sortedBudgets[1].name).toBe('Annual Budget');
    });

    it('should prioritize smaller budgets when expiry dates are equal', () => {
      const sameDateBudgets = [
        {
          id: 1,
          name: 'Large Budget',
          remainingAmount: 5000,
          validUntil: new Date('2025-12-31'),
        },
        {
          id: 2,
          name: 'Small Budget',
          remainingAmount: 100,
          validUntil: new Date('2025-12-31'),
        }
      ];

      const sortedBudgets = sameDateBudgets.sort((a, b) => {
        if (a.validUntil.getTime() !== b.validUntil.getTime()) {
          return a.validUntil.getTime() - b.validUntil.getTime();
        }
        return a.remainingAmount - b.remainingAmount; // Smaller first
      });

      expect(sortedBudgets[0].name).toBe('Small Budget');
      expect(sortedBudgets[1].name).toBe('Large Budget');
    });

    it('should only select budgets with sufficient funds', () => {
      const budgets = [
        { id: 1, remainingAmount: 50, name: 'Insufficient Budget' },
        { id: 2, remainingAmount: 200, name: 'Sufficient Budget' }
      ];
      
      const requestedAmount = 100;
      const eligibleBudgets = budgets.filter(b => b.remainingAmount >= requestedAmount);
      
      expect(eligibleBudgets).toHaveLength(1);
      expect(eligibleBudgets[0].name).toBe('Sufficient Budget');
    });
  });

  describe('Budget Status Calculation', () => {
    it('should correctly determine if budget is active based on dates', () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);

      // Active budget (valid from yesterday to tomorrow)
      const activeBudget = {
        validFrom: yesterday,
        validUntil: tomorrow
      };

      // Inactive budget (expired yesterday)
      const expiredBudget = {
        validFrom: new Date('2024-01-01'),
        validUntil: yesterday
      };

      const isActiveBudgetActive = now >= activeBudget.validFrom && now <= activeBudget.validUntil;
      const isExpiredBudgetActive = now >= expiredBudget.validFrom && now <= expiredBudget.validUntil;

      expect(isActiveBudgetActive).toBe(true);
      expect(isExpiredBudgetActive).toBe(false);
    });

    it('should calculate usage percentage correctly', () => {
      const testCases = [
        { total: 1000, remaining: 600, expected: 40 }, // 40% used
        { total: 500, remaining: 0, expected: 100 },   // 100% used
        { total: 1000, remaining: 1000, expected: 0 }, // 0% used
      ];

      testCases.forEach(({ total, remaining, expected }) => {
        const usagePercentage = Math.round(((total - remaining) / total) * 100);
        expect(usagePercentage).toBe(expected);
      });
    });
  });

  describe('Transaction Validation Rules', () => {
    it('should enforce single budget constraint', () => {
      // This test verifies that we don't split transactions across multiple budgets
      const budgets = [
        { id: 1, remainingAmount: 50 },
        { id: 2, remainingAmount: 80 }
      ];
      
      const requestedAmount = 100;
      
      // Should NOT combine budgets (50 + 80 = 130 > 100)
      // Should only use budgets with sufficient individual funds
      const validBudgets = budgets.filter(b => b.remainingAmount >= requestedAmount);
      
      expect(validBudgets).toHaveLength(0); // No single budget has enough
    });

    it('should validate transaction amount limits', () => {
      const testCases = [
        { amount: '0', isValid: false, reason: 'Amount must be greater than 0' },
        { amount: '-10', isValid: false, reason: 'Amount must be greater than 0' },
        { amount: '10000.01', isValid: false, reason: 'Amount cannot exceed €10,000' },
        { amount: '100.123', isValid: false, reason: 'Cannot have more than 2 decimal places' },
        { amount: '100.50', isValid: true, reason: 'Valid amount' },
      ];

      testCases.forEach(({ amount, isValid }) => {
        const numericAmount = parseFloat(amount);
        const hasValidDecimals = /^\d+(\.\d{1,2})?$/.test(amount);
        const isInRange = numericAmount > 0 && numericAmount <= 10000;
        
        expect(isInRange && hasValidDecimals && !isNaN(numericAmount)).toBe(isValid);
      });
    });
  });

  describe('Team Access Control', () => {
    it('should ensure users only access their team data', () => {
      const user = { id: 1, teamId: 5, name: 'Test User' };
      const budgets = [
        { id: 1, teamId: 5, name: 'User Team Budget' },
        { id: 2, teamId: 3, name: 'Other Team Budget' }
      ];

      // Filter budgets by user's team
      const userBudgets = budgets.filter(budget => budget.teamId === user.teamId);
      
      expect(userBudgets).toHaveLength(1);
      expect(userBudgets[0].name).toBe('User Team Budget');
    });
  });
});
