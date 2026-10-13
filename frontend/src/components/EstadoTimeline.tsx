import { formatoFechaHora } from "../lib/utils";
import type { HistorialEstado } from "../types";

export function EstadoTimeline({ historial }: { historial: HistorialEstado[] }) {
  if (historial.length === 0) {
    return null;
  }

  return (
    <ol className="space-y-3">
      {historial.map((paso, indice) => (
        <li
          key={`${paso.estado_nuevo}-${paso.fecha}-${indice}`}
          className="flex items-start gap-3"
        >
          <span
            aria-hidden
            className="mt-1.5 h-2.5 w-2.5 flex-none rounded-full bg-primary"
          />
          <div>
            <p className="font-medium text-on-surface">{paso.estado_nuevo}</p>
            <p className="text-xs text-on-surface-variant">
              {formatoFechaHora(paso.fecha)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
