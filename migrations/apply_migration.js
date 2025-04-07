// apply_migration.js
const { supabase } = require('../lib/supabase.js');
const fs = require('fs');
const path = require('path');

async function applyMigration(migrationPath) {
  try {
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log("Applying migration: " + migrationPath);
    const { error } = await supabase.rpc('exec_sql', { sql: sql });

    if (error) {
      console.error("Error applying migration: " + migrationPath, error);
      return false;
    }

    console.log("Successfully applied migration: " + migrationPath);
    return true;
  } catch (error) {
    console.error("Error reading or executing migration: " + migrationPath, error);
    return false;
  }
}

async function main() {
  const migrationPath = path.join(__dirname, '001_initial_schema', 'up.sql');
  const success = await applyMigration(migrationPath);

  if (!success) {
    console.error('Failed to apply migration.');
    process.exit(1);
  }

  console.log('Migration applied successfully!');
}

main().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});