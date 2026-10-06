import { NextResponse } from 'next/server'
import { getNews } from '@/lib/market-data'
export const dynamic = 'force-dynamic'
export async function GET() {
  try { return NextResponse.json(await getNews()) }
  catch { return NextResponse.json({ error: 'World Wire is temporarily unavailable. Please retry.' }, { status: 503 }) }
}
