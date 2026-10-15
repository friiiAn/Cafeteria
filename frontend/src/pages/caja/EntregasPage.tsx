import { useEffect, useState } from "react";
import { api, ApiError } from "../../lib/apiClient";
import { formatoFechaHora } from "../../lib/utils";
import type { PedidoEntrega } from "../../types";
import { Card, CardBody } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

const INTERVALO_MS = 10000;

export function EntregasPage() {
  const [pedidos, setPedidos] = useState<PedidoEntrega[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [procesando, setProcesando] = useState<number | null>(null);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const data = await api.get<PedidoEntrega[]>("/caja/pedidos");
        if (activo) {
          setPedidos(data);
          setError("");
        }
      } catch (err) {
        if (activo) {
          setError(err instanceof ApiError ? err.message : "Error al cargar las entregas");
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }
    void cargar();
    const timer = window.setInterval(() => void cargar(), INTERVALO_MS);
    return () => {
      activo = false;
      window.clearInterval(timer);
    };
  }, [recarga]);

  async function accion(pedido: PedidoEntrega, verbo: "entregar" | "cancelar"): Promise<void> {
    setError("");
    setAviso("");
    setProcesando(pedido.id);
    try {
      await api.post(`/caja/pedidos/${pedido.id}/${verbo}`);
      setAviso(verbo === "entregar" ? "Pedido entregado." : "Pedido cancelado.");
      setRecarga((n) => n + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar el pedido");
    } finally {
      setProcesando(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-2xl font-bold text-on-surface">
          Pedidos listos
        </h1>
        <Badge className="bg-status-ready text-white">{pedidos.length}</Badge>
      </div>

      {aviso && (
        <p role="status" className="text-sm font-medium text-primary">
          {aviso}
        </p>
      )}

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
        <p className="text-sm text-on-surface-variant">Cargando…</p>
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
              No hay pedidos listos por entregar.
            </p>
          </CardBody>
        </Card>
      ) : (
        <ul className="space-y-3">
          {pedidos.map((pedido) => (
            <li key={pedido.id}>
              <Card>
                <CardBody className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1">
                      <p className="font-mono text-xl font-bold text-on-surface">
                        {pedido.numero}
                      </p>
                      <p className="text-sm text-on-surface-variant">
                        Registrado {formatoFechaHora(pedido.creado_en)} ·{" "}
                        {pedido.cliente_nombre ?? "Sin nombre"}
                      </p>
                    </div>
                    <Badge className="bg-status-ready text-white">Listo</Badge>
                  </div>

                  <ul className="text-sm text-on-surface">
                    {pedido.items.map((item) => (
                      <li key={item.nombre}>
                        <span className="font-bold">{item.cantidad}×</span>{" "}
                        {item.nombre}
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      disabled={procesando === pedido.id}
                      onClick={() => void accion(pedido, "entregar")}
                    >
                      {procesando === pedido.id ? "Guardando…" : "Entregar"}
                    </Button>
                    <Button
                      variante="secondary"
                      disabled={procesando === pedido.id}
                      onClick={() => void accion(pedido, "cancelar")}
                    >
                      Cancelar
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
