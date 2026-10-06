import { XMLParser } from 'fast-xml-parser'
import { assets, type Article, type Candle, type Market } from '@/lib/types'
import { cachedFeed } from '@/lib/feed-cache'

async function getJSON(url: string) {
  const r = await fetch(url, { signal: AbortSignal.timeout(8000), cache: 'no-store' })
  if (!r.ok) throw new Error('Market provider is temporarily unavailable')
  const data = await r.json()
  if (data.error?.length) throw new Error('Market provider rejected the request')
  return data.result
}
export function getMarkets() {
  return cachedFeed<Market[]>('markets:v1', 30000, 'Kraken · USD spot', async () => {
    const result = await getJSON(`https://api.kraken.com/0/public/Ticker?pair=${assets.map(a => a.pair).join(',')}`)
    return assets.flatMap(a => {
      const t = result[a.key] ?? result[a.pair] ?? (a.symbol === 'DOGE' ? result.XXDGZUSD : null)
      if (!t) return []
      const price = Number(t.c[0]), open = Number(t.o)
      if (!Number.isFinite(price) || price <= 0) return []
      return [{ symbol: a.symbol, name: a.name, price, change: (price / open - 1) * 100, volume: Number(t.v[1]) * Number(t.p[1]), high: Number(t.h[1]), low: Number(t.l[1]), trades: Number(t.t[1]) }]
    })
  })
}
export function getCandles(symbol: string, interval: number) {
  const asset = assets.find(a => a.symbol === symbol)
  if (!asset || ![5, 15, 60, 240].includes(interval)) throw new Error('Invalid market or interval')
  return cachedFeed<Candle[]>(`candles:${symbol}:${interval}:v1`, 60000, 'Kraken · closed candles', async () => {
    const result = await getJSON(`https://api.kraken.com/0/public/OHLC?pair=${asset.pair}&interval=${interval}`)
    const rows = Object.entries(result).find(([key]) => key !== 'last')?.[1] as (string | number)[][] | undefined
    if (!rows?.length) throw new Error('No candle data available')
    return rows.slice(0, -1).map(c => ({ time: Number(c[0]) * 1000, open: Number(c[1]), high: Number(c[2]), low: Number(c[3]), close: Number(c[4]), volume: Number(c[6]) })).filter(c => [c.open, c.high, c.low, c.close].every(n => Number.isFinite(n) && n > 0))
  })
}
export function getNews() {
  return cachedFeed<Article[]>('news:v1', 300000, 'CNBC + BBC Business', async () => {
    const feeds = [ { source: 'CNBC', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html' }, { source: 'BBC', url: 'https://feeds.bbci.co.uk/news/business/rss.xml' } ]
    const results = await Promise.allSettled(feeds.map(async ({ source, url }) => {
      const r = await fetch(url, { signal: AbortSignal.timeout(7000), cache: 'no-store' })
      if (!r.ok) throw new Error('News provider unavailable')
      const xml = new XMLParser({ ignoreAttributes: false }).parse(await r.text())
      const items = xml.rss?.channel?.item ?? []
      return (Array.isArray(items) ? items : [items]).flatMap((item: { title?: string; link?: string; pubDate?: string }) => {
        const title = String(item.title ?? '').replace(/<[^>]+>/g, '').trim()
        const time = Date.parse(item.pubDate ?? '')
        if (!title || !Number.isFinite(time) || !/^https:\/\//.test(item.link ?? '')) return []
        const category = /bitcoin|crypto|ethereum|blockchain|token/i.test(title) ? 'Crypto' : /rate|inflation|fed |bank|gdp|tariff|econom/i.test(title) ? 'Economy' : 'Markets'
        return [{ title, time, url: item.link!, source, category, impact: /fed |inflation|interest rate|war|tariff|crash|surge|recession/i.test(title) ? 'High' : 'Normal' } as Article]
      })
    }))
    const seen = new Set<string>()
    const articles = results.flatMap(r => r.status === 'fulfilled' ? r.value : []).filter(a => { const key = a.title.toLowerCase(); if (seen.has(key)) return false; seen.add(key); return true }).sort((a, b) => b.time - a.time).slice(0, 50)
    if (!articles.length) throw new Error('News providers are temporarily unavailable')
    return articles
  })
}
