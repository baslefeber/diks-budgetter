// API route for user operations
// GET /api/users - Get user information and team details

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { User } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    if (!userId && !email) {
      return NextResponse.json(
        { error: 'User ID or email is required' },
        { status: 400 }
      );
    }

    let user: User | null = null;

    if (userId) {
      // Get user by ID with team information
      user = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        include: { team: true }
      });
    } else if (email) {
      // Get user by email with team information
      user = await prisma.user.findUnique({
        where: { email },
        include: { team: true }
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Get all users in a team
export async function POST(request: NextRequest) {
  try {
    const { teamId } = await request.json();

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    const users = await prisma.user.findMany({
      where: { teamId },
      include: { team: true },
      orderBy: [
        { role: 'desc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({ users });

  } catch (error) {
    console.error('Error fetching team users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
