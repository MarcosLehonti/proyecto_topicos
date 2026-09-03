import { useState } from 'react';
import type { Participant } from '../../models';
import { Card } from './Card';

interface Props {
  participants: Participant[];
  onAdd: (name: string) => string | null;
  onRemove: (id: string) => string | null;
  canRemove: (id: string) => boolean;
}

/**
 * Panel para gestionar participantes del viaje.
 * Incluye validación de nombre vacío, duplicados y bloqueo si hay gastos asociados.
 */
export function ParticipantsPanel({ participants, onAdd, onRemove, canRemove }: Props) {
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRemoveError(null);

    const error = onAdd(inputValue);
    if (error) {
      setInputError(error);
    } else {
      setInputError(null);
      setInputValue('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // Limpiar error al escribir
    if (inputError) setInputError(null);
  };

  const handleRemove = (id: string) => {
    setInputError(null);
    const participant = participants.find((p) => p.id === id);
    const error = onRemove(id);
    if (error) {
      // Mensaje amigable con el nombre del participante
      setRemoveError(
        participant
          ? `${participant.name} tiene gastos registrados y no puede eliminarse. Elimina primero los gastos en los que participa.`
          : error
      );
      setTimeout(() => setRemoveError(null), 5000);
    }
  };

  return (
    <Card title="👥 Participantes">
      {/* Formulario para agregar */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Nombre del participante..."
            className={`flex-1 bg-white/10 border rounded-xl px-4 py-2 text-white placeholder-white/40 focus:outline-none transition-colors text-sm ${
              inputError
                ? 'border-red-400/70 focus:border-red-400'
                : 'border-white/20 focus:border-indigo-400'
            }`}
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="bg-indigo-500 hover:bg-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl font-medium transition-colors text-sm whitespace-nowrap"
          >
            Agregar
          </button>
        </div>

        {/* Error de validación del input */}
        {inputError && (
          <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
            <span>⚠</span> {inputError}
          </p>
        )}
      </form>

      {/* Error de eliminación */}
      {removeError && (
        <div className="mb-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 text-red-300 text-xs flex items-start gap-2">
          <span className="flex-shrink-0 mt-0.5">🔒</span>
          <span>{removeError}</span>
        </div>
      )}

      {/* Lista de participantes */}
      {participants.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <div className="text-4xl select-none">👤</div>
          <p className="text-white/70 text-sm font-medium">Sin participantes todavía</p>
          <p className="text-white/30 text-xs max-w-xs">
            Escribe el nombre de cada persona del viaje y haz clic en <strong className="text-white/50">Agregar</strong>.
            Necesitas al menos 2 para registrar gastos.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {participants.map((p) => {
            const deletable = canRemove(p.id);
            return (
              <li
                key={p.id}
                className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-2.5 group hover:bg-white/8 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center text-indigo-300 font-semibold text-sm flex-shrink-0">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white text-sm font-medium">{p.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Badge de gastos asociados */}
                  {!deletable && (
                    <span className="text-white/30 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      con gastos
                    </span>
                  )}

                  {/* Botón eliminar */}
                  <button
                    onClick={() => handleRemove(p.id)}
                    disabled={!deletable}
                    className={`text-lg leading-none transition-all opacity-0 group-hover:opacity-100 ${
                      deletable
                        ? 'text-white/30 hover:text-red-400 cursor-pointer'
                        : 'text-white/15 cursor-not-allowed'
                    }`}
                    title={
                      deletable
                        ? 'Eliminar participante'
                        : 'No se puede eliminar: tiene gastos asociados'
                    }
                  >
                    {deletable ? '×' : '🔒'}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Contador */}
      {participants.length > 0 && (
        <p className="text-white/30 text-xs mt-3 text-right">
          {participants.length} participante{participants.length !== 1 ? 's' : ''}
        </p>
      )}
    </Card>
  );
}
