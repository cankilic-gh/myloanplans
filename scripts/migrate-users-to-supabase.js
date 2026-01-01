const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const prisma = new PrismaClient();

// Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_MYLOANPLANS;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL');
  console.error('Required: SUPABASE_SERVICE_ROLE_KEY or SUPABASE_SERVICE_ROLE_MYLOANPLANS');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function migrateUsersToSupabase() {
  try {
    console.log('🔄 Starting user migration to Supabase Auth\n');
    console.log(`📡 Supabase URL: ${supabaseUrl}\n`);

    // Get all users from Prisma database
    const dbUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        emailVerified: true,
      },
    });

    console.log(`📊 Found ${dbUsers.length} users in database\n`);

    // Get existing users from Supabase Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (authError) {
      console.error('❌ Error fetching existing auth users:', authError);
      return;
    }

    const existingAuthEmails = new Set(
      authUsers.users.map((u) => u.email).filter(Boolean)
    );

    console.log(`📊 Found ${existingAuthEmails.size} existing users in Supabase Auth\n`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of dbUsers) {
      try {
        // Skip if user already exists in Supabase Auth
        if (existingAuthEmails.has(user.email)) {
          console.log(`⏭️  Skipping ${user.email} (already exists in Supabase Auth)`);
          skipped++;
          continue;
        }

        console.log(`\n🔄 Migrating ${user.email}...`);

        // Create user in Supabase Auth
        // If password exists, we'll set it (Supabase will hash it)
        const createUserData = {
          email: user.email,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            name: user.name || '',
            migrated_from_prisma: true,
            prisma_user_id: user.id,
          },
        };

        // If password exists, include it (Supabase will hash it automatically)
        if (user.password) {
          createUserData.password = user.password;
          console.log(`   📝 Including password (will be hashed by Supabase)`);
        } else {
          console.log(`   ⚠️  No password found - user will need to reset password`);
        }

        const { data: authUser, error: createError } = await supabase.auth.admin.createUser(createUserData);

        if (createError) {
          console.error(`❌ Error creating ${user.email}:`, createError.message);
          errors++;
          continue;
        }

        console.log(`✅ Created ${user.email} in Supabase Auth (ID: ${authUser.user.id})`);

        // Update Prisma user to link with Supabase Auth ID
        // We'll store the Supabase Auth ID in a metadata field or use email as the link
        // For now, we'll keep the Prisma user as-is and use email to link them

        migrated++;
      } catch (error) {
        console.error(`❌ Error migrating ${user.email}:`, error.message);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log(`✅ Migrated: ${migrated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log('='.repeat(50));

    if (migrated > 0) {
      console.log('\n⚠️  IMPORTANT:');
      console.log('Users have been migrated to Supabase Auth, but passwords were NOT migrated.');
      console.log('Users will need to use "Forgot Password" to set a new password.');
      console.log('Or you can manually set passwords using Supabase Admin API.');
    }
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateUsersToSupabase();

