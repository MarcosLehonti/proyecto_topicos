import { useState } from 'react';
import { useAppController } from './controllers/useAppController';
import { ParticipantsPanel } from './views/components/ParticipantsPanel';
import { AddExpenseForm } from './views/components/AddExpenseForm';
import { ExpenseList } from './views/components/ExpenseList';
import { SummaryPanel } from './views/components/SummaryPanel';
import { SettlementPanel } from './views/components/SettlementPanel';

type Tab = 'participantes' | 'gastos' | 'saldos' | 'liquidacion';

interface TabDef {
  id: Tab;
  label: string;
  icon: string;
}

const TABS: TabDef[] = [
  { id: 'participantes', label: 'Participantes', icon: '👥' },
  { id: 'gastos',        label: 'Gastos',        icon: '💸' },
  { id: 'saldos',        label: 'Saldos',        icon: '📊' },
  { id: 'liquidacion',   label: 'Liquidación',   icon: '💰' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('participantes');

  const {
    state,
    addParticipant,
    removeParticipant,
    canRemoveParticipant,
    addExpense,
    removeExpense,
    updateExpense,
    markTransferPaid,
    unmarkTransferPaid,
  } = useAppController();

  const hasParticipants = state.participants.length > 0;
  const hasExpenses     = state.expenses.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-900 text-white">

      {/* ── Header + Tab bar (sticky) ───────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-gray-950/80 backdrop-blur-sm border-b border-white/10">

        {/* Título */}
        <div className="max-w-4xl mx-auto px-4 pt-4 pb-3 flex items-center gap-3">
          <span className="text-2xl select-none">✈️</span>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-tight">
              Cuentas Claras
            </h1>
            <p className="text-white/40 text-xs">Divide gastos de viaje sin drama</p>
          </div>

          {/* Contador rápido */}
          <div className="ml-auto flex items-center gap-2 text-xs text-white/40">
            {hasParticipants && (
              <span className="bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
                {state.participants.length} participante{state.participants.length !== 1 ? 's' : ''}
              </span>
            )}
            {hasExpenses && (
              <span className="bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
                {state.expenses.length} gasto{state.expenses.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Pestañas */}
        <nav
          className="max-w-4xl mx-auto px-4 flex overflow-x-auto scrollbar-hide"
          aria-label="Navegación principal"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;

            // Badge numérico por pestaña
            let badge: number | null = null;
            if (tab.id === 'participantes' && hasParticipants) badge = state.participants.length;
            if (tab.id === 'gastos'        && hasExpenses)     badge = state.expenses.length;

            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium
                  whitespace-nowrap transition-colors duration-150 border-b-2
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
                  ${isActive
                    ? 'border-indigo-400 text-white'
                    : 'border-transparent text-white/40 hover:text-white/70 hover:border-white/20'}
                `}
              >
                <span className="text-base leading-none">{tab.icon}</span>
                <span>{tab.label}</span>
                {badge !== null && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full font-semibold transition-colors ${
                      isActive
                        ? 'bg-indigo-500/30 text-indigo-300'
                        : 'bg-white/10 text-white/40'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* ── Contenido por pestaña ───────────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* PARTICIPANTES */}
        {activeTab === 'participantes' && (
          <div className="max-w-md mx-auto">
            <ParticipantsPanel
              participants={state.participants}
              onAdd={addParticipant}
              onRemove={removeParticipant}
              canRemove={canRemoveParticipant}
            />
          </div>
        )}

        {/* GASTOS */}
        {activeTab === 'gastos' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <AddExpenseForm
              participants={state.participants}
              onAdd={addExpense}
            />
            <ExpenseList
              expenses={state.expenses}
              participants={state.participants}
              onRemove={removeExpense}
              onUpdate={updateExpense}
            />
          </div>
        )}

        {/* SALDOS */}
        {activeTab === 'saldos' && (
          <div className="max-w-xl mx-auto">
            <SummaryPanel
              expenses={state.expenses}
              participants={state.participants}
              payments={state.payments}
            />
          </div>
        )}

        {/* LIQUIDACIÓN */}
        {activeTab === 'liquidacion' && (
          <div className="max-w-xl mx-auto">
            <SettlementPanel
              expenses={state.expenses}
              participants={state.participants}
              payments={state.payments}
              onMarkPaid={markTransferPaid}
              onUnmarkPaid={unmarkTransferPaid}
            />
          </div>
        )}

      </main>
    </div>
  );
}
