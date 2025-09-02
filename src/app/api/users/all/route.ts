// API route to get all users for demo mode
// GET /api/users/all - Get all users across all teams

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Allow in production for demo purposes - this is a demo application
    // In a real application, you would want proper authentication and authorization
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
