export function RiskLegend() {
  return (
    <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-md p-3 text-xs space-y-1.5">
      <p className="font-semibold text-gray-700 mb-2">Nivel de riesgo</p>
      {[
        { color: 'bg-green-500', label: 'Verde — Sin riesgo' },
        { color: 'bg-yellow-500', label: 'Amarillo — Precaución' },
        { color: 'bg-red-500', label: 'Rojo — Veda / Alto riesgo' },
        { color: 'bg-blue-500', label: 'Azul — Tu centro' },
      ].map(({ color, label }) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <span className="text-gray-700">{label}</span>
        </div>
      ))}
    </div>
  )
}
