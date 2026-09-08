export type Currency = 'USD' | 'USDT' | 'BOB';

export interface ExchangeRates {
  usdToBob: number;    // cuántos bolivianos es 1 USD
  usdToUsdt: number;   // cuántos USDT es 1 USD
}

// Modelo principal: representa un participante del viaje
export interface Participant {
  id: string;
  name: string;
  createdAt: string;
}

// Representa un gasto registrado durante el viaje
export interface Expense {
  id: string;
  description: string;
  amount: number;           // Monto total del gasto (en su moneda original)
  currency: Currency;       // Moneda original en la que se registró el gasto
  paidBy: string;           // ID del participante que pagó
  participants: string[];   // IDs de los participantes que comparten el gasto
  date: string;
  createdAt: string;
}

// Representa una deuda: quién le debe a quién y cuánto
export interface Debt {
  from: string;   // ID del participante que debe
  to: string;     // ID del participante al que se le debe
  amount: number;
}

/**
 * Registro de una transferencia ya realizada.
 * Se identifica por (from, to, amountCents) para comparación exacta.
 * amountCents = Math.round(amount * 100) en USD.
 * currency: Moneda real en la que se pagó la transferencia.
 * paidAmount: Monto registrado en esa moneda al momento del pago.
 */
export interface PaymentRecord {
  from: string;          // ID del deudor que realizó el pago
  to: string;            // ID del acreedor que recibió el pago
  amountCents: number;   // Monto en centavos USD de la deuda cancelada
  currency: Currency;    // Moneda real en la que se realizó el pago (USD, USDT, BOB)
  paidAmount: number;    // Monto entregado en esa moneda
  paidAt: string;        // ISO timestamp del momento en que se marcó como pagado
}

// Estado global de la aplicación
export interface AppState {
  participants: Participant[];
  expenses: Expense[];
  payments: PaymentRecord[];   // Transferencias de liquidación ya realizadas
  exchangeRates: ExchangeRates;
}
