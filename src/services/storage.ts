import type { AppState, Currency, Expense, ExchangeRates } from '../models';

const STORAGE_KEY = 'cuentas_claras_data_v3';

const DEFAULT_STATE: AppState = {
  participants: [],
  expenses: [],
  payments: [],
  exchangeRates: { usdToBob: 6.96, usdToUsdt: 1 },
};

/** Gastos antiguos (sin currency) se hidratan como BOB. */
function hydrateExpense(raw: Expense & { currency?: Currency }): Expense {
  return {
    ...raw,
    currency: raw.currency ?? 'BOB',
  };
}

function hydrateExchangeRates(raw: Partial<ExchangeRates> | undefined): ExchangeRates {
  return {
    ...DEFAULT_STATE.exchangeRates,
    ...raw,
  };
}

// Carga el estado desde localStorage
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    // Spread defensivo: si el JSON guardado no tiene campos nuevos (datos anteriores
    // a esta iteración), se usa el valor del DEFAULT_STATE como fallback.
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const merged = { ...DEFAULT_STATE, ...parsed };
    return {
      ...merged,
      expenses: (merged.expenses ?? []).map(hydrateExpense),
      exchangeRates: hydrateExchangeRates(merged.exchangeRates),
    };
  } catch {
    return DEFAULT_STATE;
  }
}

// Guarda el estado en localStorage
export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error guardando estado en localStorage:', error);
  }
}

// Limpia todos los datos (para uso futuro)
export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
