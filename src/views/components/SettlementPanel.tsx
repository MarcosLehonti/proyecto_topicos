import { useState } from 'react';
import type { Expense, Participant, PaymentRecord, ExchangeRates, Currency } from '../../models';
import { calculateDebts, formatAmount } from '../../services/calculations';
import { fromUsdCents, formatMoney, CURRENCY_LABELS, CURRENCY_SYMBOLS } from '../../services/currency';
import { Card } from './Card';

interface Props {
  expenses: Expense[];
  participants: Participant[];
  payments: PaymentRecord[];
  exchangeRates: ExchangeRates;
  onMarkPaid: (from: string, to: string, amountCents: number, currency: Currency) => void;
  onUnmarkPaid: (from: string, to: string, amountCents: number) => void;
}

/**
 * Panel de liquidación con seguimiento de pagos realizados y registro multimoneda.
 *
 * Cada transferencia calculada puede marcarse como "Pagada" eligiendo la moneda
 * real en la que se entregó el dinero (USD, USDT o BOB).
 * Cuando todas las transferencias están marcadas, muestra el estado
 * "¡Liquidación completa!".
 *
 * Muestra cada transferencia principalmente en USD con equivalentes en USDT y BOB.
 * En el historial completado se muestra la moneda y el monto real registrado en ese pago.
 * Un pago se identifica por (from, to, amountCents) para comparación exacta.
 */
export function SettlementPanel({
  expenses,
  participants,
  payments,
  exchangeRates,
  onMarkPaid,
  onUnmarkPaid,
}: Props) {
  // ── Estado del modal para registrar pago con moneda ─────────────────────────
  const [payingTransfer, setPayingTransfer] = useState<{
    from: string;
    to: string;
    cents: number;
  } | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [currencyError, setCurrencyError] = useState<string | null>(null);

  const openPayModal = (from: string, to: string, cents: number) => {
    setPayingTransfer({ from, to, cents });
    setSelectedCurrency(null);
    setCurrencyError(null);
  };

  const closePayModal = () => {
    setPayingTransfer(null);
    setSelectedCurrency(null);
    setCurrencyError(null);
  };

  const handleConfirmPayment = () => {
    if (!payingTransfer) return;
    if (!selectedCurrency) {
      setCurrencyError('Elige la moneda en la que se realizó el pago.');
      return;
    }
    onMarkPaid(payingTransfer.from, payingTransfer.to, payingTransfer.cents, selectedCurrency);
    closePayModal();
  };

  // ── Estados vacíos ────────────────────────────────────────────────────────
  if (participants.length === 0) {
    return (
      <Card title="💰 Liquidación">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="text-4xl select-none">👥</div>
          <p className="text-white/70 text-sm font-medium">Sin participantes</p>
          <p className="text-white/30 text-xs max-w-xs">
            Agrega a las personas del viaje en la pestaña{' '}
            <strong className="text-white/50">Participantes</strong> para comenzar.
          </p>
        </div>
      </Card>
    );
  }

  if (expenses.length === 0) {
    return (
      <Card title="💰 Liquidación">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="text-4xl select-none">💸</div>
          <p className="text-white/70 text-sm font-medium">Sin gastos registrados</p>
          <p className="text-white/30 text-xs max-w-xs">
            Cuando registres gastos en la pestaña{' '}
            <strong className="text-white/50">Gastos</strong>, aquí verás qué
            transferencias hay que hacer para quedar todos a mano.
          </p>
        </div>
      </Card>
    );
  }

  // ── Cálculo de deudas y estado de pagos ───────────────────────────────────
  // Las deudas pendientes se calculan descontando los pagos ya realizados en USD
  const pendingDebts = calculateDebts(expenses, participants, exchangeRates, payments);
  
  const getParticipantName = (id: string) =>
    participants.find((p) => p.id === id)?.name ?? 'Desconocido';

  // Si no hay deudas pendientes, pero hay gastos, significa que todo está pagado
  const allPaid = pendingDebts.length === 0 && expenses.length > 0;
  
  // Total pendiente a transferir
  const pendingCents = pendingDebts.reduce((s, d) => s + Math.round(d.amount * 100), 0);
  
  // Total ya pagado
  const paidCents = payments.reduce((s, p) => s + p.amountCents, 0);

  // Componente para renderizar una fila de transferencia
  const TransferRow = ({
    from,
    to,
    cents,
    isPaid,
    index,
    payment,
  }: {
    from: string;
    to: string;
    cents: number;
    isPaid: boolean;
    index: number;
    payment?: PaymentRecord;
  }) => {
    const usdtVal = fromUsdCents(cents, 'USDT', exchangeRates);
    const bobVal = fromUsdCents(cents, 'BOB', exchangeRates);

    return (
      <li
        className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
          isPaid
            ? 'bg-emerald-500/5 border border-emerald-500/20 opacity-75'
            : 'bg-white/5 hover:bg-white/[0.08]'
        }`}
      >
        <span className="text-white/20 text-xs font-mono w-4 text-right flex-shrink-0">
          {index + 1}.
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center gap-1.5 min-w-0">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0 ${
                  isPaid
                    ? 'bg-white/10 text-white/40'
                    : 'bg-red-500/20 border border-red-500/30 text-red-300'
                }`}
              >
                {getParticipantName(from).charAt(0).toUpperCase()}
              </div>
              <span
                className={`font-medium text-sm truncate ${
                  isPaid ? 'text-white/40 line-through' : 'text-red-300'
                }`}
              >
                {getParticipantName(from)}
              </span>
            </div>

            <span className="text-white/20 text-sm flex-shrink-0">→</span>

            <div className="flex items-center gap-1.5 min-w-0">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0 ${
                  isPaid
                    ? 'bg-white/10 text-white/40'
                    : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
                }`}
              >
                {getParticipantName(to).charAt(0).toUpperCase()}
              </div>
              <span
                className={`font-medium text-sm truncate ${
                  isPaid ? 'text-white/40 line-through' : 'text-emerald-300'
                }`}
              >
                {getParticipantName(to)}
              </span>
            </div>
          </div>

          {/* Historial de pago: moneda y monto real en que se pagó */}
          {payment && (
            <div className="mt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                Pagado en {formatMoney(payment.paidAmount, payment.currency)}
              </span>
            </div>
          )}
        </div>

        {/* Monto principal en USD y secundarios en USDT y BOB */}
        <div className="flex flex-col items-end flex-shrink-0 text-right">
          <span
            className={`font-bold text-sm whitespace-nowrap ${
              isPaid ? 'text-white/30 line-through' : 'text-white'
            }`}
          >
            $ {formatAmount(cents / 100)}
          </span>
          <span
            className={`text-xs whitespace-nowrap ${
              isPaid ? 'text-white/20 line-through' : 'text-white/40'
            }`}
          >
            USDT {formatAmount(usdtVal)} · Bs. {formatAmount(bobVal)}
          </span>
        </div>

        {isPaid ? (
          <button
            onClick={() => onUnmarkPaid(from, to, cents)}
            title="Revertir pago"
            className="ml-1 flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 transition-all"
          >
            ✓
          </button>
        ) : (
          <button
            onClick={() => openPayModal(from, to, cents)}
            title="Marcar como pagado"
            className="ml-1 flex-shrink-0 w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:text-emerald-400 transition-all text-sm"
          >
            ○
          </button>
        )}
      </li>
    );
  };

  return (
    <>
      <Card title="💰 Liquidación">
        
        {/* ¡Liquidación completa! */}
        {allPaid && (
          <div className="flex flex-col items-center gap-4 py-8 text-center mb-4">
            <div className="text-5xl select-none animate-bounce">🎉</div>
            <div>
              <p className="text-emerald-400 font-bold text-lg">
                ¡Liquidación completa!
              </p>
              <p className="text-white/40 text-sm mt-1">
                Todas las transferencias han sido realizadas.
                <br />
                Todos los participantes están a mano.
              </p>
            </div>
          </div>
        )}

        {/* Transferencias pendientes */}
        {!allPaid && (
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-500/30">
                {pendingDebts.length} transferencia{pendingDebts.length !== 1 ? 's' : ''} pendiente{pendingDebts.length !== 1 ? 's' : ''}
              </span>
            </div>

            <ol className="space-y-2 mb-5">
              {pendingDebts.map((debt, i) => (
                <TransferRow
                  key={`pending-${i}`}
                  from={debt.from}
                  to={debt.to}
                  cents={Math.round(debt.amount * 100)}
                  isPaid={false}
                  index={i}
                />
              ))}
            </ol>
            
            <div className="border-t border-white/10 pt-4 mb-8">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/40">Pendiente a transferir</span>
                <div className="flex flex-col items-end text-right">
                  <span className="text-white font-bold text-indigo-300">
                    $ {formatAmount(pendingCents / 100)}
                  </span>
                  <span className="text-xs text-white/40">
                    USDT {formatAmount(fromUsdCents(pendingCents, 'USDT', exchangeRates))} · Bs. {formatAmount(fromUsdCents(pendingCents, 'BOB', exchangeRates))}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Transferencias ya realizadas */}
        {payments.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <span className="text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10">
                {payments.length} transferencia{payments.length !== 1 ? 's' : ''} completada{payments.length !== 1 ? 's' : ''}
              </span>
            </div>
            <ol className="space-y-2 mb-5">
              {payments.map((p, i) => (
                <TransferRow
                  key={`paid-${i}`}
                  from={p.from}
                  to={p.to}
                  cents={p.amountCents}
                  isPaid={true}
                  index={i}
                  payment={p}
                />
              ))}
            </ol>
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/40">Total liquidado</span>
                <div className="flex flex-col items-end text-right">
                  <span className="text-white font-bold text-emerald-400">
                    $ {formatAmount(paidCents / 100)}
                  </span>
                  <span className="text-xs text-white/40">
                    USDT {formatAmount(fromUsdCents(paidCents, 'USDT', exchangeRates))} · Bs. {formatAmount(fromUsdCents(paidCents, 'BOB', exchangeRates))}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

      </Card>

      {/* ── Modal de selección de moneda para marcar pago ── */}
      {payingTransfer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={closePayModal}
        >
          <div
            className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-white font-bold text-base">Registrar pago de liquidación</h2>
              <p className="text-white/40 text-xs mt-1">
                ¿En qué moneda se realizó esta transferencia?
              </p>
            </div>

            {/* Resumen de la transferencia */}
            <div className="bg-white/5 rounded-xl px-4 py-3 space-y-1">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Transferencia</span>
                <span className="font-semibold text-white">
                  {getParticipantName(payingTransfer.from)} → {getParticipantName(payingTransfer.to)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Deuda cancelada en USD</span>
                <span className="font-bold text-indigo-300">
                  $ {formatAmount(payingTransfer.cents / 100)}
                </span>
              </div>
            </div>

            {/* Selector de moneda */}
            <div>
              <label className="text-white/60 text-xs font-medium uppercase tracking-wide block mb-2">
                Moneda de pago
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['USD', 'USDT', 'BOB'] as Currency[]).map((cur) => {
                  const isSel = selectedCurrency === cur;
                  return (
                    <button
                      key={cur}
                      type="button"
                      onClick={() => {
                        setSelectedCurrency(cur);
                        setCurrencyError(null);
                      }}
                      className={`py-2 px-2 rounded-xl text-center border transition-all ${
                        isSel
                          ? 'bg-indigo-500 text-white border-indigo-400 shadow-md shadow-indigo-500/25'
                          : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-bold text-sm leading-tight">{CURRENCY_SYMBOLS[cur]}</div>
                      <div className="text-[10px] text-white/60 font-medium mt-0.5">{CURRENCY_LABELS[cur]}</div>
                    </button>
                  );
                })}
              </div>
              {currencyError && (
                <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                  <span>⚠</span> {currencyError}
                </p>
              )}
            </div>

            {/* Preview del monto equivalente */}
            {selectedCurrency && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-xs text-emerald-300">
                Se registrará como:{' '}
                <strong className="text-white font-bold">
                  {formatMoney(
                    fromUsdCents(payingTransfer.cents, selectedCurrency, exchangeRates),
                    selectedCurrency
                  )}
                </strong>
              </div>
            )}

            {/* Acciones */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white py-2.5 rounded-xl font-semibold transition-colors text-sm"
              >
                Confirmar pago
              </button>
              <button
                type="button"
                onClick={closePayModal}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white/70 py-2.5 rounded-xl font-semibold transition-colors text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
