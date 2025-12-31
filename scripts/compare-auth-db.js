const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.production' });

const prisma = new PrismaClient();

// Connect to Supabase for auth.users
const supabaseUrl = 'https://yixsbgjzwmzycrroplyp.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpeHNiZ2p6d216eWNycm9wbHlwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTkyODU4OCwiZXhwIjoyMDgxNTA0NTg4fQ.Kv4ZtZ4MRMMP9MAR4UNe4xxRC90PjaVylp4GdJLZm_w';
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function compareAuthVsDatabase() {
  try {
    console.log('🔍 Comparing Supabase Auth vs Database Users\n');

    // Get users from database (public.users)
    const dbUsers = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    });
    
    // Get users from Supabase Auth (auth.users)
    const { data: authUsers, error } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    
    if (error) {
      console.error('❌ Error fetching auth users:', error);
      return;
    }

    console.log(`📊 Database Users (public.users): ${dbUsers.length}`);
    console.log(`📊 Auth Users (auth.users): ${authUsers.users.length}`);
    
    const dbEmails = dbUsers.map(u => u.email).sort();
    const authEmails = authUsers.users.map(u => u.email).filter(Boolean).sort();
    
    console.log('\n📋 Database Users:');
    dbEmails.forEach((email, index) => {
      const inAuth = authEmails.includes(email);
      console.log(`   ${index + 1}. ${email} ${inAuth ? '✅' : '❌ Missing in auth'}`);
    });
    
    console.log('\n📋 Auth Users:');
    authEmails.forEach((email, index) => {
      const inDb = dbEmails.includes(email);
      console.log(`   ${index + 1}. ${email} ${inDb ? '✅' : '❌ Missing in database'}`);
    });
    
    // Find missing in auth
    const missingInAuth = dbEmails.filter(email => !authEmails.includes(email));
    const missingInDb = authEmails.filter(email => !dbEmails.includes(email));
    
    if (missingInAuth.length > 0) {
      console.log(`\n⚠️  Users in database but NOT in Supabase Auth (${missingInAuth.length}):`);
      missingInAuth.forEach(email => console.log(`   ❌ ${email}`));
      
      console.log(`\n💡 Solution: These users were created directly in database but not through Supabase Auth.`);
      console.log(`   They won't appear in admin panel until they're also created in auth.users.`);
    }
    
    if (missingInDb.length > 0) {
      console.log(`\n⚠️  Users in Supabase Auth but NOT in database (${missingInDb.length}):`);
      missingInDb.forEach(email => console.log(`   ❌ ${email}`));
      
      console.log(`\n💡 Solution: These users exist in auth but not in your app's user table.`);
    }
    
    if (missingInAuth.length === 0 && missingInDb.length === 0) {
      console.log(`\n✅ Perfect! All users exist in both auth.users and public.users`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

compareAuthVsDatabase();