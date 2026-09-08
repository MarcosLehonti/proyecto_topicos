import { useState, useCallback } from 'react';
import type { AppState, Currency, Expense, ExchangeRates, Participant, PaymentRecord } from '../models';
import { loadState, saveState } from '../services/storage';
import { generateId } from '../services/calculations';
import { isCurrency } from '../services/currency';

/**
 * Controller principal de la aplicación.
 * Expone acciones y estado a las vistas.
 */
export function useAppController() {
  const [state, setState] = useState<AppState>(() => loadState());

  // Persiste el estado y actualiza el componente
  const updateState = useCallback((newState: AppState) => {
    saveState(newState);
    setState(newState);
  }, []);

  // ─── Participantes ────────────────────────────────────────────────────────

  /**
   * Agrega un participante nuevo.
   * Retorna un mensaje de error si la validación falla, o null si fue exitoso.
   */
  const addParticipant = useCallback(
    (name: string): string | null => {
      const trimmed = name.trim();

      // Validar que el nombre no esté vacío
      if (!trimmed) {
        return 'El nombre no puede estar vacío.';
      }

      // Validar que no exista un participante con el mismo nombre (case-insensitive)
      const isDuplicate = state.participants.some(
        (p) => p.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (isDuplicate) {
        return `Ya existe un participante llamado "${trimmed}".`;
      }

      const newParticipant: Participant = {
        id: generateId(),
        name: trimmed,
        createdAt: new Date().toISOString(),
      };

      updateState({
        ...state,
        participants: [...state.participants, newParticipant],
      });

      return null; // éxito
    },
    [state, updateState]
  );

  /**
   * Verifica si un participante puede ser eliminado.
   * No se puede eliminar si está asociado a algún gasto.
   */
  const canRemoveParticipant = useCallback(
    (id: string): boolean => {
      return !state.expenses.some(
        (e) => e.paidBy === id || e.participants.includes(id)
      );
    },
    [state.expenses]
  );

  /**
   * Elimina un participante.
   * Retorna un mensaje de error si no se puede eliminar, o null si fue exitoso.
   */
  const removeParticipant = useCallback(
    (id: string): string | null => {
      if (!canRemoveParticipant(id)) {
        return 'No se puede eliminar un participante que tiene gastos asociados.';
      }

      updateState({
        ...state,
        participants: state.participants.filter((p) => p.id !== id),
      });

      return null; // éxito
    },
    [state, updateState, canRemoveParticipant]
  );

  // ─── Gastos ───────────────────────────────────────────────────────────────

  /**
   * Registra un nuevo gasto.
   * Retorna un mensaje de error si la validación falla, o null si fue exitoso.
   */
  const addExpense = useCallback(
    (data: {
      description: string;
      amount: number;
      currency: Currency;
      paidBy: string;
      participants: string[];
      date: string;
    }): string | null => {
      if (!isCurrency(data.currency)) {
        return 'La moneda es obligatoria.';
      }

      // Validar que el pagador existe en la lista de participantes
      const payerExists = state.participants.some((p) => p.id === data.paidBy);
      if (!payerExists) {
        return 'El participante que realizó el pago no existe.';
      }

      // Validar que todos los participantes del gasto existen
      const allExist = data.participants.every((id) =>
        state.participants.some((p) => p.id === id)
      );
      if (!allExist) {
        return 'Uno o más participantes seleccionados no existen.';
      }

      const newExpense: Expense = {
        id: generateId(),
        ...data,
        createdAt: new Date().toISOString(),
      };

      updateState({
        ...state,
        expenses: [...state.expenses, newExpense],
      });

      return null; // éxito
    },
    [state, updateState]
  );

  const removeExpense = useCallback(
    (id: string) => {
      updateState({
        ...state,
        expenses: state.expenses.filter((e) => e.id !== id),
      });
    },
    [state, updateState]
  );

  /**
   * Actualiza un gasto existente.
   * Retorna un mensaje de error si la validación falla, o null si fue exitoso.
   */
  const updateExpense = useCallback(
    (
      id: string,
      data: {
        description: string;
        amount: number;
        currency: Currency;
        paidBy: string;
        participants: string[];
        date: string;
      }
    ): string | null => {
      if (!isCurrency(data.currency)) {
        return 'La moneda es obligatoria.';
      }

      // Validar que el pagador existe en la lista de participantes
      const payerExists = state.participants.some((p) => p.id === data.paidBy);
      if (!payerExists) {
        return 'El participante que realizó el pago no existe.';
      }

      // Validar que todos los participantes del gasto existen
      const allExist = data.participants.every((pid) =>
        state.participants.some((p) => p.id === pid)
      );
      if (!allExist) {
        return 'Uno o más participantes seleccionados no existen.';
      }

      updateState({
        ...state,
        expenses: state.expenses.map((e) =>
          e.id === id ? { ...e, ...data } : e
        ),
      });

      return null; // éxito
    },
    [state, updateState]
  );

  /**
   * Actualiza las tasas de cambio. Ambos valores deben ser números > 0.
   */
  const updateExchangeRates = useCallback(
    (rates: ExchangeRates): string | null => {
      if (
        typeof rates.usdToBob !== 'number' ||
        typeof rates.usdToUsdt !== 'number' ||
        !Number.isFinite(rates.usdToBob) ||
        !Number.isFinite(rates.usdToUsdt) ||
        rates.usdToBob <= 0 ||
        rates.usdToUsdt <= 0
      ) {
        return 'Las tasas deben ser números mayores que cero.';
      }

      updateState({
        ...state,
        exchangeRates: {
          usdToBob: rates.usdToBob,
          usdToUsdt: rates.usdToUsdt,
        },
      });

      return null;
    },
    [state, updateState]
  );

  /**
   * Marca una transferencia de liquidación como ya realizada.
   * Se identifica por (from, to, amountCents) para comparación exacta.
   * Si ya estaba marcada, no hace nada.
   */
  const markTransferPaid = useCallback(
    (from: string, to: string, amountCents: number) => {
      const alreadyPaid = state.payments.some(
        (p) => p.from === from && p.to === to && p.amountCents === amountCents
      );
      if (alreadyPaid) return;

      const record: PaymentRecord = {
        from,
        to,
        amountCents,
        paidAt: new Date().toISOString(),
      };
      updateState({ ...state, payments: [...state.payments, record] });
    },
    [state, updateState]
  );

  /**
   * Desmarca una transferencia de liquidación (revierte el pago).
   */
  const unmarkTransferPaid = useCallback(
    (from: string, to: string, amountCents: number) => {
      updateState({
        ...state,
        payments: state.payments.filter(
          (p) => !(p.from === from && p.to === to && p.amountCents === amountCents)
        ),
      });
    },
    [state, updateState]
  );

  return {
    state,
    addParticipant,
    removeParticipant,
    canRemoveParticipant,
    addExpense,
    removeExpense,
    updateExpense,
    markTransferPaid,
    unmarkTransferPaid,
    updateExchangeRates,
  };
}
