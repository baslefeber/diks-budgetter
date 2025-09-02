// API route for transaction operations
// GET /api/transactions - Get transaction history
// POST /api/transactions - Create new transaction with optimal budget selection

import { NextRequest, NextResponse } from 'next/server';
import { prisma, getOptimalBudget } from '@/lib/prisma';
import { TransactionRequest, TransactionResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const limit = searchParams.get('limit') || '50';

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    // Get transaction history with joined data
    const transactions = await prisma.transaction.findMany({
      where: {
        budget: {
          teamId: parseInt(teamId)
        }
      },
      include: {
        budget: true,
        user: {
          include: {
            team: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: parseInt(limit)
    });

    return NextResponse.json({ transactions });

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TransactionRequest & { userId: number; teamId: number } = await request.json();
    
    const { amount, description, userId, teamId } = body;

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    if (!userId || !teamId) {
      return NextResponse.json(
        { error: 'User ID and Team ID are required' },
        { status: 400 }
      );
    }

    // Use Prisma transaction to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      // Find optimal budget
      const optimalBudget = await getOptimalBudget(teamId, amount);

      if (!optimalBudget) {
        throw new Error('No suitable budget found with sufficient funds');
      }

      // Create the transaction
      const transaction = await tx.transaction.create({
        data: {
          budgetId: optimalBudget.id,
          userId,
          amount,
          description,
        },
        include: {
          budget: true,
          user: {
            include: {
              team: true
            }
          }
        }
      });

      // Update budget remaining amount
      const updatedBudget = await tx.budget.update({
        where: { id: optimalBudget.id },
        data: {
          remainingAmount: {
            decrement: amount
          }
        }
      });

      // Check if budget has sufficient funds after update
      if (updatedBudget.remainingAmount.toNumber() < 0) {
        throw new Error('Insufficient funds in budget');
      }

      return {
        transaction,
        selected_budget: {
          ...updatedBudget,
          totalAmount: updatedBudget.totalAmount.toNumber(),
          remainingAmount: updatedBudget.remainingAmount.toNumber()
        },
        remaining_budget_amount: updatedBudget.remainingAmount.toNumber()
      };
    });

    const response: TransactionResponse = {
      transaction: result.transaction,
      selected_budget: result.selected_budget,
      remaining_budget_amount: result.remaining_budget_amount
    };

    return NextResponse.json(response, { status: 201 });

  } catch (error) {
    console.error('Error creating transaction:', error);
    
    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('Insufficient funds')) {
        return NextResponse.json(
          { error: 'Insufficient funds in available budgets' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('No suitable budget')) {
        return NextResponse.json(
          { error: 'No active budget with sufficient funds found' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create transaction', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
