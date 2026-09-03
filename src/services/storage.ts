import type { AppState } from '../models';

const STORAGE_KEY = 'cuentas_claras_data_v3';

const DEFAULT_STATE: AppState = {
  participants: [],
  expenses: [],
  payments: [],
};

// Carga el estado desde localStorage
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    // Spread defensivo: si el JSON guardado no tiene 'payments' (datos anteriores
    // a esta iteración), se usa el valor del DEFAULT_STATE como fallback.
    return { ...DEFAULT_STATE, ...JSON.parse(raw) } as AppState;
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
