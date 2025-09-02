// Budget History component for admin users
'use client';

import { useState } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAdminBudgetHistory } from '@/lib/queries';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Users, 
  DollarSign,
  Activity,
  ChevronDown,
  ChevronUp,
  Clock
} from 'lucide-react';

interface BudgetHistoryProps {
  className?: string;
}

export function BudgetHistory({ className }: BudgetHistoryProps) {
  const [showAll, setShowAll] = useState(false);
  const { data: budgetHistoryData, isLoading, error } = useAdminBudgetHistory(100, 0);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-8 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-6 gap-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-8 ${className}`}>
        <div className="text-center text-red-600">
          <p>Failed to load budget history: {error.message}</p>
        </div>
      </div>
    );
  }

  const budgets = budgetHistoryData?.budgets || [];
  const displayBudgets = showAll ? budgets : budgets.slice(0, 5);

  return (
    <div className={`bg-white rounded-lg shadow-sm p-8 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 style={{ color: 'var(--brand-navy)' }} className="text-2xl font-bold">
          Budget History
          <span className="text-sm font-normal text-gray-600 ml-2">
            (All teams & budgets)
          </span>
        </h3>
        {budgets.length > 5 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-gray-600"
          >
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show All ({budgets.length})
              </>
            )}
          </Button>
        )}
      </div>

      {displayBudgets.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No budget history available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayBudgets.map((budget) => (
            <div 
              key={budget.id} 
              className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
            >
              {/* Budget Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-semibold text-lg text-gray-900 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    {budget.team.name}
                  </h4>
                  <p className="text-gray-600">{budget.name}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={budget.isActive ? "default" : "secondary"} className="text-xs">
                    {budget.isActive ? 'Active' : 'Expired'}
                  </Badge>
                  {budget.isActive && budget.daysRemaining <= 30 && (
                    <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                      <Clock className="h-3 w-3 mr-1" />
                      {budget.daysRemaining} days left
                    </Badge>
                  )}
                </div>
              </div>

              {/* Budget Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    Total Budget
                  </p>
                  <p className="font-semibold text-gray-900">{formatCurrency(budget.totalAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    Remaining
                  </p>
                  <p className="font-semibold text-gray-900">{formatCurrency(budget.remainingAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Spent
                  </p>
                  <p className="font-semibold text-gray-900">{formatCurrency(budget.spentAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Activity className="h-3 w-3 mr-1" />
                    Transactions
                  </p>
                  <p className="font-semibold text-gray-900">{budget.transactionCount}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Usage</span>
                  <span className="text-sm text-gray-600">{Math.round(budget.usagePercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      budget.usagePercentage > 90 ? 'bg-red-500' :
                      budget.usagePercentage > 75 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(budget.usagePercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Date Info */}
              <div className="flex justify-between items-center text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(budget.validFrom, 'MMM dd, yyyy')} - {formatDate(budget.validUntil, 'MMM dd, yyyy')}
                </div>
                {budget.lastTransactionDate && (
                  <div>
                    Last activity: {formatDate(budget.lastTransactionDate, 'MMM dd, yyyy')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {budgets.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Total Budgets</p>
              <p className="font-semibold">{budgets.length}</p>
            </div>
            <div>
              <p className="text-gray-600">Active Budgets</p>
              <p className="font-semibold">{budgets.filter(b => b.isActive).length}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Allocated</p>
              <p className="font-semibold">
                {formatCurrency(budgets.reduce((sum, b) => sum + b.totalAmount, 0))}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Total Spent</p>
              <p className="font-semibold">
                {formatCurrency(budgets.reduce((sum, b) => sum + b.spentAmount, 0))}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
