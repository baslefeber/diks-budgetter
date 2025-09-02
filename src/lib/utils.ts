// Utility functions for styling and common operations
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isAfter, isBefore, isWithinInterval } from 'date-fns';
import { Decimal } from '@prisma/client/runtime/library';

// Utility function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency to Euro format
export function formatCurrency(amount: number | Decimal | string): string {
  let numAmount: number;
  if (typeof amount === 'number') {
    numAmount = amount;
  } else if (typeof amount === 'string') {
    numAmount = parseFloat(amount);
  } else {
    numAmount = amount.toNumber();
  }
  return new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(numAmount);
}

// Format date for display
export function formatDate(date: string | Date | null | undefined, formatStr = 'MMM dd, yyyy'): string {
  // Handle null, undefined, or invalid dates
  if (!date) {
    return 'Invalid date';
  }
  
  const dateObj = new Date(date);
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  return format(dateObj, formatStr);
}

// Check if a budget is currently active
export function isBudgetActive(validFrom: string | null | undefined, validUntil: string | null | undefined): boolean {
  // Handle null or undefined dates
  if (!validFrom || !validUntil) {
    return false;
  }
  
  const now = new Date();
  const from = new Date(validFrom);
  const until = new Date(validUntil);
  
  // Check if dates are valid
  if (isNaN(from.getTime()) || isNaN(until.getTime())) {
    return false;
  }
  
  return isWithinInterval(now, { start: from, end: until });
}

// Calculate budget usage percentage
export function calculateUsagePercentage(total: number | Decimal | string, remaining: number | Decimal | string): number {
  let totalNum: number;
  let remainingNum: number;
  
  if (typeof total === 'number') {
    totalNum = total;
  } else if (typeof total === 'string') {
    totalNum = parseFloat(total);
  } else {
    totalNum = total.toNumber();
  }
  
  if (typeof remaining === 'number') {
    remainingNum = remaining;
  } else if (typeof remaining === 'string') {
    remainingNum = parseFloat(remaining);
  } else {
    remainingNum = remaining.toNumber();
  }
  
  if (totalNum === 0) return 0;
  return Math.round(((totalNum - remainingNum) / totalNum) * 100);
}

// Get budget status color class
export function getBudgetStatusColor(usagePercentage: number, isActive: boolean): string {
  if (!isActive) return 'text-gray-500';
  if (usagePercentage >= 90) return 'text-red-600';
  if (usagePercentage >= 70) return 'text-yellow-600';
  return 'text-green-600';
}

// Get budget status text
export function getBudgetStatusText(usagePercentage: number, isActive: boolean): string {
  if (!isActive) return 'Inactive';
  if (usagePercentage >= 90) return 'Critical';
  if (usagePercentage >= 70) return 'Warning';
  return 'Good';
}

// Validate transaction amount
export function validateTransactionAmount(amount: string): { isValid: boolean; error?: string } {
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }
  
  if (numAmount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }
  
  if (numAmount > 10000) {
    return { isValid: false, error: 'Amount cannot exceed €10,000' };
  }
  
  // Check for more than 2 decimal places
  if (amount.includes('.') && amount.split('.')[1].length > 2) {
    return { isValid: false, error: 'Amount cannot have more than 2 decimal places' };
  }
  
  return { isValid: true };
}

// Generate initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
