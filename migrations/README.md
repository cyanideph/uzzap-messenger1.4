# UzZap Database Migrations

This directory contains database migration scripts for the UzZap application. These scripts are designed to be run against a Supabase PostgreSQL database to set up the necessary schema and seed data.

## Migration Structure

Each migration is contained in a numbered directory (e.g., `001_initial_schema`) and typically includes:

- `up.sql`: Script to apply the migration (create tables, add columns, etc.)
- `down.sql`: Script to roll back the migration (drop tables, remove columns, etc.)
- `seed.sql`: Script to populate the database with initial data

## How to Apply Migrations

### Using Supabase Dashboard

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of the `up.sql` file
5. Run the query
6. Repeat for the `seed.sql` file if you want to populate the database with initial data

### Using Supabase CLI (if available)

```bash
supabase db push
```

## Current Migrations

### 001_initial_schema

Initial database schema for the UzZap application, including:

- User profiles
- Regions and provinces in the Philippines
- Chatrooms
- Messages and direct messages
- Row-level security policies

## Best Practices

1. Always back up your database before applying migrations
2. Test migrations in a development environment before applying to production
3. When creating new migrations, increment the numbering (e.g., `002_add_feature_x`)
4. Always include both `up.sql` and `down.sql` scripts for each migration
