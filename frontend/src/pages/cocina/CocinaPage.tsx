import { useEffect, useState } from "react";
import { api, ApiError } from "../../lib/apiClient";
import type { PedidoCocina } from "../../types";
import { Card, CardBody } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PedidoCocinaCard } from "../../components/PedidoCocinaCard";

const INTERVALO_MS = 4000;
const FALLOS_PARA_OFFLINE = 2;

export function CocinaPage() {
  const [pedidos, setPedidos] = useState<PedidoCocina[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState<number | null>(null);
  const [recarga, setRecarga] = useState(0);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<number | null>(null);
  const [fallos, setFallos] = useState(0);
  const [, setTick] = useState(0);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const data = await api.get<PedidoCocina[]>("/cocina/pedidos");
        if (activo) {
          setPedidos(data);
          setError("");
          setFallos(0);
          setUltimaActualizacion(Date.now());
        }
      } catch (err) {
        if (activo) {
          setError(
            err instanceof ApiError ? err.message : "Error al cargar los pedidos",
          );
          setFallos((n) => n + 1);
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
    const reloj = window.setInterval(() => {
      setTick((n) => n + 1);
    }, 1000);
    return () => {
      activo = false;
      window.clearInterval(timer);
      window.clearInterval(reloj);
    };
  }, [recarga]);

  async function avanzar(pedido: PedidoCocina): Promise<void> {
    const accion = pedido.estado === "Pagado" ? "iniciar" : "listo";
    setProcesando(pedido.id);
    setError("");
    try {
      await api.post(`/cocina/pedidos/${pedido.id}/${accion}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo actualizar el pedido",
      );
    } finally {
      setProcesando(null);
      setRecarga((n) => n + 1);
    }
  }

  const sinConexion = fallos >= FALLOS_PARA_OFFLINE;
  const [ahora] = useState(() => Date.now());
  const segundos = ultimaActualizacion
    ? Math.max(0, Math.floor((ahora - ultimaActualizacion) / 1000))
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-on-surface">
            Cocina
          </h1>
          <p className="flex flex-wrap items-center gap-x-2 text-sm text-on-surface-variant">
            <span className="inline-flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full bg-primary"
                aria-hidden="true"
              />
              {pedidos.length} {pedidos.length === 1 ? "pedido" : "pedidos"}
            </span>
            <span aria-hidden="true">·</span>
            {sinConexion ? (
              <span className="font-semibold text-danger">
                Sin conexión — reintentando…
              </span>
            ) : (
              <span>
                act. {segundos === null ? "…" : `hace ${segundos} s`}
              </span>
            )}
          </p>
        </div>
        <Button variante="secondary" onClick={() => setRecarga((n) => n + 1)}>
          Actualizar
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-danger bg-danger-container px-4 py-3"
        >
          <p className="text-sm font-medium text-on-danger-container">{error}</p>
          <Button
            variante="secondary"
            className="h-9 min-h-0 px-4 text-sm"
            onClick={() => setRecarga((n) => n + 1)}
          >
            Reintentar
          </Button>
        </div>
      )}

      {cargando ? (
        <p className="text-sm text-on-surface-variant">Cargando pedidos…</p>
      ) : pedidos.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-2 py-12 text-center">
            <span aria-hidden="true" className="text-4xl">
              ✓
            </span>
            <p className="font-heading text-lg font-bold text-on-surface">
              ¡Todo está al día!
            </p>
            <p className="text-sm text-on-surface-variant">
              No hay pedidos en cocina. Los pedidos pagados aparecen aquí solos.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pedidos.map((pedido) => (
            <PedidoCocinaCard
              key={pedido.id}
              pedido={pedido}
              ahora={ahora}
              ocupado={procesando === pedido.id}
              onAvanzar={(p) => void avanzar(p)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
