const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function exportData() {
  try {
    console.log('📦 Exporting data from local database...');
    
    // Export all data
    const data = {
      users: await prisma.user.findMany({
        include: {
          loanPlans: true,
          budgetAccounts: true,
          budgetCategories: true,
          transactions: true,
          recurringExpenses: true,
        },
      }),
      loanPlans: await prisma.loanPlan.findMany(),
      budgetAccounts: await prisma.budgetAccount.findMany(),
      budgetCategories: await prisma.budgetCategory.findMany(),
      transactions: await prisma.transaction.findMany(),
      recurringExpenses: await prisma.recurringExpense.findMany(),
    };
    
    const exportPath = path.join(process.cwd(), 'local-db-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(data, null, 2));
    
    console.log(`✅ Data exported to ${exportPath}`);
    console.log(`📊 Exported:`);
    console.log(`   - Users: ${data.users.length}`);
    console.log(`   - Loan Plans: ${data.loanPlans.length}`);
    console.log(`   - Budget Accounts: ${data.budgetAccounts.length}`);
    console.log(`   - Budget Categories: ${data.budgetCategories.length}`);
    console.log(`   - Transactions: ${data.transactions.length}`);
    console.log(`   - Recurring Expenses: ${data.recurringExpenses.length}`);
    
  } catch (error) {
    console.error('❌ Error exporting data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

exportData();


