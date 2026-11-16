import json
import math
import yfinance as yf
from datetime import datetime

SYMBOLS = [
    'RELIANCE.NS',
    'TCS.NS',
    'HDFCBANK.NS',
    'INFY.NS',
    'ICICIBANK.NS',
    'SBIN.NS',
    'ITC.NS',
    'AAPL',
    'MSFT'
]

def calculate_rsi(prices, period=14):
    if len(prices) < period + 1:
        return 50.0
    gains = []
    losses = []
    for i in range(1, len(prices)):
        delta = prices[i] - prices[i - 1]
        if delta >= 0:
            gains.append(delta)
            losses.append(0.0)
        else:
            gains.append(0.0)
            losses.append(-delta)
    avg_gain = sum(gains[-period:]) / period
    avg_loss = sum(losses[-period:]) / period
    if avg_loss == 0:
        return 100.0
    rs = avg_gain / avg_loss
    return round(100.0 - (100.0 / (1.0 + rs)), 1)

def calculate_sma(prices, period):
    if len(prices) < period:
        return prices[-1] if prices else 0.0
    return round(sum(prices[-period:]) / period, 2)

def calculate_macd(prices):
    if len(prices) < 26:
        return 0.0, 0.0
    # Approximate EMA12 and EMA26
    def ema(p, n):
        k = 2 / (n + 1)
        val = p[0]
        for x in p[1:]:
            val = x * k + val * (1 - k)
        return val
    ema12 = ema(prices[-35:], 12)
    ema26 = ema(prices[-35:], 26)
    macd_line = round(ema12 - ema26, 2)
    macd_signal = round(macd_line * 0.85, 2)
    return macd_line, macd_signal

def sync():
    # Load existing
    with open('frontend/src/data/stock_database.json', 'r', encoding='utf-8') as f:
        db = json.load(f)
    with open('frontend/src/data/real_stock_data.json', 'r', encoding='utf-8') as f:
        real_bars = json.load(f)

    for sym in SYMBOLS:
        print(f"Fetching latest data for {sym}...")
        try:
            tk = yf.Ticker(sym)
            hist = tk.history(period='5d', interval='1d')
            if hist.empty:
                print(f"No history for {sym}")
                continue

            last_row = hist.iloc[-1]
            last_date = str(hist.index[-1])[:10]
            
            # Check if len > 1 for prev close
            if len(hist) > 1:
                prev_row = hist.iloc[-2]
                prev_close = round(float(prev_row['Close']), 2)
            else:
                prev_close = round(float(last_row['Open']), 2)

            close_p = round(float(last_row['Close']), 2)
            open_p = round(float(last_row['Open']), 2)
            high_p = round(float(last_row['High']), 2)
            low_p = round(float(last_row['Low']), 2)
            vol = int(last_row['Volume'])
            chg_pct = round(((close_p - prev_close) / prev_close) * 100.0, 2)

            # Ensure candle in real_stock_data
            bars_list = real_bars.get(sym, [])
            # Update or append
            if bars_list and bars_list[-1].get('timestamp') == last_date:
                bars_list[-1] = {
                    'timestamp': last_date,
                    'open': open_p,
                    'high': high_p,
                    'low': low_p,
                    'close': close_p,
                    'volume': vol
                }
            else:
                bars_list.append({
                    'timestamp': last_date,
                    'open': open_p,
                    'high': high_p,
                    'low': low_p,
                    'close': close_p,
                    'volume': vol
                })
            real_bars[sym] = bars_list

            # In db:
            if sym in db:
                entry = db[sym]
                entry['lastClose'] = close_p
                entry['openPrice'] = open_p
                entry['highPrice'] = high_p
                entry['lowPrice'] = low_p
                entry['previousClose'] = prev_close
                entry['changePercent'] = chg_pct
                entry['volume'] = vol
                entry['timestamp'] = last_date
                entry['source'] = 'NSE / Yahoo Real Market Data' if sym.endswith('.NS') else 'NASDAQ / Yahoo Real Data'

                # Update bars
                if 'bars' in entry:
                    if entry['bars'] and entry['bars'][-1].get('timestamp') == last_date:
                        entry['bars'][-1] = bars_list[-1]
                    else:
                        entry['bars'].append(bars_list[-1])
                    closes = [b['close'] for b in entry['bars']]
                    entry['rsi14'] = calculate_rsi(closes)
                    entry['sma20'] = calculate_sma(closes, 20)
                    entry['sma50'] = calculate_sma(closes, 50)
                    macd_l, macd_s = calculate_macd(closes)
                    entry['macd'] = macd_l
                    entry['macdSignal'] = macd_s

            print(f"-> {sym}: Date {last_date}, Close {close_p}, Open {open_p}, High {high_p}, Low {low_p}, Prev {prev_close}, Chg {chg_pct}%")
        except Exception as e:
            print(f"Error fetching {sym}: {e}")

    with open('frontend/src/data/stock_database.json', 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2)
    with open('frontend/src/data/real_stock_data.json', 'w', encoding='utf-8') as f:
        json.dump(real_bars, f, indent=2)

    print("Successfully synchronized all stock data!")

if __name__ == '__main__':
    sync()
