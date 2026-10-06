import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCandles } from '@/lib/market-data'
import { runBacktest } from '@/lib/backtest'
import { assets } from '@/lib/types'
const schema = z.object({ symbol: z.string().refine(s => assets.some(a => a.symbol === s)), strategy: z.enum(['momentum', 'mean-reversion']), capital: z.number().min(100).max(1000000), allocation: z.number().min(1).max(100), stopLoss: z.number().min(0.1).max(20), takeProfit: z.number().min(0.1).max(50) })
export async function POST(request: NextRequest) {
  try {
    if (Number(request.headers.get('content-length') ?? 0) > 2048) return NextResponse.json({ error: 'Request too large' }, { status: 413 })
    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Check the capital, allocation, and risk limits.' }, { status: 400 })
    const feed = await getCandles(parsed.data.symbol, 60)
    if (Date.now() - Date.parse(feed.updatedAt) > 3600000) return NextResponse.json({ error: 'Candle data is too old. Refresh the market data and try again.' }, { status: 503 })
    return NextResponse.json({ ...runBacktest(feed.data, parsed.data), updatedAt: feed.updatedAt })
  } catch { return NextResponse.json({ error: 'Unable to run the backtest. Market data may be unavailable; please retry.' }, { status: 503 }) }
}
