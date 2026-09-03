interface Props {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

/**
 * Tarjeta con título y contenido — bloque visual base de la UI
 */
export function Card({ title, children, action }: Props) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}
