import type { Expense, Participant, PaymentRecord, ExchangeRates } from '../../models';
import { calculateDebts, formatAmount } from '../../services/calculations';
import { fromUsdCents } from '../../services/currency';
import { Card } from './Card';

interface Props {
  expenses: Expense[];
  participants: Participant[];
  payments: PaymentRecord[];
  exchangeRates: ExchangeRates;
  onMarkPaid: (from: string, to: string, amountCents: number) => void;
  onUnmarkPaid: (from: string, to: string, amountCents: number) => void;
}

/**
 * Panel de liquidación con seguimiento de pagos realizados.
 *
 * Cada transferencia calculada puede marcarse individualmente como "Pagado".
 * Cuando todas las transferencias están marcadas, muestra el estado
 * "¡Liquidación completa!".
 *
 * Muestra cada transferencia principalmente en USD con equivalentes en USDT y BOB.
 * Un pago se identifica por (from, to, amountCents) para comparación exacta.
 * Los pagos persisten en localStorage a través del AppState.
 */
export function SettlementPanel({
  expenses,
  participants,
  payments,
  exchangeRates,
  onMarkPaid,
  onUnmarkPaid,
}: Props) {
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
  // Las deudas pendientes se calculan descontando los pagos ya realizados
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
  }: {
    from: string;
    to: string;
    cents: number;
    isPaid: boolean;
    index: number;
  }) => {
    const usdtVal = fromUsdCents(cents, 'USDT', exchangeRates);
    const bobVal = fromUsdCents(cents, 'BOB', exchangeRates);

    return (
      <li
        className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
          isPaid
            ? 'bg-emerald-500/5 border border-emerald-500/20 opacity-60'
            : 'bg-white/5 hover:bg-white/[0.08]'
        }`}
      >
        <span className="text-white/20 text-xs font-mono w-4 text-right flex-shrink-0">
          {index + 1}.
        </span>

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

        <div className="flex items-center gap-1.5 min-w-0 flex-1">
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
            onClick={() => onMarkPaid(from, to, cents)}
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
  );
}
