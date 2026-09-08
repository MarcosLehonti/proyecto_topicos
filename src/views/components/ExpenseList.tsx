import { useState, useEffect } from 'react';
import type { Currency, Expense, Participant } from '../../models';
import { CURRENCIES, CURRENCY_SYMBOLS, formatMoney, isCurrency } from '../../services/currency';
import { Card } from './Card';

interface ExpenseData {
  description: string;
  amount: number;
  currency: Currency;
  paidBy: string;
  participants: string[];
  date: string;
}

interface FieldErrors {
  description?: string;
  amount?: string;
  currency?: string;
  paidBy?: string;
  participants?: string;
}

interface Props {
  expenses: Expense[];
  participants: Participant[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, data: ExpenseData) => string | null;
}

/**
 * Lista de gastos registrados.
 * Cada gasto tiene botones de editar (modal inline) y eliminar (con confirmación).
 */
export function ExpenseList({ expenses, participants, onRemove, onUpdate }: Props) {
  const getParticipantName = (id: string) =>
    participants.find((p) => p.id === id)?.name ?? 'Desconocido';

  const totalsByCurrency = expenses.reduce<Record<Currency, number>>(
    (acc, e) => {
      acc[e.currency] = (acc[e.currency] ?? 0) + e.amount;
      return acc;
    },
    { USD: 0, USDT: 0, BOB: 0 }
  );
  const currenciesWithTotal = CURRENCIES.filter((c) => totalsByCurrency[c] > 0);
  const hasMixedCurrencies = currenciesWithTotal.length > 1;

  // ── Estado de edición ─────────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCurrency, setEditCurrency] = useState<Currency>('BOB');
  const [editPaidBy, setEditPaidBy] = useState('');
  const [editSelected, setEditSelected] = useState<string[]>([]);
  const [editDate, setEditDate] = useState('');
  const [editErrors, setEditErrors] = useState<FieldErrors>({});
  const [editSubmitError, setEditSubmitError] = useState<string | null>(null);

  // ── Estado de confirmación de eliminación ─────────────────────────────────
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Al abrir el editor se precarga la información del gasto seleccionado
  const openEditor = (expense: Expense) => {
    setEditingId(expense.id);
    setEditDescription(expense.description);
    setEditAmount(String(expense.amount));
    setEditCurrency(expense.currency);
    setEditPaidBy(expense.paidBy);
    setEditSelected([...expense.participants]);
    setEditDate(expense.date);
    setEditErrors({});
    setEditSubmitError(null);
  };

  const closeEditor = () => {
    setEditingId(null);
    setEditErrors({});
    setEditSubmitError(null);
  };

  // Si los participantes cambian mientras el editor está abierto,
  // eliminamos del array los IDs que ya no existen
  useEffect(() => {
    if (editingId) {
      const validIds = participants.map((p) => p.id);
      setEditSelected((prev) => prev.filter((id) => validIds.includes(id)));
    }
  }, [participants, editingId]);

  const toggleEditParticipant = (id: string) => {
    setEditSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
    if (editErrors.participants) setEditErrors((e) => ({ ...e, participants: undefined }));
  };

  const selectAllEdit = () => {
    setEditSelected(participants.map((p) => p.id));
    setEditErrors((e) => ({ ...e, participants: undefined }));
  };

  const validateEdit = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!editDescription.trim()) {
      newErrors.description = 'La descripción es obligatoria.';
    }

    const parsed = parseFloat(editAmount);
    if (!editAmount) {
      newErrors.amount = 'El monto es obligatorio.';
    } else if (isNaN(parsed) || parsed <= 0) {
      newErrors.amount = 'El monto debe ser mayor que cero.';
    }

    if (!editCurrency || !isCurrency(editCurrency)) {
      newErrors.currency = 'Selecciona la moneda del gasto.';
    }

    if (!editPaidBy) {
      newErrors.paidBy = 'Debes indicar quién realizó el pago.';
    }

    if (editSelected.length === 0) {
      newErrors.participants = 'Selecciona al menos un participante.';
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditSubmitError(null);

    if (!validateEdit() || !editingId) return;

    const error = onUpdate(editingId, {
      description: editDescription.trim(),
      amount: parseFloat(editAmount),
      currency: editCurrency,
      paidBy: editPaidBy,
      participants: editSelected,
      date: editDate,
    });

    if (error) {
      setEditSubmitError(error);
      return;
    }

    closeEditor();
  };

  // ── Confirmación de eliminación ───────────────────────────────────────────
  const handleDeleteConfirm = () => {
    if (confirmDeleteId) {
      onRemove(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Card title={`🧾 Gastos (${expenses.length})`}>
        {expenses.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="text-4xl select-none">🧾</div>
            <p className="text-white/70 text-sm font-medium">Sin gastos todavía</p>
            <p className="text-white/30 text-xs max-w-xs">
              Usa el formulario de arriba para registrar el primer gasto del viaje.
            </p>
          </div>
        ) : (
          <>
            <ul className="space-y-2">
              {[...expenses].reverse().map((expense) => {
                const sharePerPerson = expense.amount / expense.participants.length;
                const isEditing = editingId === expense.id;

                return (
                  <li
                    key={expense.id}
                    className="bg-white/5 rounded-xl overflow-hidden group hover:bg-white/[0.08] transition-colors"
                  >
                    {/* ── Vista normal del gasto ── */}
                    {!isEditing && (
                      <div className="p-4 flex items-start justify-between gap-3">
                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          {/* Fila superior: descripción + monto */}
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-white font-semibold text-sm truncate">
                              {expense.description}
                            </span>
                            <span className="text-indigo-300 font-bold text-sm whitespace-nowrap flex-shrink-0">
                              {formatMoney(expense.amount, expense.currency)}
                            </span>
                          </div>

                          {/* Fila media: quién pagó + fecha */}
                          <div className="flex items-center gap-1.5 text-xs mb-1.5">
                            <span className="text-white/40">Pagó</span>
                            <span className="text-white/75 font-medium">
                              {getParticipantName(expense.paidBy)}
                            </span>
                            <span className="text-white/20">·</span>
                            <span className="text-white/40">{expense.date}</span>
                          </div>

                          {/* Fila inferior: participantes + parte por persona */}
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-white/40">Entre:</span>
                            <span className="text-white/60">
                              {expense.participants.map(getParticipantName).join(', ')}
                            </span>
                            {expense.participants.length > 1 && (
                              <>
                                <span className="text-white/20">·</span>
                                <span className="text-white/40">
                                  {formatMoney(sharePerPerson, expense.currency)} c/u
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Botones editar / eliminar */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
                          <button
                            onClick={() => openEditor(expense)}
                            className="text-white/30 hover:text-indigo-400 transition-colors text-sm px-1.5 py-0.5 rounded"
                            title="Editar gasto"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(expense.id)}
                            className="text-white/20 hover:text-red-400 transition-colors text-xl leading-none px-1"
                            title="Eliminar gasto"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── Formulario de edición inline ── */}
                    {isEditing && (
                      <form
                        onSubmit={handleEditSubmit}
                        className="p-4 space-y-3 border border-indigo-500/40 rounded-xl bg-indigo-950/30"
                        noValidate
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-indigo-300 text-xs font-semibold uppercase tracking-wide">
                            ✏️ Editando gasto
                          </span>
                          <button
                            type="button"
                            onClick={closeEditor}
                            className="text-white/30 hover:text-white/70 transition-colors text-xl leading-none"
                            title="Cancelar edición"
                          >
                            ×
                          </button>
                        </div>

                        {/* Error del controller */}
                        {editSubmitError && (
                          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2 text-red-300 text-xs">
                            ⚠ {editSubmitError}
                          </div>
                        )}

                        {/* Descripción */}
                        <div>
                          <label className="text-white/60 text-xs font-medium uppercase tracking-wide block mb-1">
                            Descripción
                          </label>
                          <input
                            type="text"
                            value={editDescription}
                            onChange={(e) => {
                              setEditDescription(e.target.value);
                              if (editErrors.description)
                                setEditErrors((er) => ({ ...er, description: undefined }));
                            }}
                            className={`w-full bg-white/10 border rounded-xl px-4 py-2 text-white placeholder-white/40 focus:outline-none transition-colors text-sm ${
                              editErrors.description
                                ? 'border-red-400/70 focus:border-red-400'
                                : 'border-white/20 focus:border-indigo-400'
                            }`}
                          />
                          {editErrors.description && (
                            <p className="text-red-400 text-xs mt-1">⚠ {editErrors.description}</p>
                          )}
                        </div>

                        {/* Monto, moneda y fecha */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-white/60 text-xs font-medium uppercase tracking-wide block mb-1">
                              Monto
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={editAmount}
                                onChange={(e) => {
                                  setEditAmount(e.target.value);
                                  if (editErrors.amount)
                                    setEditErrors((er) => ({ ...er, amount: undefined }));
                                }}
                                min="0.01"
                                step="0.01"
                                className={`min-w-0 flex-1 bg-white/10 border rounded-xl px-4 py-2 text-white focus:outline-none transition-colors text-sm ${
                                  editErrors.amount
                                    ? 'border-red-400/70 focus:border-red-400'
                                    : 'border-white/20 focus:border-indigo-400'
                                }`}
                              />
                              <select
                                value={editCurrency}
                                onChange={(e) => {
                                  if (isCurrency(e.target.value)) setEditCurrency(e.target.value);
                                  if (editErrors.currency)
                                    setEditErrors((er) => ({ ...er, currency: undefined }));
                                }}
                                className={`w-[6.5rem] shrink-0 bg-gray-900 border rounded-xl px-2 py-2 text-white focus:outline-none transition-colors text-sm appearance-none ${
                                  editErrors.currency
                                    ? 'border-red-400/70 focus:border-red-400'
                                    : 'border-white/20 focus:border-indigo-400'
                                }`}
                                aria-label="Moneda"
                              >
                                {CURRENCIES.map((code) => (
                                  <option key={code} value={code} className="bg-gray-900">
                                    {code} ({CURRENCY_SYMBOLS[code]})
                                  </option>
                                ))}
                              </select>
                            </div>
                            {editErrors.amount && (
                              <p className="text-red-400 text-xs mt-1">⚠ {editErrors.amount}</p>
                            )}
                            {editErrors.currency && (
                              <p className="text-red-400 text-xs mt-1">⚠ {editErrors.currency}</p>
                            )}
                          </div>
                          <div>
                            <label className="text-white/60 text-xs font-medium uppercase tracking-wide block mb-1">
                              Fecha
                            </label>
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-400 transition-colors text-sm"
                            />
                          </div>
                        </div>

                        {/* Pagado por */}
                        <div>
                          <label className="text-white/60 text-xs font-medium uppercase tracking-wide block mb-1">
                            Pagado por
                          </label>
                          <select
                            value={editPaidBy}
                            onChange={(e) => {
                              setEditPaidBy(e.target.value);
                              if (editErrors.paidBy)
                                setEditErrors((er) => ({ ...er, paidBy: undefined }));
                            }}
                            className={`w-full bg-gray-900 border rounded-xl px-4 py-2 text-white focus:outline-none transition-colors text-sm appearance-none ${
                              editErrors.paidBy
                                ? 'border-red-400/70 focus:border-red-400'
                                : 'border-white/20 focus:border-indigo-400'
                            }`}
                          >
                            <option value="" className="bg-gray-900">Seleccionar...</option>
                            {participants.map((p) => (
                              <option key={p.id} value={p.id} className="bg-gray-900">
                                {p.name}
                              </option>
                            ))}
                          </select>
                          {editErrors.paidBy && (
                            <p className="text-red-400 text-xs mt-1">⚠ {editErrors.paidBy}</p>
                          )}
                        </div>

                        {/* Dividir entre */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-white/60 text-xs font-medium uppercase tracking-wide">
                              Dividir entre
                            </label>
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={selectAllEdit}
                                className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
                              >
                                Todos
                              </button>
                              {editSelected.length > 0 && editSelected.length < participants.length && (
                                <span className="text-white/30 text-xs">
                                  {editSelected.length}/{participants.length}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {participants.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => toggleEditParticipant(p.id)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                  editSelected.includes(p.id)
                                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                                }`}
                              >
                                {p.name}
                              </button>
                            ))}
                          </div>
                          {editErrors.participants && (
                            <p className="text-red-400 text-xs mt-1">⚠ {editErrors.participants}</p>
                          )}
                        </div>

                        {/* Preview monto por persona */}
                        {editAmount && parseFloat(editAmount) > 0 && editSelected.length > 0 && (
                          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-2 text-xs text-indigo-300">
                            Cada participante pagaría{' '}
                            <span className="font-semibold">
                              {formatMoney(parseFloat(editAmount) / editSelected.length, editCurrency)}
                            </span>{' '}
                            ({editSelected.length} persona{editSelected.length !== 1 ? 's' : ''})
                          </div>
                        )}

                        {/* Acciones */}
                        <div className="flex gap-2 pt-1">
                          <button
                            type="submit"
                            className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white py-2 rounded-xl font-semibold transition-colors text-sm"
                          >
                            Guardar cambios
                          </button>
                          <button
                            type="button"
                            onClick={closeEditor}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/70 rounded-xl font-medium transition-colors text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Totales por moneda (no se mezclan hasta la conversión a USD) */}
            <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
              <div className="flex items-start justify-between text-sm gap-3">
                <span className="text-white/40">
                  {hasMixedCurrencies ? 'Totales por moneda' : 'Total registrado'}
                </span>
                <div className="text-right space-y-0.5">
                  {currenciesWithTotal.map((code) => (
                    <div key={code} className="text-white font-bold">
                      {formatMoney(totalsByCurrency[code], code)}
                    </div>
                  ))}
                </div>
              </div>
              {hasMixedCurrencies && (
                <p className="text-white/30 text-xs">
                  El total unificado en USD llegará en la siguiente iteración.
                </p>
              )}
            </div>
          </>
        )}
      </Card>

      {/* ── Diálogo de confirmación de eliminación ── */}
      {confirmDeleteId && (() => {
        const expense = expenses.find((e) => e.id === confirmDeleteId);
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setConfirmDeleteId(null)}
          >
            <div
              className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-white font-bold text-base mb-1">¿Eliminar este gasto?</h2>

              {/* Detalle del gasto a eliminar */}
              {expense && (
                <div className="bg-white/5 rounded-xl px-4 py-3 my-3">
                  <p className="text-white text-sm font-semibold truncate">{expense.description}</p>
                  <p className="text-indigo-300 text-xs mt-0.5">
                    {formatMoney(expense.amount, expense.currency)}
                  </p>
                </div>
              )}

              <p className="text-white/40 text-xs mb-5">
                Esta acción no puede deshacerse. Los saldos se recalcularán automáticamente.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 bg-red-500 hover:bg-red-400 text-white py-2.5 rounded-xl font-semibold transition-colors text-sm"
                >
                  Sí, eliminar
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white/70 py-2.5 rounded-xl font-semibold transition-colors text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
