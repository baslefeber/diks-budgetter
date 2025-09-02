// Unit tests for utility functions
import {
  formatCurrency,
  formatDate,
  validateTransactionAmount,
  calculateUsagePercentage,
  getBudgetStatusText,
  getInitials,
  isBudgetActive
} from '@/lib/utils';

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(100)).toBe('€100.00');
      expect(formatCurrency(100.5)).toBe('€100.50');
      expect(formatCurrency(1000.99)).toBe('€1,000.99');
      expect(formatCurrency(0)).toBe('€0.00');
    });
  });

  describe('formatDate', () => {
    it('formats valid dates correctly', () => {
      const testDate = new Date('2024-01-15T10:30:00Z');
      expect(formatDate(testDate)).toBe('Jan 15, 2024');
      expect(formatDate(testDate.toISOString())).toBe('Jan 15, 2024');
      expect(formatDate(testDate, 'MMM dd, HH:mm')).toMatch(/Jan 15, \d{2}:\d{2}/);
    });

    it('handles invalid dates gracefully', () => {
      expect(formatDate(null)).toBe('Invalid date');
      expect(formatDate(undefined)).toBe('Invalid date');
      expect(formatDate('')).toBe('Invalid date');
      expect(formatDate('invalid-date')).toBe('Invalid date');
    });
  });

  describe('validateTransactionAmount', () => {
    it('validates correct amounts', () => {
      expect(validateTransactionAmount('100')).toEqual({ isValid: true });
      expect(validateTransactionAmount('100.50')).toEqual({ isValid: true });
      expect(validateTransactionAmount('0.01')).toEqual({ isValid: true });
    });

    it('rejects invalid amounts', () => {
      expect(validateTransactionAmount('0')).toEqual({
        isValid: false,
        error: 'Amount must be greater than 0'
      });
      expect(validateTransactionAmount('-10')).toEqual({
        isValid: false,
        error: 'Amount must be greater than 0'
      });
      expect(validateTransactionAmount('abc')).toEqual({
        isValid: false,
        error: 'Please enter a valid number'
      });
      expect(validateTransactionAmount('10000.01')).toEqual({
        isValid: false,
        error: 'Amount cannot exceed €10,000'
      });
      expect(validateTransactionAmount('10.123')).toEqual({
        isValid: false,
        error: 'Amount cannot have more than 2 decimal places'
      });
    });
  });

  describe('calculateUsagePercentage', () => {
    it('calculates usage percentage correctly', () => {
      expect(calculateUsagePercentage(100, 50)).toBe(50);
      expect(calculateUsagePercentage(100, 0)).toBe(100);
      expect(calculateUsagePercentage(100, 100)).toBe(0);
      expect(calculateUsagePercentage(0, 0)).toBe(0);
    });
  });

  describe('getBudgetStatusText', () => {
    it('returns correct status text', () => {
      expect(getBudgetStatusText(50, true)).toBe('Good');
      expect(getBudgetStatusText(75, true)).toBe('Warning');
      expect(getBudgetStatusText(95, true)).toBe('Critical');
      expect(getBudgetStatusText(50, false)).toBe('Inactive');
    });
  });

  describe('getInitials', () => {
    it('generates initials correctly', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('A. Feather')).toBe('AF');
      expect(getInitials('Single')).toBe('S');
      expect(getInitials('Multiple Middle Names')).toBe('MM');
    });
  });

  describe('isBudgetActive', () => {
    it('determines budget active status correctly', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      expect(isBudgetActive(yesterday.toISOString(), tomorrow.toISOString())).toBe(true);
      expect(isBudgetActive(tomorrow.toISOString(), tomorrow.toISOString())).toBe(false);
    });

    it('handles invalid dates gracefully', () => {
      expect(isBudgetActive(null, null)).toBe(false);
      expect(isBudgetActive(undefined, undefined)).toBe(false);
      expect(isBudgetActive('', '')).toBe(false);
      expect(isBudgetActive('invalid-date', 'another-invalid-date')).toBe(false);
      expect(isBudgetActive('2024-01-01', null)).toBe(false);
      expect(isBudgetActive(null, '2024-01-01')).toBe(false);
    });
  });
});
