import { useState, useEffect } from 'react';
import type { Currency, Participant } from '../../models';
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
  participants: Participant[];
  onAdd: (data: ExpenseData) => string | null;
}

/**
 * Formulario para registrar un nuevo gasto.
 * Todos los participantes aparecen seleccionados por defecto.
 * Valida cada campo con mensajes de error inline.
 */
export function AddExpenseForm({ participants, onAdd }: Props) {
  const today = new Date().toISOString().split('T')[0];

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('BOB');
  const [paidBy, setPaidBy] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [date, setDate] = useState(today);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Seleccionar todos los participantes por defecto cuando cambia la lista
  useEffect(() => {
    setSelected(participants.map((p) => p.id));
  }, [participants]);

  const toggleParticipant = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
    // Limpiar error de participantes al interactuar
    if (errors.participants) setErrors((e) => ({ ...e, participants: undefined }));
  };

  const selectAll = () => {
    setSelected(participants.map((p) => p.id));
    setErrors((e) => ({ ...e, participants: undefined }));
  };

  /** Valida todos los campos y retorna true si el formulario es válido */
  const validate = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!description.trim()) {
      newErrors.description = 'La descripción es obligatoria.';
    }

    const parsedAmount = parseFloat(amount);
    if (!amount.trim()) {
      newErrors.amount = 'Ingresa el monto del gasto.';
    } else if (isNaN(parsedAmount)) {
      newErrors.amount = 'El monto debe ser un número válido.';
    } else if (parsedAmount <= 0) {
      newErrors.amount = 'El monto debe ser mayor que cero.';
    }

    if (!currency || !isCurrency(currency)) {
      newErrors.currency = 'Selecciona la moneda del gasto.';
    }

    if (!paidBy) {
      newErrors.paidBy = 'Debes indicar quién realizó el pago.';
    }

    if (selected.length === 0) {
      newErrors.participants = 'Selecciona al menos un participante para dividir el gasto.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    const error = onAdd({
      description: description.trim(),
      amount: parseFloat(amount),
      currency,
      paidBy,
      participants: selected,
      date,
    });

    if (error) {
      setSubmitError(error);
      return;
    }

    // Reset del formulario (mantener todos seleccionados)
    setDescription('');
    setAmount('');
    setCurrency('BOB');
    setPaidBy('');
    setDate(today);
    setSelected(participants.map((p) => p.id));
    setErrors({});
  };

  if (participants.length < 2) {
    return (
      <Card title="💸 Nuevo Gasto">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="text-4xl select-none">💰</div>
          <p className="text-white/70 text-sm font-medium">Faltan participantes</p>
          <p className="text-white/30 text-xs max-w-xs">
            Para registrar un gasto necesitas al menos{' '}
            <strong className="text-white/50">2 participantes</strong>.
            {participants.length === 0
              ? ' Ve a la pestaña Participantes y agrega a las personas del viaje.'
              : ' Agrega una persona más en la pestaña Participantes.'}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="💸 Nuevo Gasto">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>

        {/* Error general del servidor/controller */}
        {submitError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 text-red-300 text-xs">
            ⚠ {submitError}
          </div>
        )}

        {/* Descripción */}
        <div>
          <label className="text-white/60 text-xs font-medium uppercase tracking-wide block mb-1.5">
            Descripción
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors((er) => ({ ...er, description: undefined }));
            }}
            placeholder="Ej: Cena en restaurante..."
            className={`w-full bg-white/10 border rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none transition-colors text-sm ${
              errors.description ? 'border-red-400/70 focus:border-red-400' : 'border-white/20 focus:border-indigo-400'
            }`}
          />
          {errors.description && (
            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <span>⚠</span> {errors.description}
            </p>
          )}
        </div>

        {/* Monto, moneda y fecha */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-white/60 text-xs font-medium uppercase tracking-wide block mb-1.5">
              Monto
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors((er) => ({ ...er, amount: undefined }));
                }}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className={`min-w-0 flex-1 bg-white/10 border rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none transition-colors text-sm ${
                  errors.amount ? 'border-red-400/70 focus:border-red-400' : 'border-white/20 focus:border-indigo-400'
                }`}
              />
              <select
                value={currency}
                onChange={(e) => {
                  if (isCurrency(e.target.value)) setCurrency(e.target.value);
                  if (errors.currency) setErrors((er) => ({ ...er, currency: undefined }));
                }}
                className={`w-[6.5rem] shrink-0 bg-white/10 border rounded-xl px-2 py-2.5 text-white focus:outline-none transition-colors text-sm appearance-none ${
                  errors.currency ? 'border-red-400/70 focus:border-red-400' : 'border-white/20 focus:border-indigo-400'
                }`}
                aria-label="Moneda"
              >
                {CURRENCIES.map((code) => (
                  <option key={code} value={code} className="bg-gray-800">
                    {code} ({CURRENCY_SYMBOLS[code]})
                  </option>
                ))}
              </select>
            </div>
            {errors.amount && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <span>⚠</span> {errors.amount}
              </p>
            )}
            {errors.currency && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <span>⚠</span> {errors.currency}
              </p>
            )}
          </div>
          <div>
            <label className="text-white/60 text-xs font-medium uppercase tracking-wide block mb-1.5">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-indigo-400 transition-colors text-sm"
            />
          </div>
        </div>

        {/* Pagado por */}
        <div>
          <label className="text-white/60 text-xs font-medium uppercase tracking-wide block mb-1.5">
            Pagado por
          </label>
          <select
            value={paidBy}
            onChange={(e) => {
              setPaidBy(e.target.value);
              if (errors.paidBy) setErrors((er) => ({ ...er, paidBy: undefined }));
            }}
            className={`w-full bg-white/10 border rounded-xl px-4 py-2.5 text-white focus:outline-none transition-colors text-sm appearance-none ${
              errors.paidBy ? 'border-red-400/70 focus:border-red-400' : 'border-white/20 focus:border-indigo-400'
            }`}
          >
            <option value="" className="bg-gray-800">Seleccionar participante...</option>
            {participants.map((p) => (
              <option key={p.id} value={p.id} className="bg-gray-800">
                {p.name}
              </option>
            ))}
          </select>
          {errors.paidBy && (
            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
              <span>⚠</span> {errors.paidBy}
            </p>
          )}
        </div>

        {/* Dividir entre */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-white/60 text-xs font-medium uppercase tracking-wide">
              Dividir entre
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={selectAll}
                className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
              >
                Todos
              </button>
              {selected.length > 0 && selected.length < participants.length && (
                <span className="text-white/30 text-xs">
                  {selected.length}/{participants.length}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {participants.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleParticipant(p.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selected.includes(p.id)
                    ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
          {errors.participants && (
            <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
              <span>⚠</span> {errors.participants}
            </p>
          )}
        </div>

        {/* Preview del monto por persona */}
        {amount && parseFloat(amount) > 0 && selected.length > 0 && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-2.5 text-xs text-indigo-300">
            Cada participante pagaría{' '}
            <span className="font-semibold">
              {formatMoney(parseFloat(amount) / selected.length, currency)}
            </span>
            {' '}({selected.length} persona{selected.length !== 1 ? 's' : ''})
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-indigo-500 hover:bg-indigo-400 text-white py-2.5 rounded-xl font-semibold transition-colors text-sm"
        >
          Registrar Gasto
        </button>
      </form>
    </Card>
  );
}
