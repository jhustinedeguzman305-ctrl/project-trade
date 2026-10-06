export const assets = [
  { symbol: 'BTC', name: 'Bitcoin', pair: 'XBTUSD', key: 'XXBTZUSD' },
  { symbol: 'ETH', name: 'Ethereum', pair: 'ETHUSD', key: 'XETHZUSD' },
  { symbol: 'SOL', name: 'Solana', pair: 'SOLUSD', key: 'SOLUSD' },
  { symbol: 'XRP', name: 'XRP', pair: 'XRPUSD', key: 'XXRPZUSD' },
  { symbol: 'DOGE', name: 'Dogecoin', pair: 'DOGEUSD', key: 'XDGUSD' },
  { symbol: 'ADA', name: 'Cardano', pair: 'ADAUSD', key: 'ADAUSD' },
  { symbol: 'AVAX', name: 'Avalanche', pair: 'AVAXUSD', key: 'AVAXUSD' },
  { symbol: 'LINK', name: 'Chainlink', pair: 'LINKUSD', key: 'LINKUSD' },
  { symbol: 'DOT', name: 'Polkadot', pair: 'DOTUSD', key: 'DOTUSD' },
  { symbol: 'LTC', name: 'Litecoin', pair: 'LTCUSD', key: 'XLTCZUSD' },
] as const
export type Market = { symbol: string; name: string; price: number; change: number; volume: number; high: number; low: number; trades: number }
export type Candle = { time: number; open: number; high: number; low: number; close: number; volume: number }
export type Article = { title: string; url: string; source: string; time: number; category: 'Crypto' | 'Economy' | 'Markets'; impact: 'High' | 'Normal' }
export type Feed<T> = { data: T; updatedAt: string; stale: boolean; source: string }
export type BotConfig = { symbol: string; strategy: 'momentum' | 'mean-reversion'; capital: number; allocation: number; stopLoss: number; takeProfit: number }
export type PaperTrade = { id: number; entryTime: number; exitTime: number; entry: number; exit: number; quantity: number; pnl: number; reason: string }
export type Backtest = { trades: PaperTrade[]; equity: { time: number; value: number; benchmark: number }[]; capital: number; finalEquity: number; pnl: number; winRate: number; maxDrawdown: number; fees: number; start: number; end: number; symbol: string; config: BotConfig }
export const defaultBotConfig: BotConfig = { symbol: 'BTC', strategy: 'momentum', capital: 10000, allocation: 20, stopLoss: 2, takeProfit: 4 }
export const money = (n: number, compact = false) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: compact ? 'compact' : 'standard', maximumFractionDigits: compact ? 1 : n < 1 ? 4 : 2 }).format(n)
export const percent = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`
export async function fetcher<T>(url: string): Promise<T> { const r = await fetch(url); const data = await r.json(); if (!r.ok) throw new Error(data.error || 'Unable to load data. Please retry.'); return data }
