// apply_migrations.js
// A simple script to apply migrations to Supabase

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL and key must be set as environment variables');
  console.error('Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration(migrationPath, fileName) {
  try {
    const filePath = path.join(migrationPath, fileName);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`Applying migration: ${fileName}`);
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(`Error applying migration ${fileName}:`, error);
      return false;
    }
    
    console.log(`Successfully applied migration: ${fileName}`);
    return true;
  } catch (error) {
    console.error(`Error reading or executing migration ${fileName}:`, error);
    return false;
  }
}

async function main() {
  const migrationsDir = path.join(__dirname);
  const migrationFolders = fs.readdirSync(migrationsDir)
    .filter(folder => folder.match(/^\d+_/) && fs.statSync(path.join(migrationsDir, folder)).isDirectory())
    .sort(); // Sort to apply migrations in order

  console.log('Found migration folders:', migrationFolders);

  for (const folder of migrationFolders) {
    const migrationPath = path.join(migrationsDir, folder);
    
    // Apply up.sql first
    const success = await applyMigration(migrationPath, 'up.sql');
    if (!success) {
      console.error(`Failed to apply up.sql for ${folder}. Stopping migration process.`);
      process.exit(1);
    }
    
    // Then apply seed.sql if it exists
    if (fs.existsSync(path.join(migrationPath, 'seed.sql'))) {
      const seedSuccess = await applyMigration(migrationPath, 'seed.sql');
      if (!seedSuccess) {
        console.error(`Failed to apply seed.sql for ${folder}. Continuing with next migration.`);
      }
    }
  }

  console.log('All migrations applied successfully!');
}

main().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
