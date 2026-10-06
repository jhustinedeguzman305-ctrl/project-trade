import { NextRequest, NextResponse } from 'next/server'
import { getCandles } from '@/lib/market-data'
import { assets } from '@/lib/types'
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol') ?? 'BTC'
  const interval = Number(request.nextUrl.searchParams.get('interval') ?? 60)
  if (!assets.some(a => a.symbol === symbol) || ![5, 15, 60, 240].includes(interval)) return NextResponse.json({ error: 'Unsupported market or interval' }, { status: 400 })
  try { return NextResponse.json(await getCandles(symbol, interval)) }
  catch { return NextResponse.json({ error: 'Chart data is temporarily unavailable. Please retry.' }, { status: 503 }) }
}
