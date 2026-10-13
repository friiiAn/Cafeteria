import { useEffect, useState } from "react";
import { listarNotificaciones, marcarNotificacionLeida } from "../lib/notificaciones";
import { cn, formatoFechaHora } from "../lib/utils";
import type { Notificacion } from "../types";

const INTERVALO_MS = 15000;

export function NotificacionBell() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const data = await listarNotificaciones();
        if (activo) {
          setNotificaciones(data);
        }
      } catch {
        /* silencioso: la campana no debe romper la navegación */
      }
    }
    void cargar();
    const timer = window.setInterval(() => {
      void cargar();
    }, INTERVALO_MS);
    return () => {
      activo = false;
      window.clearInterval(timer);
    };
  }, []);

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  async function leer(notificacion: Notificacion): Promise<void> {
    if (notificacion.leida) {
      return;
    }
    setNotificaciones((previo) =>
      previo.map((n) => (n.id === notificacion.id ? { ...n, leida: true } : n)),
    );
    try {
      await marcarNotificacionLeida(notificacion.id);
    } catch {
      setNotificaciones((previo) =>
        previo.map((n) =>
          n.id === notificacion.id ? { ...n, leida: false } : n,
        ),
      );
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notificaciones"
        aria-expanded={abierto}
        onClick={() => setAbierto((previo) => !previo)}
        className="relative inline-flex h-11 min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm font-medium text-on-surface hover:bg-surface-container"
      >
        Avisos
        {noLeidas > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-xs font-bold text-on-danger">
            {noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div
          role="menu"
          className={cn(
            "absolute right-0 z-20 mt-2 w-72 rounded-xl border border-outline-variant",
            "bg-surface-container-lowest p-2 shadow-lg",
          )}
        >
          {notificaciones.length === 0 ? (
            <p className="px-3 py-2 text-sm text-on-surface-variant">
              No tienes avisos.
            </p>
          ) : (
            <ul className="max-h-80 space-y-1 overflow-y-auto">
              {notificaciones.map((notificacion) => (
                <li key={notificacion.id}>
                  <button
                    type="button"
                    onClick={() => void leer(notificacion)}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-left text-sm",
                      notificacion.leida
                        ? "text-on-surface-variant"
                        : "bg-primary-container/40 font-medium text-on-surface",
                    )}
                  >
                    <span className="block">{notificacion.mensaje}</span>
                    <span className="block text-xs text-on-surface-variant">
                      {formatoFechaHora(notificacion.creado_en)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
