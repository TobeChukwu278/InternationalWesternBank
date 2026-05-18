const FRANKFURTER_URL = "https://api.frankfurter.app";

const CACHE_TTL = 60 * 60 * 1000;

interface RatesCache {
  rates: Record<string, number>;
  timestamp: number;
}

let ratesCache: RatesCache | null = null;

export async function getExchangeRates(
  base: string,
): Promise<Record<string, number>> {
  if (ratesCache && Date.now() - ratesCache.timestamp < CACHE_TTL) {
    return ratesCache.rates;
  }

  try {
    const res = await fetch(`${FRANKFURTER_URL}/latest?from=${base}`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return {};

    const data = await res.json();
    ratesCache = { rates: data.rates, timestamp: Date.now() };
    return data.rates;
  } catch {
    return {};
  }
}

export async function convertAmount(
  amount: number,
  from: string,
  to: string,
): Promise<number> {
  if (from === to) return amount;

  const rates = await getExchangeRates(from);
  const rate = rates[to];

  if (!rate) return amount;

  return amount * rate;
}
