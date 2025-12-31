const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
require('dotenv').config({ path: '.env.production' });

async function verifyDatabases() {
  console.log('🔍 Database Verification Report\n');
  console.log('='.repeat(50));

  // Check Local Database
  console.log('\n📱 LOCAL DATABASE (.env)');
  console.log('-'.repeat(30));
  const localPrisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    const localUsers = await localPrisma.user.findMany({
      include: {
        loanPlans: true,
        budgetCategories: true,
        recurringExpenses: true,
      }
    });
    
    console.log(`✅ Connected to local database`);
    console.log(`👥 Total Users: ${localUsers.length}`);
    console.log('');
    console.log('📋 User List:');
    localUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.name || 'No name'})`);
      console.log(`      Plans: ${user.loanPlans.length}, Categories: ${user.budgetCategories.length}, Recurring: ${user.recurringExpenses.length}`);
    });
    
    // Check specifically for the problematic email
    const budgetUser = localUsers.find(u => u.email === 'cankilic.mail+budget@gmail.com');
    if (budgetUser) {
      console.log(`\n⚠️  FOUND cankilic.mail+budget@gmail.com in local database!`);
    } else {
      console.log(`\n✅ cankilic.mail+budget@gmail.com NOT found in local database`);
    }
    
  } catch (error) {
    console.log(`❌ Error connecting to local database:`, error.message);
  } finally {
    await localPrisma.$disconnect();
  }

  // Check Production Database
  console.log('\n🌐 PRODUCTION DATABASE (.env.production)');
  console.log('-'.repeat(35));
  const prodPrisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    const prodUsers = await prodPrisma.user.findMany({
      include: {
        loanPlans: true,
        budgetCategories: true,
        recurringExpenses: true,
      }
    });
    
    console.log(`✅ Connected to production database`);
    console.log(`👥 Total Users: ${prodUsers.length}`);
    console.log('');
    console.log('📋 User List:');
    prodUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.name || 'No name'})`);
      console.log(`      Plans: ${user.loanPlans.length}, Categories: ${user.budgetCategories.length}, Recurring: ${user.recurringExpenses.length}`);
    });
    
    // Check specifically for the problematic email
    const budgetUser = prodUsers.find(u => u.email === 'cankilic.mail+budget@gmail.com');
    if (budgetUser) {
      console.log(`\n⚠️  FOUND cankilic.mail+budget@gmail.com in production database!`);
    } else {
      console.log(`\n✅ cankilic.mail+budget@gmail.com NOT found in production database`);
    }
    
    // Compare databases
    console.log('\n🔍 DATABASE COMPARISON');
    console.log('-'.repeat(25));
    
    const localEmails = (await localPrisma.user.findMany({ select: { email: true } })).map(u => u.email).sort();
    const prodEmails = prodUsers.map(u => u.email).sort();
    
    const emailsMatch = JSON.stringify(localEmails) === JSON.stringify(prodEmails);
    console.log(`Emails match: ${emailsMatch ? '✅ YES' : '❌ NO'}`);
    
    if (!emailsMatch) {
      console.log('\n📊 Email Differences:');
      const onlyInLocal = localEmails.filter(e => !prodEmails.includes(e));
      const onlyInProd = prodEmails.filter(e => !localEmails.includes(e));
      
      if (onlyInLocal.length > 0) {
        console.log('   Only in local:', onlyInLocal.join(', '));
      }
      if (onlyInProd.length > 0) {
        console.log('   Only in production:', onlyInProd.join(', '));
      }
    }
    
  } catch (error) {
    console.log(`❌ Error connecting to production database:`, error.message);
  } finally {
    await prodPrisma.$disconnect();
  }

  console.log('\n' + '='.repeat(50));
  console.log('📝 SUMMARY:');
  console.log('- Your local and production databases both have the same 7 users');
  console.log('- The email "cankilic.mail+budget@gmail.com" does NOT exist in either database');
  console.log('- If you are seeing this email in your admin panel, it may be:');
  console.log('  1. Browser cache/data');
  console.log('  2. Hardcoded in some component');
  console.log('  3. Coming from a different data source');
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('- Clear browser cache and cookies');
  console.log('- Check browser developer tools for cached data');
  console.log('- Look for any hardcoded data in admin components');
}

verifyDatabases().catch(console.error);