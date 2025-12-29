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

async function createJohnUser() {
  try {
    console.log('👤 Creating/updating john@example.com user...\n');
    
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: 'john@example.com' },
    });
    
    if (!user) {
      // Create user
      user = await prisma.user.create({
        data: {
          email: 'john@example.com',
          name: 'John Doe',
          password: '22222222', // Same password as other users
        },
      });
      console.log('✅ Created new user: john@example.com');
    } else {
      console.log('✅ User already exists: john@example.com');
    }
    
    // Copy data from cankilic.mail@gmail.com
    const sourceUser = await prisma.user.findUnique({
      where: { email: 'cankilic.mail@gmail.com' },
      include: {
        loanPlans: true,
        budgetCategories: true,
        recurringExpenses: true,
      },
    });
    
    if (sourceUser) {
      console.log('\n📋 Copying data from cankilic.mail@gmail.com...');
      
      // Copy loan plans
      for (const plan of sourceUser.loanPlans) {
        const { id, userId, createdAt, updatedAt, ...planData } = plan;
        await prisma.loanPlan.create({
          data: {
            ...planData,
            userId: user.id,
          },
        });
      }
      console.log(`   ✅ Copied ${sourceUser.loanPlans.length} loan plans`);
      
      // Copy budget categories
      for (const category of sourceUser.budgetCategories) {
        const { id, userId, createdAt, ...categoryData } = category;
        await prisma.budgetCategory.create({
          data: {
            ...categoryData,
            userId: user.id,
          },
        });
      }
      console.log(`   ✅ Copied ${sourceUser.budgetCategories.length} budget categories`);
      
      // Copy recurring expenses
      for (const recurring of sourceUser.recurringExpenses) {
        const { id, userId, createdAt, ...recurringData } = recurring;
        await prisma.recurringExpense.create({
          data: {
            ...recurringData,
            userId: user.id,
          },
        });
      }
      console.log(`   ✅ Copied ${sourceUser.recurringExpenses.length} recurring expenses`);
      
      console.log('\n✅ Data copied successfully!');
    } else {
      console.log('⚠️  Source user not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createJohnUser();

