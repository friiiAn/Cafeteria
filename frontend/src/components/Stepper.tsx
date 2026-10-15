import { cn } from "../lib/utils";

interface StepperProps {
  cantidad: number;
  onCambiar: (cantidad: number) => void;
  etiqueta: string;
  min?: number;
  max?: number;
  deshabilitado?: boolean;
  className?: string;
}

export function Stepper({
  cantidad,
  onCambiar,
  etiqueta,
  min = 0,
  max = 99,
  deshabilitado = false,
  className,
}: StepperProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        aria-label={`Quitar uno de ${etiqueta}`}
        disabled={deshabilitado || cantidad <= min}
        onClick={() => onCambiar(cantidad - 1)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-primary text-lg font-semibold text-primary transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        −
      </button>
      <span className="min-w-6 text-center font-semibold">{cantidad}</span>
      <button
        type="button"
        aria-label={`Agregar uno de ${etiqueta}`}
        disabled={deshabilitado || cantidad >= max}
        onClick={() => onCambiar(cantidad + 1)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-primary text-lg font-semibold text-primary transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
