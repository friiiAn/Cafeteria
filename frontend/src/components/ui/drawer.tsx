import { useEffect, type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface DrawerProps {
  abierto: boolean;
  onCerrar: () => void;
  etiqueta: string;
  children: ReactNode;
  className?: string;
}

export function Drawer({ abierto, onCerrar, etiqueta, children, className }: DrawerProps) {
  useEffect(() => {
    if (!abierto) {
      return;
    }
    function alPresionar(evento: KeyboardEvent): void {
      if (evento.key === "Escape") {
        onCerrar();
      }
    }
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [abierto, onCerrar]);

  if (!abierto) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div
        className="absolute inset-0 bg-black/40"
        aria-hidden="true"
        onClick={onCerrar}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={etiqueta}
        className={cn(
          "absolute inset-y-0 left-0 flex w-64 max-w-[80%] flex-col bg-surface-container-lowest shadow-xl",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
