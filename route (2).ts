import { NextResponse } from 'next/server'
import { getMarkets } from '@/lib/market-data'
export const dynamic = 'force-dynamic'
export async function GET() {
  try { return NextResponse.json(await getMarkets()) }
  catch { return NextResponse.json({ error: 'Market data is temporarily unavailable. Please retry.' }, { status: 503 }) }
}
