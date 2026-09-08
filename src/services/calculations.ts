import type { Expense, Participant, PaymentRecord, Debt, ExchangeRates } from '../models';
import { toUsdCents } from './currency';

/**
 * Distribuye `usdCents` entre los participantes de forma exacta y determinista.
 *
 *   - base = floor(usdCents / n)
 *   - remainder = usdCents % n
 *   - cada id en participantIds asume `base`.
 *   - `remainder` siempre se le asume al que pagó (`paidBy`).
 *   - La suma total de partes === usdCents.
 * Retorna un Map con lo que le corresponde a cada participante.
 */
function distributeSharesForPayer(
  usdCents: number,
  participantIds: string[],
  paidBy: string
): Map<string, number> {
  const n = participantIds.length;
  const base = Math.floor(usdCents / n);
  const remainder = usdCents % n;

  const shares = new Map<string, number>();
  
  // Asignar base a todos los que comparten
  for (const id of participantIds) {
    shares.set(id, base);
  }

  // Sumar el remanente al que pagó
  shares.set(paidBy, (shares.get(paidBy) ?? 0) + remainder);

  return shares;
}

/**
 * Calcula el balance neto por participante.
 * Opera íntegramente en centavos USD; convierte a dólares al retornar.
 *
 * Retorna: participantId → balance en USD (positivo: le deben, negativo: debe)
 * Garantía: Σ balances = 0 exactamente.
 */
export function calculateBalances(
  expenses: Expense[],
  participants: Participant[],
  exchangeRates: ExchangeRates
): Map<string, number> {
  const cents = new Map<string, number>();
  participants.forEach((p) => cents.set(p.id, 0));

  expenses.forEach((expense) => {
    const usdCents = toUsdCents(expense.amount, expense.currency, exchangeRates);
    const shares = distributeSharesForPayer(usdCents, expense.participants, expense.paidBy);

    // Acreditar al pagador el total exacto
    cents.set(expense.paidBy, (cents.get(expense.paidBy) ?? 0) + usdCents);

    // Debitar a cada participante su parte exacta (posiblemente distinta en 1 centavo)
    shares.forEach((share, participantId) => {
      cents.set(participantId, (cents.get(participantId) ?? 0) - share);
    });
  });

  // Convertir centavos USD → dólares al final (una única división, sin acumulación de error)
  const result = new Map<string, number>();
  cents.forEach((c, id) => result.set(id, c / 100));
  return result;
}

/**
 * Resultado detallado de saldo por participante (valores en dólares)
 */
export interface ParticipantBalance {
  totalPaid: number;       // Suma pagada como pagador de gastos
  totalOwed: number;       // Parte proporcional en gastos
  balance: number;         // totalPaid - totalOwed (original, sin liquidaciones)
  settledOut: number;      // Monto ya pagado a través de transferencias de liquidación
  settledIn: number;       // Monto ya recibido a través de transferencias de liquidación
  adjustedBalance: number; // balance + settledOut - settledIn (balance efectivo real)
}

/**
 * Calcula el desglose completo de saldos usando aritmética entera (centavos de USD).
 *
 * Si se pasan `paidTransfers`, los aplica como ajuste sobre el balance.
 * PaymentRecord.amountCents pasa a interpretarse como centavos USD a partir de ahora.
 *   - Para el deudor (from): adjustedBalance += amountCents   (pagó, reduce su deuda)
 *   - Para el acreedor (to): adjustedBalance -= amountCents   (recibió, reduce su crédito)
 *
 * Garantías:
 *   - Para cada gasto: Σ partes de participantes = monto original (sin perder ni crear dinero).
 *   - Σ balances de todos los participantes = 0 exactamente.
 *   - Σ adjustedBalances = 0 también (los pagos de liquidación conservan la suma cero).
 */
export function calculateDetailedBalances(
  expenses: Expense[],
  participants: Participant[],
  exchangeRates: ExchangeRates,
  paidTransfers?: PaymentRecord[]
): Map<string, ParticipantBalance> {
  // Acumuladores en centavos USD durante todo el cálculo
  const paidCents     = new Map<string, number>();
  const owedCents     = new Map<string, number>();
  const settledOutC   = new Map<string, number>();
  const settledInC    = new Map<string, number>();
  participants.forEach((p) => {
    paidCents.set(p.id, 0);
    owedCents.set(p.id, 0);
    settledOutC.set(p.id, 0);
    settledInC.set(p.id, 0);
  });

  expenses.forEach((expense) => {
    const usdCents = toUsdCents(expense.amount, expense.currency, exchangeRates);
    const shares = distributeSharesForPayer(usdCents, expense.participants, expense.paidBy);

    // Acreditar al pagador
    paidCents.set(expense.paidBy, (paidCents.get(expense.paidBy) ?? 0) + usdCents);

    // Debitar a cada participante su parte exacta
    shares.forEach((share, participantId) => {
      owedCents.set(participantId, (owedCents.get(participantId) ?? 0) + share);
    });
  });

  // Aplicar pagos de liquidación ya realizados
  if (paidTransfers) {
    paidTransfers.forEach((payment) => {
      settledOutC.set(payment.from, (settledOutC.get(payment.from) ?? 0) + payment.amountCents);
      settledInC.set(payment.to,   (settledInC.get(payment.to)   ?? 0) + payment.amountCents);
    });
  }

  // Convertir centavos USD → dólares al final y calcular balances
  const result = new Map<string, ParticipantBalance>();
  participants.forEach((p) => {
    const paid    = paidCents.get(p.id)   ?? 0;
    const owed    = owedCents.get(p.id)   ?? 0;
    const sOut    = settledOutC.get(p.id) ?? 0;
    const sIn     = settledInC.get(p.id)  ?? 0;
    const balC    = paid - owed;
    result.set(p.id, {
      totalPaid:       paid  / 100,
      totalOwed:       owed  / 100,
      balance:         balC  / 100,
      settledOut:      sOut  / 100,
      settledIn:       sIn   / 100,
      adjustedBalance: (balC + sOut - sIn) / 100,
    });
  });

  return result;
}

/**
 * A partir de los balances, calcula la lista mínima de transacciones
 * para saldar todas las deudas (algoritmo greedy).
 * Opera en centavos para comparaciones y restas exactas.
 */
export function calculateDebts(
  expenses: Expense[],
  participants: Participant[],
  exchangeRates: ExchangeRates,
  payments?: PaymentRecord[]
): Debt[] {
  const detailed = calculateDetailedBalances(expenses, participants, exchangeRates, payments);
  const debts: Debt[] = [];

  // Ordenar de mayor a menor para minimizar el número de transferencias
  // Usamos el adjustedBalance convertido a centavos para operar exactamente
  const debtors = participants
    .filter((p) => (detailed.get(p.id)?.adjustedBalance ?? 0) < -0.005)
    .map((p) => ({ id: p.id, cents: Math.round(Math.abs(detailed.get(p.id)?.adjustedBalance ?? 0) * 100) }))
    .sort((a, b) => b.cents - a.cents);

  const creditors = participants
    .filter((p) => (detailed.get(p.id)?.adjustedBalance ?? 0) > 0.005)
    .map((p) => ({ id: p.id, cents: Math.round((detailed.get(p.id)?.adjustedBalance ?? 0) * 100) }))
    .sort((a, b) => b.cents - a.cents);

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor   = debtors[i];
    const creditor = creditors[j];
    const paymentCents = Math.min(debtor.cents, creditor.cents);

    debts.push({
      from:   debtor.id,
      to:     creditor.id,
      amount: paymentCents / 100,   // Exacto: entero / 100
    });

    debtor.cents   -= paymentCents;
    creditor.cents -= paymentCents;

    // Comparaciones exactas en centavos enteros (sin tolerancia de punto flotante)
    if (debtor.cents   === 0) i++;
    if (creditor.cents === 0) j++;
  }

  return debts;
}

/**
 * Formatea un número como moneda (sin símbolo, 2 decimales)
 */
export function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Genera un ID único simple
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
