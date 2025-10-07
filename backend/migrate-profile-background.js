import supabase from './src/lib/supabase.js';

async function addProfileBackgroundColumn() {
  try {
    console.log('🚀 Starting migration: Add profile_background column to users table');

    // Check if column already exists
    const { data: existingColumns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'users')
      .eq('column_name', 'profile_background');

    if (checkError) {
      console.log('⚠️ Could not check existing columns, proceeding with migration...');
    }

    if (existingColumns && existingColumns.length > 0) {
      console.log('✅ Column profile_background already exists, skipping migration');
      return;
    }

    // Add the column using raw SQL
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_background TEXT DEFAULT 'none';
        CREATE INDEX IF NOT EXISTS idx_users_profile_background ON users(profile_background);
      `
    });

    if (error) {
      console.error('❌ Error executing migration:', error);
      console.log('💡 You may need to run this manually in Supabase SQL Editor:');
      console.log(`
ALTER TABLE users ADD COLUMN profile_background TEXT DEFAULT 'none';
CREATE INDEX idx_users_profile_background ON users(profile_background);
      `);
      return;
    }

    console.log('✅ Migration completed successfully!');
    console.log('📝 Added profile_background column with default value "none"');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('💡 Manual migration SQL:');
    console.log(`
ALTER TABLE users ADD COLUMN profile_background TEXT DEFAULT 'none';
CREATE INDEX idx_users_profile_background ON users(profile_background);
    `);
  }
}

// Run migration
addProfileBackgroundColumn();
