'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { ArrowUpRight, Globe2, RefreshCw, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { type Article, type Feed, fetcher } from '@/lib/types'
import { DataError, FeedStamp, timeAgo } from './shared'
import { cn } from '@/lib/utils'

export function WorldWire({ expanded = false, onExpand }: { expanded?: boolean; onExpand?: () => void }) {
  const { data, error, mutate, isValidating } = useSWR<Feed<Article[]>>('/api/news', fetcher, { refreshInterval: 60000, errorRetryCount: 2 })
  const [category, setCategory] = useState('All')
  const articles = data?.data.filter(a => category === 'All' || a.category === category).slice(0, expanded ? 40 : 3)
  return <section className="panel flex min-w-0 flex-col"><div className="panel-heading"><div className="flex items-center gap-2"><Globe2 className="size-4 text-muted-foreground" /><h2 className="panel-title">World Wire</h2><span className="status-dot" /></div>{onExpand ? <Button variant="ghost" size="xs" onClick={onExpand}>Open wire<ArrowUpRight data-icon="inline-end" /></Button> : <Button variant="ghost" size="icon-sm" aria-label="Refresh World Wire" onClick={() => mutate()} disabled={isValidating}><RefreshCw /></Button>}</div><div className="px-5 pb-1"><ToggleGroup value={[category]} onValueChange={v => v.length && setCategory(v[0])} size="sm" spacing={1} aria-label="News category">{['All', 'Markets', 'Economy', 'Crypto'].map(c => <ToggleGroupItem key={c} value={c} aria-label={`${c} news`}>{c}</ToggleGroupItem>)}</ToggleGroup></div><div className="flex-1 px-5">{error && !data ? <DataError message={error.message} retry={() => mutate()} /> : !data ? <div className="flex flex-col gap-5 py-5">{[0, 1, 2].map(i => <div key={i} className="flex flex-col gap-2"><Skeleton className="h-3 w-1/3" /><Skeleton className="h-8 w-full" /></div>)}</div> : articles?.length ? articles.map((a, i) => <a key={a.url} href={a.url} target="_blank" rel="noopener noreferrer" className="feed-item group"><span className={cn('mt-1 size-1.5 shrink-0 rounded-full', i === 0 ? 'bg-primary' : 'bg-muted-foreground/30')} /><div className="min-w-0 flex-1"><div className="mb-2 flex items-center gap-2 text-[9px] text-muted-foreground"><span className="font-medium uppercase tracking-wider">{a.source}</span><span>·</span><span>{timeAgo(a.time)}</span>{a.impact === 'High' && <span className="ml-auto flex items-center gap-1 text-warning"><Radio className="size-2.5" />Key topic</span>}</div><h3 className="text-[12px] leading-relaxed font-medium transition-colors group-hover:text-primary">{a.title}<ArrowUpRight className="ml-1 inline size-3 text-muted-foreground opacity-0 group-hover:opacity-100" /></h3><span className="mt-2 inline-block text-[9px] text-muted-foreground">{a.category}</span></div></a>) : <p className="py-10 text-center text-xs text-muted-foreground">No {category.toLowerCase()} headlines in the current feed. Try All.</p>}</div><div className="border-t border-border px-5 py-3"><FeedStamp updatedAt={data?.updatedAt} stale={data?.stale} source="Publisher feeds · 5m cache" /></div></section>
}
