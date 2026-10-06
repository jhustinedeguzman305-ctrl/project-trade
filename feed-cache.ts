import { after } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, feedCache } from '@/lib/db'
import type { Feed } from '@/lib/types'

const pending = new Map<string, Promise<Feed<unknown>>>()
const memory = new Map<string, Feed<unknown>>()

async function refresh<T>(key: string, source: string, load: () => Promise<T>): Promise<Feed<T>> {
  const existing = pending.get(key)
  if (existing) return existing as Promise<Feed<T>>
  const task = (async () => {
    const data = await load()
    const updatedAt = new Date()
    const result = { data, updatedAt: updatedAt.toISOString(), stale: false, source }
    memory.set(key, result)
    try { await db.insert(feedCache).values({ key, payload: data, updatedAt }).onConflictDoUpdate({ target: feedCache.key, set: { payload: data, updatedAt } }) }
    catch { console.error('Feed cache write unavailable:', key) }
    return result
  })()
  pending.set(key, task)
  try { return await task } finally { pending.delete(key) }
}

export async function cachedFeed<T>(key: string, ttl: number, source: string, load: () => Promise<T>): Promise<Feed<T>> {
  let cached = memory.get(key) as Feed<T> | undefined
  if (!cached) {
    try {
      const [row] = await db.select().from(feedCache).where(eq(feedCache.key, key)).limit(1)
      if (row) { cached = { data: row.payload as T, updatedAt: row.updatedAt.toISOString(), source, stale: false }; memory.set(key, cached) }
    } catch { console.error('Feed cache read unavailable:', key) }
  }
  if (cached) {
    const stale = Date.now() - Date.parse(cached.updatedAt) > ttl
    if (stale) after(async () => { try { await refresh(key, source, load) } catch { console.error('Feed refresh unavailable:', key) } })
    return { ...cached, stale }
  }
  return refresh(key, source, load)
}
