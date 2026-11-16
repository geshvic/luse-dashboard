import json
with open(r'C:\Users\MUSUK\.openclaw\workspace\luse-dashboard\data\companies.json') as f:
    companies = json.load(f)

issues = []
for c in companies:
    ticker = c.get('ticker', '?')
    name = c.get('name', '?')
    price = c.get('price')
    if price is None or price == 0:
        issues.append(f'{ticker} ({name}) -- price={price}')

if issues:
    print('PRICE ISSUES FOUND:')
    for i in issues:
        print(f'  - {i}')
else:
    print('All stock prices populated OK.')

active = sum(1 for x in companies if x.get('volume') and x['volume'] > 0)
inactive = sum(1 for x in companies if not x.get('volume') or x['volume'] == 0)
print(f'Active stocks (with trades): {active}')
print(f'Inactive/no trades: {inactive}')
print(f'Total listed: {len(companies)}')
