import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { pgTable, text, jsonb, timestamp } from 'drizzle-orm/pg-core'

export const feedCache = pgTable('market_feed_cache', {
  key: text('key').primaryKey(),
  payload: jsonb('payload').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
const globalDb = globalThis as unknown as { pool?: Pool }
const pool = globalDb.pool ?? new Pool({ connectionString: process.env.DATABASE_URL, max: 3, connectionTimeoutMillis: 4000, idleTimeoutMillis: 10000 })
if (process.env.NODE_ENV !== 'production') globalDb.pool = pool
export const db = drizzle(pool)
