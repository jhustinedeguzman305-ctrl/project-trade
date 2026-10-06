'use client'

import { ArrowDownRight, ArrowUpRight, RefreshCw, TriangleAlert, Bitcoin, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { percent } from '@/lib/types'

export function Change({ value }: { value: number }) { return <span className={cn('inline-flex items-center gap-0.5 font-mono text-[11px] tabular-nums', value >= 0 ? 'text-positive' : 'text-destructive')}>{value >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}{percent(value)}</span> }
export function Coin({ symbol }: { symbol: string }) { return <span className="coin" data-coin={symbol}>{symbol === 'BTC' ? <Bitcoin className="size-4.5" /> : symbol === 'ETH' ? <span className="text-lg">Ξ</span> : symbol === 'SOL' ? <Activity className="size-4" /> : symbol.slice(0, 1)}</span> }
export function DataError({ message, retry }: { message: string; retry: () => void }) { return <Alert variant="destructive" className="my-3"><TriangleAlert /><AlertTitle>Feed unavailable</AlertTitle><AlertDescription>{message}<Button size="sm" variant="outline" onClick={retry}><RefreshCw data-icon="inline-start" />Retry</Button></AlertDescription></Alert> }
export function FeedStamp({ updatedAt, stale, source }: { updatedAt?: string; stale?: boolean; source: string }) { return <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className={cn('size-1 rounded-full', stale ? 'bg-warning' : updatedAt ? 'bg-positive' : 'bg-muted-foreground')} />{stale ? 'Cached · refreshing' : source}{updatedAt && <span className="hidden sm:inline"> · {new Date(updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>}</span> }
export function timeAgo(time: number) { const m = Math.max(0, Math.floor((Date.now() - time) / 60000)); return m < 1 ? 'Just now' : m < 60 ? `${m}m ago` : m < 1440 ? `${Math.floor(m / 60)}h ago` : `${Math.floor(m / 1440)}d ago` }
