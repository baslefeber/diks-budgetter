// API route for database seeding (admin only)
// POST /api/admin/seed - Initialize database with sample data

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Seeding is not allowed in production' },
        { status: 403 }
      );
    }

    // Create multiple teams as per assessment requirements
    const teams = [
      { name: 'Rubberduck' },
      { name: 'Phoenix' },
      { name: 'Kraken' },
    ];

    const createdTeams = [];
    for (const teamData of teams) {
      const team = await prisma.team.upsert({
        where: { name: teamData.name },
        update: {},
        create: { name: teamData.name }
      });
      createdTeams.push(team);
    }

    // Get the teams for reference
    const rubberduckTeam = createdTeams.find(t => t.name === 'Rubberduck')!;
    const phoenixTeam = createdTeams.find(t => t.name === 'Phoenix')!;
    const krakenTeam = createdTeams.find(t => t.name === 'Kraken')!;

    // Create team members - users can only be in one team
    const users = [
      // Rubberduck team (original assessment requirements)
      { name: 'A. Feather', email: 'a.feather@diks.net', role: 'admin', teamId: rubberduckTeam.id },
      { name: 'B. Quack', email: 'b.quack@diks.net', role: 'member', teamId: rubberduckTeam.id },
      { name: 'C. Mallard', email: 'c.mallard@diks.net', role: 'member', teamId: rubberduckTeam.id },
      { name: 'D. Duckling', email: 'd.duckling@diks.net', role: 'member', teamId: rubberduckTeam.id },
      { name: 'E. Swan', email: 'e.swan@diks.net', role: 'member', teamId: rubberduckTeam.id },
      { name: 'F. Goose', email: 'f.goose@diks.net', role: 'admin', teamId: rubberduckTeam.id },
      
      // Phoenix team
      { name: 'P. Fire', email: 'p.fire@diks.net', role: 'admin', teamId: phoenixTeam.id },
      { name: 'R. Ash', email: 'r.ash@diks.net', role: 'member', teamId: phoenixTeam.id },
      { name: 'S. Ember', email: 's.ember@diks.net', role: 'member', teamId: phoenixTeam.id },
      
      // Kraken team
      { name: 'K. Deep', email: 'k.deep@diks.net', role: 'admin', teamId: krakenTeam.id },
      { name: 'T. Tide', email: 't.tide@diks.net', role: 'member', teamId: krakenTeam.id },
      { name: 'W. Wave', email: 'w.wave@diks.net', role: 'member', teamId: krakenTeam.id },
    ];

    for (const userData of users) {
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: userData
      });
    }

    // Create budgets for each team
    const budgetTemplates = [
      // Rubberduck team budgets (from assessment requirements)
      {
        teamId: rubberduckTeam.id,
        name: 'Annual 2025',
        totalAmount: 200.00,
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-12-31')
      },
      {
        teamId: rubberduckTeam.id,
        name: 'Summer 2025',
        totalAmount: 100.00,
        validFrom: new Date('2025-06-01'),
        validUntil: new Date('2025-08-31')
      },
      {
        teamId: rubberduckTeam.id,
        name: 'Hardware & Software Budget 2025',
        totalAmount: 3000.00,
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-06-30')
      },
      {
        teamId: rubberduckTeam.id,
        name: 'Team Training Budget Q1 2025',
        totalAmount: 1200.00,
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-03-31')
      },
      
      // Phoenix team budgets
      {
        teamId: phoenixTeam.id,
        name: 'Annual Budget 2025',
        totalAmount: 8000.00,
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-12-31')
      },
      {
        teamId: phoenixTeam.id,
        name: 'Innovation Budget 2025',
        totalAmount: 4500.00,
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-12-31')
      },
      
      // Kraken team budgets
      {
        teamId: krakenTeam.id,
        name: 'Annual Budget 2025',
        totalAmount: 6500.00,
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-12-31')
      },
      {
        teamId: krakenTeam.id,
        name: 'Research & Development 2025',
        totalAmount: 3200.00,
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-09-30')
      }
    ];

    for (const budgetData of budgetTemplates) {
      await prisma.budget.upsert({
        where: { 
          teamId_name: {
            teamId: budgetData.teamId,
            name: budgetData.name
          }
        },
        update: {},
        create: {
          teamId: budgetData.teamId,
          name: budgetData.name,
          totalAmount: budgetData.totalAmount,
          remainingAmount: budgetData.totalAmount,
          validFrom: budgetData.validFrom,
          validUntil: budgetData.validUntil
        }
      });
    }

    // Create some sample transactions across all teams
    const sampleTransactions = [
      // Rubberduck team transactions (matching assessment requirements)
      {
        teamName: 'Rubberduck',
        budgetName: 'Annual 2025',
        amount: 71.00,
        description: 'Team lunch for project milestone',
        userEmail: 'a.feather@diks.net'
      },
      {
        teamName: 'Rubberduck',
        budgetName: 'Summer 2025',
        amount: 71.00,
        description: 'Conference registration fees',
        userEmail: 'b.quack@diks.net'
      },
      {
        teamName: 'Rubberduck',
        budgetName: 'Annual 2025',
        amount: 38.00,
        description: 'Office supplies for Q1',
        userEmail: 'a.feather@diks.net'
      },
      {
        teamName: 'Rubberduck',
        budgetName: 'Hardware & Software Budget 2025',
        amount: 299.99,
        description: 'JetBrains IntelliJ IDEA license renewal',
        userEmail: 'a.feather@diks.net'
      },
      {
        teamName: 'Rubberduck',
        budgetName: 'Hardware & Software Budget 2025',
        amount: 159.99,
        description: 'External monitor stand for workstation',
        userEmail: 'd.duckling@diks.net'
      },
      {
        teamName: 'Rubberduck',
        budgetName: 'Team Training Budget Q1 2025',
        amount: 299.00,
        description: 'React Advanced Patterns online course',
        userEmail: 'c.mallard@diks.net'
      },
      {
        teamName: 'Rubberduck',
        budgetName: 'Annual 2025',
        amount: 89.90,
        description: 'Team coffee subscription',
        userEmail: 'b.quack@diks.net'
      },
      
      // Phoenix team transactions
      {
        teamName: 'Phoenix',
        budgetName: 'Annual Budget 2025',
        amount: 750.00,
        description: 'AWS cloud infrastructure monthly bill',
        userEmail: 'p.fire@diks.net'
      },
      {
        teamName: 'Phoenix',
        budgetName: 'Innovation Budget 2025',
        amount: 1250.00,
        description: 'Machine learning model training credits',
        userEmail: 'r.ash@diks.net'
      },
      {
        teamName: 'Phoenix',
        budgetName: 'Annual Budget 2025',
        amount: 320.00,
        description: 'Team building event',
        userEmail: 's.ember@diks.net'
      },
      
      // Kraken team transactions
      {
        teamName: 'Kraken',
        budgetName: 'Annual Budget 2025',
        amount: 890.00,
        description: 'Database hosting and maintenance',
        userEmail: 'k.deep@diks.net'
      },
      {
        teamName: 'Kraken',
        budgetName: 'Research & Development 2025',
        amount: 450.00,
        description: 'Research paper access and publications',
        userEmail: 't.tide@diks.net'
      },
      {
        teamName: 'Kraken',
        budgetName: 'Annual Budget 2025',
        amount: 125.00,
        description: 'Software license renewals',
        userEmail: 'w.wave@diks.net'
      }
    ];

    // Get all created users and budgets for transactions
    const allCreatedUsers = await prisma.user.findMany({
      include: { team: true }
    });
    const allCreatedBudgets = await prisma.budget.findMany({
      include: { team: true }
    });

    for (const txData of sampleTransactions) {
      const user = allCreatedUsers.find(u => u.email === txData.userEmail);
      const budget = allCreatedBudgets.find(b => 
        b.name === txData.budgetName && b.team.name === txData.teamName
      );
      
      if (user && budget && budget.remainingAmount.toNumber() >= txData.amount) {
        // Create transaction
        await prisma.transaction.create({
          data: {
            budgetId: budget.id,
            userId: user.id,
            amount: txData.amount,
            description: txData.description
          }
        });

        // Update budget remaining amount
        await prisma.budget.update({
          where: { id: budget.id },
          data: {
            remainingAmount: {
              decrement: txData.amount
            }
          }
        });
      }
    }
    
    return NextResponse.json(
      { message: 'Database seeded successfully with comprehensive test data' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
