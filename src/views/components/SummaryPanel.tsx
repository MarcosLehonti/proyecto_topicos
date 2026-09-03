import type { Expense, Participant, PaymentRecord } from '../../models';
import {
  calculateDetailedBalances,
  formatAmount,
} from '../../services/calculations';
import { Card } from './Card';

interface Props {
  expenses: Expense[];
  participants: Participant[];
  payments: PaymentRecord[];
}

/**
 * Panel de resumen: desglose de saldos por participante.
 *
 * Muestra para cada participante:
 *   - Total pagado en gastos del grupo
 *   - Total que le corresponde asumir
 *   - Balance bruto (de gastos)
 *   - Si hay pagos de liquidación marcados: indicador de lo liquidado y el balance ajustado
 *
 * El "balance ajustado" es el saldo real una vez descontadas las transferencias
 * de liquidación ya realizadas. Cuando es 0 → a mano real.
 */
export function SummaryPanel({ expenses, participants, payments }: Props) {
  if (participants.length === 0) {
    return (
      <Card title="📊 Saldos">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="text-4xl select-none">👥</div>
          <p className="text-white/70 text-sm font-medium">Sin participantes</p>
          <p className="text-white/30 text-xs max-w-xs">
            Primero agrega a las personas del viaje en la pestaña{' '}
            <strong className="text-white/50">Participantes</strong>.
          </p>
        </div>
      </Card>
    );
  }

  if (expenses.length === 0) {
    return (
      <Card title="📊 Saldos">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="text-4xl select-none">📊</div>
          <p className="text-white/70 text-sm font-medium">Sin gastos registrados</p>
          <p className="text-white/30 text-xs max-w-xs">
            Registra al menos un gasto en la pestaña{' '}
            <strong className="text-white/50">Gastos</strong> para ver los saldos.
          </p>
        </div>
      </Card>
    );
  }

  // Calcular detalle incluyendo los pagos de liquidación ya realizados
  const detailed = calculateDetailedBalances(expenses, participants, payments);
  const hasPayments = payments.length > 0;

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Suma de todos los balances ajustados: siempre es 0
  const adjustedSum = [...detailed.values()].reduce(
    (acc, e) => acc + e.adjustedBalance,
    0
  );

  return (
    <Card title="📊 Saldos">

      {/* ── Total gastado ── */}
      <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-xl p-4 mb-5 text-center">
        <div className="text-white/60 text-xs uppercase tracking-wide mb-1">Total gastado</div>
        <div className="text-white text-2xl font-bold">Bs. {formatAmount(totalSpent)}</div>
      </div>

      {/* ── Aviso cuando hay pagos de liquidación ── */}
      {hasPayments && (
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 mb-4">
          <span className="text-emerald-400 text-sm">💰</span>
          <span className="text-emerald-300 text-xs">
            Balances actualizados con los pagos de liquidación ya realizados.
          </span>
        </div>
      )}

      {/* ── Tabla de saldos ── */}
      <div className="mb-5">
        <h3 className="text-white/60 text-xs font-medium uppercase tracking-wide mb-3">
          Saldos individuales
        </h3>

        {/* Encabezados */}
        <div className={`grid gap-1 px-3 mb-1 ${hasPayments ? 'grid-cols-5' : 'grid-cols-4'}`}>
          <span className="text-white/30 text-xs">Participante</span>
          <span className="text-white/30 text-xs text-right">Pagó</span>
          <span className="text-white/30 text-xs text-right">Corresponde</span>
          {hasPayments && (
            <span className="text-white/30 text-xs text-right">Liquidó</span>
          )}
          <span className="text-white/30 text-xs text-right">Balance</span>
        </div>

        {/* Filas por participante */}
        <div className="space-y-1.5">
          {participants.map((p) => {
            const entry = detailed.get(p.id) ?? {
              totalPaid: 0, totalOwed: 0, balance: 0,
              settledOut: 0, settledIn: 0, adjustedBalance: 0,
            };

            // Usamos el balance ajustado (con liquidaciones) para el color
            const adj     = entry.adjustedBalance;
            const isPos   = adj > 0.005;
            const isNeg   = adj < -0.005;
            const isEven  = !isPos && !isNeg;

            // El participante tiene alguna liquidación registrada
            const hasSettlement = entry.settledOut > 0.005 || entry.settledIn > 0.005;

            return (
              <div
                key={p.id}
                className={`grid gap-1 items-center rounded-xl px-3 py-2.5 transition-colors ${
                  hasPayments ? 'grid-cols-5' : 'grid-cols-4'
                } ${
                  isEven && hasSettlement
                    ? 'bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15'
                    : 'bg-white/5 hover:bg-white/[0.08]'
                }`}
              >
                {/* Nombre */}
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0 ${
                      isEven && hasSettlement
                        ? 'bg-emerald-500/30 text-emerald-300'
                        : 'bg-indigo-500/30 text-indigo-300'
                    }`}
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white text-xs font-medium truncate">{p.name}</span>
                </div>

                {/* Total pagó (gastos) */}
                <span className="text-white/70 text-xs text-right">
                  {formatAmount(entry.totalPaid)}
                </span>

                {/* Total le corresponde */}
                <span className="text-white/70 text-xs text-right">
                  {formatAmount(entry.totalOwed)}
                </span>

                {/* Liquidó (solo si hay pagos en curso) */}
                {hasPayments && (
                  <span className="text-xs text-right">
                    {entry.settledOut > 0.005 ? (
                      <span className="text-emerald-400 font-medium">
                        ↑ {formatAmount(entry.settledOut)}
                      </span>
                    ) : entry.settledIn > 0.005 ? (
                      <span className="text-indigo-300 font-medium">
                        ↓ {formatAmount(entry.settledIn)}
                      </span>
                    ) : (
                      <span className="text-white/20">—</span>
                    )}
                  </span>
                )}

                {/* Balance ajustado */}
                <span
                  className={`text-xs font-bold text-right ${
                    isPos   ? 'text-emerald-400' :
                    isNeg   ? 'text-red-400' :
                    isEven && hasSettlement ? 'text-emerald-400' :
                    'text-white/40'
                  }`}
                >
                  {isPos ? '+' : ''}
                  {formatAmount(adj)}
                  {isEven && hasSettlement && (
                    <span className="ml-1 text-emerald-400 font-normal">✓</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Fila de suma total de balances ajustados */}
        <div className={`grid gap-1 items-center mt-2 pt-2 border-t border-white/10 px-3 ${
          hasPayments ? 'grid-cols-5' : 'grid-cols-4'
        }`}>
          <span className={`text-white/40 text-xs text-right ${hasPayments ? 'col-span-4' : 'col-span-3'}`}>
            {hasPayments ? 'Suma de balances ajustados' : 'Suma de balances'}
          </span>
          <span
            className={`text-xs font-bold text-right ${
              Math.abs(adjustedSum) < 0.01 ? 'text-emerald-400' : 'text-yellow-400'
            }`}
          >
            {Math.abs(adjustedSum) < 0.01 ? 'Bs. 0.00' : `Bs. ${formatAmount(adjustedSum)}`}
          </span>
        </div>
      </div>

      {/* ── Leyenda de colores ── */}
      <div className="flex flex-wrap gap-4 text-xs text-white/30 px-1">
        <span><span className="text-emerald-400 font-semibold">+</span> le deben</span>
        <span><span className="text-red-400 font-semibold">−</span> debe</span>
        <span><span className="text-white/40 font-semibold">0</span> a mano</span>
        {hasPayments && (
          <>
            <span><span className="text-emerald-400">↑</span> liquidó (pagó)</span>
            <span><span className="text-indigo-300">↓</span> liquidó (recibió)</span>
          </>
        )}
      </div>
    </Card>
  );
}
