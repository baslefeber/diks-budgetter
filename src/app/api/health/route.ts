// Health check endpoint
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Quick database connection test
    await prisma.$queryRaw`SELECT 1`;
    
    // Check if seeded
    const teamCount = await prisma.team.count();
    const userCount = await prisma.user.count();
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      seeded: teamCount > 0,
      data: {
        teams: teamCount,
        users: userCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
