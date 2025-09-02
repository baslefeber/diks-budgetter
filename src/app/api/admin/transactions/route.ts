// API route for admin transaction history across all teams
// GET /api/admin/transactions - Get all transactions for admin users

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get all transactions across all teams with user, budget, and team info
    const transactions = await prisma.transaction.findMany({
      include: {
        user: {
          include: {
            team: true
          }
        },
        budget: {
          include: {
            team: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await prisma.transaction.count();

    // Transform the data for the response
    const transformedTransactions = transactions.map(transaction => ({
      id: transaction.id,
      amount: transaction.amount,
      description: transaction.description,
      createdAt: transaction.createdAt,
      user: {
        id: transaction.user.id,
        name: transaction.user.name,
        email: transaction.user.email,
        role: transaction.user.role,
        team: transaction.user.team
      },
      budget: {
        id: transaction.budget.id,
        name: transaction.budget.name,
        team: transaction.budget.team
      }
    }));

    return NextResponse.json({
      transactions: transformedTransactions,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching admin transactions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch transactions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
