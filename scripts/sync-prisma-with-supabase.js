const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const prisma = new PrismaClient();

// Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_MYLOANPLANS;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function syncPrismaWithSupabase() {
  try {
    console.log('🔄 Syncing Prisma database with Supabase Auth\n');

    // Get all users from Supabase Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }

    console.log(`📊 Found ${authUsers.users.length} users in Supabase Auth\n`);

    let synced = 0;
    let created = 0;
    let errors = 0;

    for (const authUser of authUsers.users) {
      try {
        if (!authUser.email) {
          console.log(`⏭️  Skipping user ${authUser.id} (no email)`);
          continue;
        }

        // Check if user exists in Prisma
        const existingUser = await prisma.user.findUnique({
          where: { email: authUser.email },
        });

        if (existingUser) {
          // Update existing user
          await prisma.user.update({
            where: { email: authUser.email },
            data: {
              name: authUser.user_metadata?.name || existingUser.name,
              emailVerified: authUser.email_confirmed_at ? new Date(authUser.email_confirmed_at) : null,
              // Remove password from Prisma (it's now in Supabase Auth)
              password: null,
            },
          });
          console.log(`✅ Updated ${authUser.email} in Prisma`);
          synced++;
        } else {
          // Create new user in Prisma
          await prisma.user.create({
            data: {
              email: authUser.email,
              name: authUser.user_metadata?.name || authUser.email.split('@')[0],
              emailVerified: authUser.email_confirmed_at ? new Date(authUser.email_confirmed_at) : null,
              // Don't store password in Prisma
            },
          });
          console.log(`✅ Created ${authUser.email} in Prisma`);
          created++;
        }
      } catch (error) {
        console.error(`❌ Error syncing ${authUser.email}:`, error.message);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Sync Summary:');
    console.log(`✅ Synced (updated): ${synced}`);
    console.log(`➕ Created: ${created}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('='.repeat(50));

    // Also remove passwords from existing Prisma users (cleanup)
    console.log('\n🧹 Cleaning up passwords from Prisma database...');
    const usersWithPasswords = await prisma.user.findMany({
      where: {
        password: {
          not: null,
        },
      },
      select: {
        email: true,
      },
    });

    if (usersWithPasswords.length > 0) {
      await prisma.user.updateMany({
        where: {
          password: {
            not: null,
          },
        },
        data: {
          password: null,
        },
      });
      console.log(`✅ Removed passwords from ${usersWithPasswords.length} users in Prisma`);
    } else {
      console.log(`✅ No passwords to remove from Prisma`);
    }

  } catch (error) {
    console.error('❌ Sync error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncPrismaWithSupabase();


