import type { Currency, ExchangeRates } from '../models';

export const CURRENCIES: Currency[] = ['USD', 'USDT', 'BOB'];

export const CURRENCY_LABELS: Record<Currency, string> = {
  USD: 'Dólares',
  USDT: 'USDT',
  BOB: 'Bolivianos',
};

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  USDT: 'USDT',
  BOB: 'Bs.',
};

/** Muestra el monto en su moneda original (símbolo + valor). */
export function formatMoney(amount: number, currency: Currency): string {
  return `${CURRENCY_SYMBOLS[currency]} ${amount.toFixed(2)}`;
}

export function isCurrency(value: string): value is Currency {
  return (CURRENCIES as string[]).includes(value);
}

/**
 * Convierte un monto en su moneda original a centavos enteros de USD.
 *
 * USD  → round(amount * 100)
 * USDT → round(amount / usdToUsdt * 100)
 * BOB  → round(amount / usdToBob * 100)
 *
 * Documentado para el Alumno 2. No se conecta a calculations.ts en esta iteración.
 */
export function toUsdCents(
  amount: number,
  currency: Currency,
  rates: ExchangeRates
): number {
  switch (currency) {
    case 'USD':
      return Math.round(amount * 100);
    case 'USDT':
      return Math.round((amount / rates.usdToUsdt) * 100);
    case 'BOB':
      return Math.round((amount / rates.usdToBob) * 100);
  }
}

/**
 * Convierte centavos de USD a un monto en la moneda destino (solo para mostrar).
 * USDT = (usdCents / 100) * usdToUsdt
 * BOB  = (usdCents / 100) * usdToBob
 *
 * Documentado para el Alumno 3. No se usa en esta iteración.
 */
export function fromUsdCents(
  usdCents: number,
  targetCurrency: Currency,
  rates: ExchangeRates
): number {
  const usd = usdCents / 100;
  switch (targetCurrency) {
    case 'USD':
      return usd;
    case 'USDT':
      return usd * rates.usdToUsdt;
    case 'BOB':
      return usd * rates.usdToBob;
  }
}
