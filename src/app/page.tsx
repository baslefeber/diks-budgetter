// Main application page - DIKS Budget Management Tool
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { TransactionForm } from '@/components/transaction-form';
import { UserSelector } from '@/components/user-selector';
import { BudgetHistory } from '@/components/budget-history';
import { useBudgets, useTransactions, useUserByEmail, useSeedDatabase, useAdminTransactions } from '@/lib/queries';
import { useAppStore } from '@/lib/store';
import { getInitials, formatDate, formatCurrency } from '@/lib/utils';
import { 
  RefreshCw, 
  AlertCircle, 
  Database
} from 'lucide-react';

// Default demo user - A. Feather (admin)
const DEFAULT_USER_EMAIL = 'a.feather@diks.net';

export default function HomePage() {
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<number | null>(null);
  
  const currentUser = useAppStore((state) => state.currentUser);
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);
  const error = useAppStore((state) => state.error);
  const clearError = useAppStore((state) => state.clearError);
  const isDemoMode = useAppStore((state) => state.isDemoMode);

  // Fetch default user if no current user
  const { data: defaultUserData } = useUserByEmail(
    !currentUser ? DEFAULT_USER_EMAIL : undefined
  );

  // Set default user when data loads
  useEffect(() => {
    if (!currentUser && defaultUserData?.user) {
      setCurrentUser(defaultUserData.user);
    }
  }, [currentUser, defaultUserData, setCurrentUser]);

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'admin';
  
  // Fetch data based on current user
  const { 
    data: budgetData, 
    isLoading: budgetsLoading, 
    refetch: refetchBudgets 
  } = useBudgets(currentUser?.teamId);
  
  // Transaction data for team members (shows their team's transactions only)
  const { 
    data: transactionData, 
    isLoading: transactionsLoading, 
    refetch: refetchTransactions 
  } = useTransactions(currentUser?.teamId);

  // Admin-only query for all transactions across teams
  const { 
    data: adminTransactionData, 
    isLoading: adminTransactionsLoading, 
    refetch: refetchAdminTransactions 
  } = useAdminTransactions(50, 0);

  const seedDatabaseMutation = useSeedDatabase();

  const handleRefresh = () => {
    refetchBudgets();
    refetchTransactions();
    if (isAdmin) {
      refetchAdminTransactions();
    }
  };

  const handleSeedDatabase = async () => {
    try {
      await seedDatabaseMutation.mutateAsync();
      // Refresh data after seeding
      setTimeout(() => {
        handleRefresh();
      }, 1000);
    } catch (error) {
      console.error('Failed to seed database:', error);
    }
  };

  // Loading state
  if (!currentUser || budgetsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg" />
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Exact DIKS Style */}
      <header style={{ backgroundColor: 'var(--brand-navy)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* DIKS Logo - Exact match to reference */}
            <div style={{ color: 'var(--brand-yellow)' }} className="font-bold text-4xl italic tracking-wide">
              DIKS
            </div>

            {/* User Info & Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <div 
                  style={{ backgroundColor: 'var(--brand-yellow)', color: 'var(--brand-navy)' }}
                  className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium"
                >
                  {getInitials(currentUser.name)}
                </div>
                <span className="font-medium">{currentUser.name}</span>
                <span style={{ color: 'var(--brand-yellow-light)' }}>{currentUser.team?.name}</span>
              </div>
              
              {/* Demo mode user selector */}
              {isDemoMode && <UserSelector />}
              
              {/* Admin buttons - Available for demo */}
              {(process.env.NODE_ENV === 'development' || process.env.VERCEL) && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    className="text-white hover:bg-brand-navy-dark text-xs"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSeedDatabase}
                    disabled={seedDatabaseMutation.isPending}
                    className="text-white hover:bg-brand-navy-dark text-xs"
                  >
                    <Database className="h-4 w-4 mr-1" />
                    {seedDatabaseMutation.isPending ? 'Seeding...' : 'Seed DB'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </Button>
          </div>
        )}

        {/* Page Title - matching reference exactly */}
        <div className="max-w-7xl mx-auto mb-8">
          <h1 style={{ color: 'var(--brand-navy)' }} className="text-4xl font-bold mb-2">
            Manage budgets at DIKS
          </h1>
        </div>

        {budgetData ? (
          <>
            {/* Main Content - Two Column Layout exactly like reference */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Side - Budget Information (2/3 width) */}
              <div className="lg:col-span-2">
                {budgetData && budgetData.budgets.length > 0 ? (
                  (() => {
                    // Get available budgets (both active and inactive for visibility)
                    const availableBudgets = budgetData.budgets;
                    
                    // Select budget to display
                    let displayBudget = null;
                    if (selectedBudgetId) {
                      displayBudget = availableBudgets.find(b => b.id === selectedBudgetId);
                    }
                    // Fallback to first active budget, then first budget
                    if (!displayBudget) {
                      displayBudget = availableBudgets.find(b => b.is_active) || availableBudgets[0];
                      if (displayBudget && !selectedBudgetId) {
                        setSelectedBudgetId(displayBudget.id);
                      }
                    }
                    
                    return displayBudget ? (
                      <div key={displayBudget.id} className="bg-white rounded-lg shadow-sm p-8">
                        {/* Budget Header with Selector */}
                        <div className="mb-8">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <h2 style={{ color: 'var(--brand-navy)' }} className="text-3xl font-bold mb-2">
                                {displayBudget.name}
                              </h2>
                              {/* Budget Status Badge */}
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                displayBudget.is_active 
                                  ? 'bg-green-100 text-green-800 border border-green-200' 
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}>
                                {displayBudget.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            {/* Budget Selector */}
                            {availableBudgets.length > 1 && (
                              <div className="flex items-center space-x-2">
                                <label className="text-sm font-medium text-gray-700">Budget:</label>
                                <select 
                                  value={selectedBudgetId || displayBudget.id}
                                  onChange={(e) => setSelectedBudgetId(parseInt(e.target.value))}
                                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent"
                                >
                                  {availableBudgets.map((budget) => (
                                    <option key={budget.id} value={budget.id}>
                                      {budget.name} {budget.is_active ? '(Active)' : '(Inactive)'}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Budget Overview - Improved Design */}
                        <div className="grid grid-cols-2 gap-12 mb-12">
                          {/* Total Budget */}
                          <div>
                            <h3 style={{ color: 'var(--brand-navy)' }} className="text-6xl font-bold mb-2">
                              {formatCurrency(displayBudget.totalAmount)}
                            </h3>
                            <p className="text-gray-600 text-lg">Initial Budget</p>
                          </div>

                          {/* Remaining Budget */}
                          <div>
                            <h3 style={{ color: 'var(--brand-navy)' }} className="text-6xl font-bold mb-2">
                              {formatCurrency(displayBudget.remainingAmount)}
                            </h3>
                            <p className="text-gray-600 text-lg">Remaining</p>
                          </div>
                        </div>

                        {/* Budget Progress Bar - Single, Intuitive Design */}
                        <div className="mb-8">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-gray-700">Budget Usage</span>
                            <span className="text-sm text-gray-600">
                              {Math.round((displayBudget.totalAmount - displayBudget.remainingAmount) / displayBudget.totalAmount * 100)}% used
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all duration-500 relative"
                              style={{ width: `${Math.min((displayBudget.totalAmount - displayBudget.remainingAmount) / displayBudget.totalAmount * 100, 100)}%` }}
                            >
                              {/* Add a subtle shadow for depth */}
                              <div className="absolute inset-0 bg-black bg-opacity-10 rounded-full"></div>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm text-gray-600 mt-2">
                            <span>Spent: {formatCurrency(displayBudget.totalAmount - displayBudget.remainingAmount)}</span>
                            <span>Available: {formatCurrency(displayBudget.remainingAmount)}</span>
                          </div>
                        </div>

                        {/* Recent Transactions Table */}
                        <div>
                          <h3 style={{ color: 'var(--brand-navy)' }} className="text-2xl font-bold mb-6">
                            Recent transactions
                            {isAdmin && (
                              <span className="text-sm font-normal text-gray-600 ml-2">
                                (All teams)
                              </span>
                            )}
                            {!isAdmin && (
                              <span className="text-sm font-normal text-gray-600 ml-2">
                                ({currentUser?.team?.name})
                              </span>
                            )}
                          </h3>
                          
                          {/* Table Header */}
                          <div className={`grid gap-4 text-sm text-gray-600 border-b border-gray-200 pb-3 mb-4 ${isAdmin ? 'grid-cols-6' : 'grid-cols-5'}`}>
                            <div>Date</div>
                            <div>Member</div>
                            {isAdmin && <div>Team</div>}
                            <div>Amount €↓</div>
                            <div>Description</div>
                            <div>Budget</div>
                          </div>

                          {/* Transaction Rows */}
                          {(() => {
                            const transactions = isAdmin ? 
                              adminTransactionData?.transactions : 
                              transactionData?.transactions;
                            
                            const isLoading = isAdmin ? 
                              adminTransactionsLoading : 
                              transactionsLoading;

                            if (isLoading) {
                              return (
                                <div className="space-y-3">
                                  {[...Array(5)].map((_, i) => (
                                    <div key={i} className={`grid gap-4 py-2 ${isAdmin ? 'grid-cols-6' : 'grid-cols-5'}`}>
                                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                      {isAdmin && <div className="h-4 bg-gray-200 rounded animate-pulse"></div>}
                                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                  ))}
                                </div>
                              );
                            }

                            if (transactions && transactions.length > 0) {
                              return (
                                <div className="space-y-3">
                                  {transactions.slice(0, 10).map((transaction) => (
                                    <div key={transaction.id} className={`grid gap-4 text-sm py-2 ${isAdmin ? 'grid-cols-6' : 'grid-cols-5'}`}>
                                      <div className="text-gray-900">
                                        {formatDate(transaction.createdAt, 'dd MMM yyyy')}
                                      </div>
                                      <div className="text-gray-900">
                                        {transaction.user.name}
                                      </div>
                                      {isAdmin && (
                                        <div className="text-gray-600">
                                          {transaction.user?.team?.name || 'N/A'}
                                        </div>
                                      )}
                                      <div className="font-medium text-gray-900">
                                        {transaction.amount.toString()}
                                      </div>
                                      <div className="text-gray-600 truncate" title={transaction.description}>
                                        {transaction.description}
                                      </div>
                                      <div className="text-gray-600">
                                        {transaction.budget.name}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            } else {
                              return <p className="text-gray-500 text-center py-8">No recent transactions</p>;
                            }
                          })()}
                        </div>
                      </div>
                    ) : null;
                  })()
                ) : (
                  <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <p className="text-gray-500">No active budgets found</p>
                  </div>
                )}
              </div>

              {/* Right Side - Execute Purchase Form (1/3 width) */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-8">
                  <h2 style={{ color: 'var(--brand-navy)' }} className="text-2xl font-bold mb-6">Execute purchase</h2>
                  
                  <TransactionForm
                    isOpen={isTransactionModalOpen}
                    onClose={() => setIsTransactionModalOpen(false)}
                  />
                  
                  <div className="space-y-6">
                    {/* Member Display with Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Member</label>
                      <div className="relative">
                        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 flex items-center justify-between cursor-pointer">
                          <span>{currentUser.name}</span>
                          {isDemoMode && (
                            <svg className="h-4 w-4 text-brand-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </div>
                        {isDemoMode && <UserSelector />}
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount €</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10000"
                        placeholder="80"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent"
                        id="quick-amount"
                      />
                    </div>

                    {/* Purchase Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                      <input
                        type="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent"
                        id="quick-date"
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={() => setIsTransactionModalOpen(true)}
                      disabled={!budgetData?.budgets.some(b => b.is_active)}
                      style={{ 
                        backgroundColor: 'var(--brand-navy)', 
                        color: 'white',
                        border: 'none'
                      }}
                      className="w-full font-semibold py-3 text-lg rounded-md hover:opacity-90 transition-opacity"
                      size="lg"
                    >
                      Submit
                    </Button>
                    
                    {!budgetData?.budgets.some(b => b.is_active) && (
                      <p className="text-sm text-red-600 text-center">
                        No active budgets available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Budget History Section */}
            {isAdmin && (
              <div className="mt-8">
                <BudgetHistory />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to load budget data
            </h3>
            <p className="text-gray-500 mb-4">
              There was an error loading your team&apos;s budget information.
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}
      </main>

      {/* Transaction Modal */}
      <TransactionForm
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
      />
    </div>
  );
}