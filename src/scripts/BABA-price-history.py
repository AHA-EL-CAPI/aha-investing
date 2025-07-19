# scripts/get_price_history.py

import yfinance as yf
import pandas as pd
import json

ticker = yf.Ticker("BABA")
data = ticker.history(period="1y")  # You can also use "5y", "1y", etc.

# Reduce data to only date and closing price
result = [{"date": str(idx.date()), "close": round(row["Close"], 2)} for idx, row in data.iterrows()]

# print(json.dumps(result))

# Convert to valid TypeScript export
with open("src/data/BABA/price-history.ts", "w", encoding="utf-8") as f:
    f.write("export const priceHistory = ")
    f.write(json.dumps(result, indent=2))  # convert to double quotes for valid TS
    f.write(";\n")


