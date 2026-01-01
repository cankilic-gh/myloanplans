const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
require('dotenv').config({ path: '.env.production' });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function checkData() {
  try {
    console.log('🔍 Checking production database...\n');
    
    const users = await prisma.user.findMany({
      include: {
        loanPlans: true,
        budgetAccounts: true,
        budgetCategories: true,
        transactions: true,
        recurringExpenses: true,
      },
    });
    
    console.log(`📊 Users: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Loan Plans: ${user.loanPlans.length}`);
      console.log(`   Budget Accounts: ${user.budgetAccounts.length}`);
      console.log(`   Budget Categories: ${user.budgetCategories.length}`);
      console.log(`   Transactions: ${user.transactions.length}`);
      console.log(`   Recurring Expenses: ${user.recurringExpenses.length}`);
      
      if (user.loanPlans.length > 0) {
        console.log(`   Loan Plan Names: ${user.loanPlans.map(p => p.name).join(', ')}`);
      }
      if (user.budgetCategories.length > 0) {
        console.log(`   Categories: ${user.budgetCategories.map(c => c.name).join(', ')}`);
      }
      if (user.recurringExpenses.length > 0) {
        console.log(`   Recurring: ${user.recurringExpenses.map(r => r.name).join(', ')}`);
      }
    });
    
    console.log('\n✅ Database check complete!');
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkData();



