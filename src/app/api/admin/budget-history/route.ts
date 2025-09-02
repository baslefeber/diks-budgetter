// API route for admin budget history across all teams and budgets
// GET /api/admin/budget-history - Get budget usage history over time

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get all budgets with their teams and calculate usage statistics
    const budgets = await prisma.budget.findMany({
      include: {
        team: true,
        transactions: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: [
        { team: { name: 'asc' } },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await prisma.budget.count();

    // Transform the data to include calculated fields
    const budgetHistory = budgets.map((budget: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const totalSpent = budget.totalAmount.toNumber() - budget.remainingAmount.toNumber();
      const usagePercentage = (totalSpent / budget.totalAmount.toNumber()) * 100;
      const isActive = new Date() >= budget.validFrom && new Date() <= budget.validUntil;
      const daysRemaining = Math.max(0, Math.ceil((budget.validUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

      return {
        id: budget.id,
        name: budget.name,
        team: budget.team,
        totalAmount: budget.totalAmount.toNumber(),
        remainingAmount: budget.remainingAmount.toNumber(),
        spentAmount: totalSpent,
        usagePercentage,
        validFrom: budget.validFrom,
        validUntil: budget.validUntil,
        isActive,
        daysRemaining,
        transactionCount: budget.transactions.length,
        lastTransactionDate: budget.transactions.length > 0 ? budget.transactions[0].createdAt : null,
        createdAt: budget.createdAt,
        updatedAt: budget.updatedAt
      };
    });

    return NextResponse.json({
      budgets: budgetHistory,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching budget history:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch budget history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
