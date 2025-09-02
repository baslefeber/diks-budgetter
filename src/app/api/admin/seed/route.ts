// API route for database seeding - Optimized for Vercel
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Check if already seeded
    const existingTeams = await prisma.team.count();
    if (existingTeams > 0) {
      console.log('Database already seeded');
      return NextResponse.json(
        { message: 'Database already contains data. Seeding skipped.' },
        { status: 200 }
      );
    }

    // Create teams in a single transaction for speed
    const teams = await prisma.$transaction(async (tx) => {
      const rubberduck = await tx.team.create({
        data: { name: 'Rubberduck' }
      });
      const phoenix = await tx.team.create({
        data: { name: 'Phoenix' }
      });
      const kraken = await tx.team.create({
        data: { name: 'Kraken' }
      });
      return { rubberduck, phoenix, kraken };
    });

    console.log('Teams created');

    // Create users in bulk
    await prisma.user.createMany({
      data: [
        // Rubberduck team (main demo team)
        { name: 'A. Feather', email: 'a.feather@diks.net', role: 'admin', teamId: teams.rubberduck.id },
        { name: 'B. Quack', email: 'b.quack@diks.net', role: 'member', teamId: teams.rubberduck.id },
        { name: 'C. Mallard', email: 'c.mallard@diks.net', role: 'member', teamId: teams.rubberduck.id },
        { name: 'D. Duckling', email: 'd.duckling@diks.net', role: 'member', teamId: teams.rubberduck.id },
        
        // Phoenix team
        { name: 'P. Fire', email: 'p.fire@diks.net', role: 'admin', teamId: teams.phoenix.id },
        { name: 'R. Ash', email: 'r.ash@diks.net', role: 'member', teamId: teams.phoenix.id },
        
        // Kraken team
        { name: 'K. Deep', email: 'k.deep@diks.net', role: 'admin', teamId: teams.kraken.id },
        { name: 'T. Tide', email: 't.tide@diks.net', role: 'member', teamId: teams.kraken.id },
      ]
    });

    console.log('Users created');

    // Create budgets in bulk
    await prisma.budget.createMany({
      data: [
        // Rubberduck budgets (from assignment requirements)
        {
          teamId: teams.rubberduck.id,
          name: 'Annual 2025',
          totalAmount: 200.00,
          remainingAmount: 1.10, // Almost used up to show realistic usage
          validFrom: new Date('2025-01-01'),
          validUntil: new Date('2025-12-31')
        },
        {
          teamId: teams.rubberduck.id,
          name: 'Summer 2025',
          totalAmount: 100.00,
          remainingAmount: 100.00,
          validFrom: new Date('2025-06-01'),
          validUntil: new Date('2025-08-31')
        },
        {
          teamId: teams.rubberduck.id,
          name: 'Hardware & Software Budget 2025',
          totalAmount: 3000.00,
          remainingAmount: 2500.00,
          validFrom: new Date('2025-01-01'),
          validUntil: new Date('2025-06-30')
        },
        {
          teamId: teams.rubberduck.id,
          name: 'Team Training Budget Q1 2025',
          totalAmount: 1200.00,
          remainingAmount: 800.00,
          validFrom: new Date('2025-01-01'),
          validUntil: new Date('2025-03-31')
        },
        
        // Phoenix budgets
        {
          teamId: teams.phoenix.id,
          name: 'Annual Budget 2025',
          totalAmount: 5000.00,
          remainingAmount: 3750.00,
          validFrom: new Date('2025-01-01'),
          validUntil: new Date('2025-12-31')
        },
        {
          teamId: teams.phoenix.id,
          name: 'Innovation Budget 2025',
          totalAmount: 2000.00,
          remainingAmount: 750.00,
          validFrom: new Date('2025-01-01'),
          validUntil: new Date('2025-06-30')
        },
        
        // Kraken budgets
        {
          teamId: teams.kraken.id,
          name: 'Annual Budget 2025',
          totalAmount: 8000.00,
          remainingAmount: 7110.00,
          validFrom: new Date('2025-01-01'),
          validUntil: new Date('2025-12-31')
        },
        {
          teamId: teams.kraken.id,
          name: 'Research & Development 2025',
          totalAmount: 4000.00,
          remainingAmount: 3550.00,
          validFrom: new Date('2025-01-01'),
          validUntil: new Date('2025-08-31')
        }
      ]
    });

    console.log('Budgets created');

    // Get user and budget IDs for transactions
    const users = await prisma.user.findMany();
    const budgets = await prisma.budget.findMany();
    
    const aFeather = users.find(u => u.email === 'a.feather@diks.net')!;
    const bQuack = users.find(u => u.email === 'b.quack@diks.net')!;
    const cMallard = users.find(u => u.email === 'c.mallard@diks.net')!;
    const pFire = users.find(u => u.email === 'p.fire@diks.net')!;
    const kDeep = users.find(u => u.email === 'k.deep@diks.net')!;
    
    const annualBudget = budgets.find(b => b.name === 'Annual 2025' && b.teamId === teams.rubberduck.id)!;
    const hardwareBudget = budgets.find(b => b.name === 'Hardware & Software Budget 2025')!;
    const phoenixAnnual = budgets.find(b => b.name === 'Annual Budget 2025' && b.teamId === teams.phoenix.id)!;
    const krakenAnnual = budgets.find(b => b.name === 'Annual Budget 2025' && b.teamId === teams.kraken.id)!;

    // Create sample transactions to show the system in action
    await prisma.transaction.createMany({
      data: [
        {
          budgetId: annualBudget.id,
          userId: aFeather.id,
          amount: 500,
          description: 'Yearly subscription renewal',
        },
        {
          budgetId: hardwareBudget.id,
          userId: bQuack.id,
          amount: 159.99,
          description: 'External monitor',
        },
        {
          budgetId: hardwareBudget.id,
          userId: cMallard.id,
          amount: 299.99,
          description: 'Software license',
        },
        {
          budgetId: phoenixAnnual.id,
          userId: pFire.id,
          amount: 750,
          description: 'AWS cloud infrastructure',
        },
        {
          budgetId: krakenAnnual.id,
          userId: kDeep.id,
          amount: 890,
          description: 'Database hosting',
        },
        {
          budgetId: annualBudget.id,
          userId: aFeather.id,
          amount: 89.9,
          description: 'Team lunch',
        }
      ]
    });

    console.log('Sample transactions created');

    return NextResponse.json(
      { 
        message: 'Database seeded successfully!',
        summary: {
          teams: 3,
          users: 8,
          budgets: 8,
          transactions: 6
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { 
        error: 'Failed to seed database', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// Support both GET and POST for demo purposes
export async function GET() {
  return seedDatabase();
}

export async function POST() {
  return seedDatabase();
}