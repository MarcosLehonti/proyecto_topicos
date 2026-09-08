import { useEffect, useState } from 'react';
import type { ExchangeRates } from '../../models';

interface Props {
  rates: ExchangeRates;
  onUpdate: (rates: ExchangeRates) => string | null;
}

/**
 * Panel compacto para ver y editar las tasas de cambio.
 * Los valores se persisten vía el controller (localStorage).
 */
export function ExchangeRatesPanel({ rates, onUpdate }: Props) {
  const [usdToBob, setUsdToBob] = useState(String(rates.usdToBob));
  const [usdToUsdt, setUsdToUsdt] = useState(String(rates.usdToUsdt));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setUsdToBob(String(rates.usdToBob));
    setUsdToUsdt(String(rates.usdToUsdt));
  }, [rates.usdToBob, rates.usdToUsdt]);

  const handleSave = () => {
    const bob = parseFloat(usdToBob);
    const usdt = parseFloat(usdToUsdt);
    const message = onUpdate({ usdToBob: bob, usdToUsdt: usdt });
    if (message) {
      setError(message);
      setSaved(false);
      return;
    }
    setError(null);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-3">
      <div className="flex flex-wrap items-end gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
        <span className="text-white/50 text-xs font-medium uppercase tracking-wide pb-1.5">
          Tasas
        </span>

        <div className="flex-1 min-w-[140px]">
          <label className="text-white/40 text-[10px] uppercase tracking-wide block mb-1">
            Bs. por 1 USD
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={usdToBob}
            onChange={(e) => {
              setUsdToBob(e.target.value);
              setError(null);
              setSaved(false);
            }}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-white text-sm focus:outline-none focus:border-indigo-400"
          />
        </div>

        <div className="flex-1 min-w-[140px]">
          <label className="text-white/40 text-[10px] uppercase tracking-wide block mb-1">
            USDT por 1 USD
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={usdToUsdt}
            onChange={(e) => {
              setUsdToUsdt(e.target.value);
              setError(null);
              setSaved(false);
            }}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5 text-white text-sm focus:outline-none focus:border-indigo-400"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        >
          Guardar
        </button>
      </div>
      {error && (
        <p className="text-red-400 text-xs mt-1.5 px-1">⚠ {error}</p>
      )}
      {saved && !error && (
        <p className="text-emerald-400 text-xs mt-1.5 px-1">Tasas guardadas</p>
      )}
    </div>
  );
}
