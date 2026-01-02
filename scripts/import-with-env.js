const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.production' });

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function importData() {
  try {
    const exportPath = path.join(process.cwd(), 'local-db-export.json');
    
    if (!fs.existsSync(exportPath)) {
      throw new Error(`Export file not found: ${exportPath}. Please run export-local-db.js first.`);
    }
    
    console.log('📥 Importing data to production database...');
    console.log('⚠️  WARNING: This will DELETE all existing data in production!');
    
    const data = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.transaction.deleteMany();
    await prisma.recurringExpense.deleteMany();
    await prisma.budgetCategory.deleteMany();
    await prisma.budgetAccount.deleteMany();
    await prisma.loanPlan.deleteMany();
    await prisma.user.deleteMany();
    
    // Import users first (they are referenced by other tables)
    console.log('👤 Importing users...');
    for (const user of data.users) {
      const { loanPlans, budgetAccounts, budgetCategories, transactions, recurringExpenses, ...userData } = user;
      await prisma.user.create({
        data: userData,
      });
    }
    
    // Import loan plans
    console.log('💰 Importing loan plans...');
    for (const plan of data.loanPlans) {
      await prisma.loanPlan.create({
        data: plan,
      });
    }
    
    // Import budget accounts
    console.log('🏦 Importing budget accounts...');
    for (const account of data.budgetAccounts) {
      await prisma.budgetAccount.create({
        data: account,
      });
    }
    
    // Import budget categories
    console.log('📁 Importing budget categories...');
    for (const category of data.budgetCategories) {
      await prisma.budgetCategory.create({
        data: category,
      });
    }
    
    // Import transactions
    console.log('💳 Importing transactions...');
    for (const transaction of data.transactions) {
      await prisma.transaction.create({
        data: transaction,
      });
    }
    
    // Import recurring expenses
    console.log('🔄 Importing recurring expenses...');
    for (const recurring of data.recurringExpenses) {
      await prisma.recurringExpense.create({
        data: recurring,
      });
    }
    
    console.log('✅ Data imported successfully!');
    console.log(`📊 Imported:`);
    console.log(`   - Users: ${data.users.length}`);
    console.log(`   - Loan Plans: ${data.loanPlans.length}`);
    console.log(`   - Budget Accounts: ${data.budgetAccounts.length}`);
    console.log(`   - Budget Categories: ${data.budgetCategories.length}`);
    console.log(`   - Transactions: ${data.transactions.length}`);
    console.log(`   - Recurring Expenses: ${data.recurringExpenses.length}`);
    
  } catch (error) {
    console.error('❌ Error importing data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

importData();




