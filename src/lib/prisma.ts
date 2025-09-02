// Prisma Client instance for DIKS Budget Manager
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper function to get optimal budget for a transaction
// This is where the API receives the request and checks for the optimal budget
export async function getOptimalBudget(teamId: number, amount: number) {
  const budget = await prisma.budget.findFirst({
    where: {
      teamId,
      remainingAmount: {
        gte: amount,
      },
      validFrom: {
        lte: new Date(),
      },
      validUntil: {
        gte: new Date(),
      },
    },
    orderBy: [
      {
        validUntil: 'asc', // Expiring soon first
      },
      {
        remainingAmount: 'asc', // Smaller budgets first
      },
    ],
  })

  return budget
}
