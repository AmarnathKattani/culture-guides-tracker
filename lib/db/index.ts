import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

function createDb() {
  const connectionString = process.env.POSTGRES_URL
  if (!connectionString) return null
  const client = postgres(connectionString, { max: 10 })
  return drizzle(client, { schema })
}

export const db = createDb()
export const isDbConfigured = (): boolean => !!process.env.POSTGRES_URL
