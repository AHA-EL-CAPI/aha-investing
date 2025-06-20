# scripts/get_price_history.py

import yfinance as yf
import pandas as pd
import json

ticker = yf.Ticker("PFCIBEST.CL")
data = ticker.history(period="1y")  # You can also use "5y", "1y", etc.

# Reduce data to only date and closing price
result = [{"date": str(idx.date()), "close": round(row["Close"], 2)} for idx, row in data.iterrows()]

print(json.dumps(result))


