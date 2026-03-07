/**
 * Run supabase/migrations/001_knowledge_tables.sql against POSTGRES_URL.
 * Usage: npx tsx scripts/run-supabase-migration.ts
 * Loads .env.local automatically (create it from .env.example with your Supabase POSTGRES_URL).
 */
import { readFileSync } from 'fs'
import { join } from 'path'

// Load .env.local
try {
  const envPath = join(process.cwd(), '.env.local')
  const env = readFileSync(envPath, 'utf8')
  for (const line of env.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
  }
} catch {
  // .env.local may not exist
}

import postgres from 'postgres'
const url = process.env.POSTGRES_URL
if (!url) {
  console.error('POSTGRES_URL is required. Set it in .env.local or pass it when running.')
  process.exit(1)
}

const sqlPath = join(process.cwd(), 'supabase/migrations/001_knowledge_tables.sql')
const sql = readFileSync(sqlPath, 'utf8')

// Split by semicolons but preserve multi-statement blocks (DO $$ ... $$)
// Simple approach: run as one batch - postgres supports multiple statements
const client = postgres(url, { max: 1 })

async function run() {
  console.log('Running migration...')
  await client.unsafe(sql)
  console.log('Migration completed successfully.')
}

run()
  .catch((err) => {
    console.error('Migration failed:', err)
    process.exit(1)
  })
  .finally(() => client.end())
