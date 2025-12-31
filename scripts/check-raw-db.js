const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function checkRawDatabase() {
  try {
    console.log('🔍 Raw Database Query Results\n');
    
    // Check with raw SQL to see all users in the database
    const rawUsers = await prisma.$queryRaw`SELECT email FROM users ORDER BY email`;
    console.log(`📋 Raw SQL - All users (${rawUsers.length}):`);
    rawUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email}`);
    });
    
    // Check specifically for the budget email
    const budgetUser = await prisma.$queryRaw`SELECT * FROM users WHERE email = ${'cankilic.mail+budget@gmail.com'}`;
    console.log(`\n🔍 Search for 'cankilic.mail+budget@gmail.com':`);
    if (budgetUser.length > 0) {
      console.log(`⚠️  FOUND in database!`);
      budgetUser.forEach(user => {
        console.log(`   ID: ${user.id}, Name: ${user.name}, Email: ${user.email}`);
      });
    } else {
      console.log(`✅ NOT found in database`);
    }
    
    // Check for similar emails
    const similarUsers = await prisma.$queryRaw`SELECT email FROM users WHERE email LIKE '%budget%' OR email LIKE '%+%@gmail.com' ORDER BY email`;
    console.log(`\n🔍 Emails with '+' or 'budget':`);
    if (similarUsers.length > 0) {
      similarUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email}`);
      });
    } else {
      console.log(`   None found`);
    }
    
    // Check auth system (if different)
    try {
      const authUsers = await prisma.$queryRaw`SELECT email FROM auth.users WHERE email = ${'cankilic.mail+budget@gmail.com'}`;
      console.log(`\n🔍 Search in auth.users table:`);
      if (authUsers.length > 0) {
        console.log(`⚠️  FOUND in auth.users!`);
        authUsers.forEach(user => {
          console.log(`   Email: ${user.email}`);
        });
      } else {
        console.log(`✅ NOT found in auth.users`);
      }
    } catch (error) {
      console.log(`ℹ️  auth.users table not accessible or doesn't exist`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkRawDatabase();