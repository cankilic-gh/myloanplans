const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function syncAuthUsersToApp() {
  try {
    console.log('🔄 Syncing Auth Users to Application Database\n');
    
    // Get all users from auth.users that are not in public.users
    const authUsersNotInApp = await prisma.$queryRaw`
      SELECT a.id, a.email, a.raw_user_meta_data as metadata
      FROM auth.users a
      LEFT JOIN public.users p ON a.email = p.email
      WHERE a.email IS NOT NULL 
      AND p.email IS NULL
      ORDER BY a.email
    `;
    
    console.log(`📋 Auth users not in app (${authUsersNotInApp.length}):`);
    authUsersNotInApp.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (ID: ${user.id})`);
    });
    
    if (authUsersNotInApp.length > 0) {
      console.log(`\n🔧 Creating missing user records...`);
      
      for (const authUser of authUsersNotInApp) {
        try {
          // Extract name from metadata if available
          let name = null;
          if (authUser.metadata) {
            const metadata = typeof authUser.metadata === 'string' 
              ? JSON.parse(authUser.metadata) 
              : authUser.metadata;
            name = metadata.name || metadata.full_name || null;
          }
          
          // Create user record
          await prisma.user.create({
            data: {
              email: authUser.email,
              name: name || authUser.email.split('@')[0], // Use email prefix as fallback
              emailVerified: new Date(), // Assume verified if in auth
            },
          });
          
          console.log(`✅ Created user: ${authUser.email} (${name || 'No name'})`);
        } catch (error) {
          console.log(`❌ Failed to create user ${authUser.email}: ${error.message}`);
        }
      }
    }
    
    // Verify the fix
    console.log(`\n🔍 Checking for cankilic.mail+budget@gmail.com after sync...`);
    const budgetUser = await prisma.user.findUnique({
      where: { email: 'cankilic.mail+budget@gmail.com' }
    });
    
    if (budgetUser) {
      console.log(`✅ SUCCESS: User now exists in app database!`);
      console.log(`   ID: ${budgetUser.id}`);
      console.log(`   Name: ${budgetUser.name || 'Not set'}`);
      console.log(`   Email: ${budgetUser.email}`);
    } else {
      console.log(`❌ Still not found - manual investigation needed`);
    }
    
    // Show final count
    const totalUsers = await prisma.user.count();
    console.log(`\n📊 Total users in app database: ${totalUsers}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncAuthUsersToApp();