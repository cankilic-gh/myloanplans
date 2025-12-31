const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkLocalDB() {
  try {
    console.log('🔍 Checking local database...\n');
    
    const users = await prisma.user.findMany({
      include: {
        loanPlans: true,
        budgetAccounts: true,
        budgetCategories: true,
        transactions: true,
        recurringExpenses: true,
      }
    });
    
    console.log(`📊 Local Users: ${users.length}`);
    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Loan Plans: ${user.loanPlans.length}`);
      console.log(`   Budget Categories: ${user.budgetCategories.length}`);
    });
    
    console.log('\n✅ Local database check complete!');
    
  } catch (error) {
    console.error('❌ Error checking local database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLocalDB();