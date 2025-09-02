# DIKS Budget Manager - Assignment Documentation

## What I Built

I created a team budget management tool for DIKS that lets teams track and spend their allocated budgets. Think of it like a shared company credit card system, but with better controls and visibility.

## How It Works

### The Basic Idea
Each team gets budgets for different time periods (like "Annual 2025" or "Summer Conference Budget"). Team members can submit expenses, and the system automatically picks the best budget to charge it to. Admins get a bird's eye view of everything happening across all teams.

### Key Features

**Budget Management**
- Teams can have multiple budgets with different validity periods
- The system shows you exactly how much is left and what's been spent
- Easy budget switching if your team has multiple pots of money

**Smart Transaction Processing**
- When you submit an expense, the system automatically finds the best budget to use
- It prioritizes budgets that are expiring soon to avoid waste
- Won't let you spend money that isn't there

**Role-Based Access**
- Regular team members see their team's budgets and transactions
- Admins see everything across all teams plus detailed analytics
- Clean, focused interface that shows you what you need to see

**Real-Time Updates**
- Budget balances update immediately when transactions are made
- Transaction history shows up right away
- No need to refresh or wait for batch processing

### The Tech Stack

I went with Next.js because it handles both frontend and backend in one codebase, which makes deployment simple. Used PostgreSQL with Prisma for the database because budget data needs to be reliable. Added proper TypeScript throughout for fewer bugs.

The UI uses Tailwind CSS with custom DIKS branding - kept it professional but approachable.

## Why These Choices?

**Single Codebase**: Everything in one place makes it easier to maintain and deploy
**Type Safety**: TypeScript catches errors before they become problems
**Production Ready**: All the technologies are battle-tested and scale well
**Performance**: Built-in optimizations and caching mean the app stays fast

## Demo Data

The app comes with sample data for the Rubberduck team:
- A. Feather (admin) and B. Quack (team member)
- Multiple budgets including the €200 annual and €100 summer budgets from the assignment
- Some sample transactions to show how everything works

## What's Next?

The core functionality is solid, but there's room to grow:
- Export features for accounting
- Approval workflows for larger purchases
- Mobile app for expense submission on the go
- Integration with receipt scanning

The architecture is designed to handle these additions without major rewrites.

---

*Built for the DIKS full-stack developer role assessment*
