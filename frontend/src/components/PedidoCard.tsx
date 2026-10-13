import { useState } from "react";
import { api, ApiError } from "../lib/apiClient";
import { cn, formatoFechaHora, formatoMoneda } from "../lib/utils";
import type { PedidoDetalle, PedidoResumen } from "../types";
import { Card, CardBody } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { EstadoTimeline } from "./EstadoTimeline";

const COLOR_ESTADO: Record<string, string> = {
  Pendiente: "bg-secondary-container text-on-secondary-container",
  Pagado: "bg-primary-container text-on-primary-container",
  "En preparación": "bg-tertiary-container text-on-tertiary-container",
  Listo: "bg-tertiary-container text-on-tertiary-container",
  Entregado: "bg-surface-container text-on-surface-variant",
  Cancelado: "bg-danger-container text-on-danger-container",
};

export function PedidoCard({
  pedido,
  onPagar,
}: {
  pedido: PedidoResumen;
  onPagar: (id: number) => void;
}) {
  const [detalle, setDetalle] = useState<PedidoDetalle | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState("");

  async function alternarDetalle(): Promise<void> {
    if (abierto) {
      setAbierto(false);
      return;
    }
    setError("");
    if (!detalle) {
      try {
        setDetalle(await api.get<PedidoDetalle>(`/pedidos/${pedido.id}`));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "No se pudo cargar el detalle");
        return;
      }
    }
    setAbierto(true);
  }

  return (
    <Card className={cn(pedido.estado === "Listo" && "border-tertiary")}>
      <CardBody className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1">
            <p className="font-semibold text-on-surface">{pedido.numero}</p>
            <p className="text-sm text-on-surface-variant">
              Recolección: {formatoFechaHora(pedido.fecha_recoleccion)}
            </p>
          </div>
          <Badge className={COLOR_ESTADO[pedido.estado] ?? COLOR_ESTADO.Entregado}>
            {pedido.estado}
          </Badge>
          <span className="font-semibold text-primary">
            {formatoMoneda(pedido.total)}
          </span>
        </div>

        {pedido.estado === "Listo" && (
          <p className="rounded-lg bg-tertiary-container px-3 py-2 text-sm font-medium text-on-tertiary-container">
            ¡Tu pedido está listo para recoger!
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {pedido.estado === "Pendiente" && (
            <Button onClick={() => onPagar(pedido.id)}>Pagar</Button>
          )}
          <Button variante="secondary" onClick={() => void alternarDetalle()}>
            {abierto ? "Ocultar detalle" : "Ver detalle"}
          </Button>
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-danger">
            {error}
          </p>
        )}

        {abierto && detalle && (
          <div className="space-y-4 border-t border-outline-variant pt-3">
            <ul className="divide-y divide-outline-variant">
              {detalle.items.map((item) => (
                <li
                  key={item.menu_dia_id}
                  className="flex items-center justify-between py-2 text-sm"
                >
                  <span className="text-on-surface">
                    {item.cantidad} × {item.nombre}
                  </span>
                  <span className="font-medium text-on-surface-variant">
                    {formatoMoneda(item.subtotal)}
                  </span>
                </li>
              ))}
            </ul>
            <div>
              <p className="mb-2 text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
                Seguimiento
              </p>
              <EstadoTimeline historial={detalle.historial} />
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
