// API route to get all users for demo mode
// GET /api/users/all - Get all users across all teams

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Only allow in development for demo purposes
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      include: { team: true },
      orderBy: [
        { teamId: 'asc' },
        { role: 'desc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({ users });

  } catch (error) {
    console.error('Error fetching all users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
