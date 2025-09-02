// API route for budget operations
// GET /api/budgets - Get all budgets for a team with current status

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BudgetWithStatus, BudgetSummary } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    // Get all budgets for the team
    const budgetsData = await prisma.budget.findMany({
      where: { teamId: parseInt(teamId) },
      orderBy: [
        { validUntil: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // Add computed fields
    const budgets: BudgetWithStatus[] = budgetsData.map((budget): BudgetWithStatus => {
      const now = new Date();
      const isActive = now >= budget.validFrom && now <= budget.validUntil;
      const totalAmount = budget.totalAmount.toNumber();
      const remainingAmount = budget.remainingAmount.toNumber();
      const usagePercentage = totalAmount > 0 
        ? Math.round(((totalAmount - remainingAmount) / totalAmount) * 100)
        : 0;

      return {
        ...budget,
        totalAmount: totalAmount,
        remainingAmount: remainingAmount,
        is_active: isActive,
        usage_percentage: usagePercentage
      };
    });

    // Calculate summary statistics
    const totalBudgets = budgets.length;
    const totalAmount = budgets.reduce((sum, budget) => sum + budget.totalAmount, 0);
    const totalRemaining = budgets.reduce((sum, budget) => sum + budget.remainingAmount, 0);
    const activeBudgets = budgets.filter(budget => budget.is_active);

    const summary: BudgetSummary = {
      total_budgets: totalBudgets,
      total_amount: totalAmount,
      total_remaining: totalRemaining,
      active_budgets: activeBudgets
    };

    return NextResponse.json({
      budgets,
      summary
    });

  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch budgets', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
