import { type BotConfig, type Candle, type Backtest, type PaperTrade } from '@/lib/types'

export function runBacktest(candles: Candle[], config: BotConfig): Backtest {
  if (candles.length < 60) throw new Error('Not enough closed candles to test this strategy')
  const feeRate = 0.0026, slippage = 0.0005
  let cash = config.capital, position: { price: number; quantity: number; time: number; cost: number } | null = null
  let fees = 0, peak = cash, maxDrawdown = 0
  const trades: PaperTrade[] = [], equity: Backtest['equity'] = []
  const sma = (end: number, size: number) => candles.slice(end - size, end).reduce((sum, c) => sum + c.close, 0) / size
  const close = (price: number, candle: Candle, reason: string) => {
    if (!position) return
    const fill = price * (1 - slippage)
    const proceeds = position.quantity * fill, fee = proceeds * feeRate
    fees += fee; cash += proceeds - fee
    trades.push({ id: trades.length + 1, entryTime: position.time, exitTime: candle.time, entry: position.price, exit: fill, quantity: position.quantity, pnl: proceeds - fee - position.cost, reason })
    position = null
  }
  for (let i = 51; i < candles.length; i++) {
    const c = candles[i], fast = sma(i, 12), slow = sma(i, 26), previousFast = sma(i - 1, 12), previousSlow = sma(i - 1, 26)
    const buy = config.strategy === 'momentum' ? fast > slow && previousFast <= previousSlow : candles[i - 1].close < slow * 0.985
    const sell = config.strategy === 'momentum' ? fast < slow && previousFast >= previousSlow : candles[i - 1].close >= slow
    if (position && sell) close(c.open, c, 'Strategy exit')
    else if (!position && buy) {
      const cost = cash * config.allocation / 100, fee = cost * feeRate, price = c.open * (1 + slippage)
      fees += fee; cash -= cost; position = { price, quantity: (cost - fee) / price, time: c.time, cost }
    }
    if (position) {
      const stop = position.price * (1 - config.stopLoss / 100), take = position.price * (1 + config.takeProfit / 100)
      // If both levels occur within one candle, assume the adverse fill first.
      if (c.low <= stop) close(Math.min(c.open, stop), c, 'Stop loss')
      else if (c.high >= take) close(take, c, 'Take profit')
    }
    if (i === candles.length - 1 && position) close(c.close, c, 'End of test')
    const value = cash + (position ? position.quantity * c.close : 0)
    peak = Math.max(peak, value); maxDrawdown = Math.max(maxDrawdown, (peak - value) / peak * 100)
    equity.push({ time: c.time, value, benchmark: config.capital * c.close / candles[51].open })
  }
  return { trades, equity, capital: config.capital, finalEquity: cash, pnl: cash - config.capital, winRate: trades.length ? trades.filter(t => t.pnl > 0).length / trades.length * 100 : 0, maxDrawdown, fees, start: candles[51].time, end: candles.at(-1)!.time, symbol: config.symbol, config }
}
