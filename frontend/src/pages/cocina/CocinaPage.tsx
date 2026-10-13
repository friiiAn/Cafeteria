import { useEffect, useState } from "react";
import { api, ApiError } from "../../lib/apiClient";
import { cn, formatoFechaHora } from "../../lib/utils";
import type { PedidoCocina } from "../../types";
import { Card, CardBody } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

const INTERVALO_MS = 7000;
const MINUTOS_AVISO = 15;

function minutosRestantes(fecha: string): number {
  const objetivo = new Date(fecha.replace(" ", "T")).getTime();
  return (objetivo - Date.now()) / 60_000;
}

export function CocinaPage() {
  const [pedidos, setPedidos] = useState<PedidoCocina[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState<number | null>(null);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const data = await api.get<PedidoCocina[]>("/cocina/pedidos");
        if (activo) {
          setPedidos(data);
          setError("");
        }
      } catch (err) {
        if (activo) {
          setError(
            err instanceof ApiError ? err.message : "Error al cargar los pedidos",
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
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
  }, [recarga]);

  async function avanzar(pedido: PedidoCocina): Promise<void> {
    const accion = pedido.estado === "Pagado" ? "iniciar" : "listo";
    setProcesando(pedido.id);
    setError("");
    try {
      await api.post(`/cocina/pedidos/${pedido.id}/${accion}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar el pedido");
    } finally {
      setProcesando(null);
      setRecarga((n) => n + 1);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-on-surface">
            Pedidos en cocina
          </h1>
          <p className="text-sm text-on-surface-variant">
            Se actualiza automáticamente cada {INTERVALO_MS / 1000} segundos.
          </p>
        </div>
        <Button variante="secondary" onClick={() => setRecarga((n) => n + 1)}>
          Actualizar
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}

      {cargando ? (
        <p className="text-on-surface-variant">Cargando…</p>
      ) : pedidos.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-on-surface-variant">
              No hay pedidos pagados pendientes de preparación.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {pedidos.map((pedido) => {
            const restantes = minutosRestantes(pedido.fecha_recoleccion);
            const vencido = restantes < 0;
            const proximo = !vencido && restantes <= MINUTOS_AVISO;
            return (
              <Card
                key={pedido.id}
                className={cn(
                  vencido && "border-danger",
                  proximo && "border-tertiary",
                )}
              >
                <CardBody className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-lg font-bold text-on-surface">
                        {pedido.numero}
                      </p>
                      <p className="text-xs font-medium tracking-wide text-on-surface-variant uppercase">
                        {pedido.tipo}
                      </p>
                    </div>
                    <Badge className="bg-primary-container text-on-primary-container">
                      {pedido.estado}
                    </Badge>
                  </div>

                  <p
                    className={cn(
                      "text-sm",
                      vencido
                        ? "font-semibold text-danger"
                        : proximo
                          ? "font-semibold text-tertiary"
                          : "text-on-surface-variant",
                    )}
                  >
                    Recolección: {formatoFechaHora(pedido.fecha_recoleccion)}
                    {vencido
                      ? " · ¡Vencido!"
                      : proximo
                        ? ` · en ${Math.ceil(restantes)} min`
                        : ""}
                  </p>

                  <ul className="divide-y divide-outline-variant rounded-lg border border-outline-variant">
                    {pedido.items.map((item) => (
                      <li key={item.nombre} className="flex items-center gap-2 px-3 py-2">
                        <span className="font-semibold text-on-surface">
                          {item.cantidad}×
                        </span>
                        <span className="text-on-surface">{item.nombre}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className="w-full"
                    disabled={procesando === pedido.id}
                    onClick={() => void avanzar(pedido)}
                  >
                    {procesando === pedido.id
                      ? "Guardando…"
                      : pedido.estado === "Pagado"
                        ? "Iniciar preparación"
                        : "Marcar listo"}
                  </Button>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
