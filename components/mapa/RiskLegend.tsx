export function RiskLegend() {
  return (
    <div className="absolute bottom-4 right-4 z-10 space-y-1.5 rounded-lg border border-border bg-card/90 p-3 text-xs shadow-lg backdrop-blur-sm">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Nivel de riesgo</p>
      {[
        { color: 'bg-emerald-500', label: 'Verde — Sin riesgo' },
        { color: 'bg-amber-500', label: 'Amarillo — Precaución' },
        { color: 'bg-red-500', label: 'Rojo — Veda / Alto riesgo' },
        { color: 'bg-sky-400', label: 'Azul — Tu centro' },
      ].map(({ color, label }) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
          <span className="text-foreground/80">{label}</span>
        </div>
      ))}
    </div>
  )
}
