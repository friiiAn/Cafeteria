import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../../lib/apiClient";
import { formatoFechaHora, formatoMoneda } from "../../lib/utils";
import type { PedidoDetalle } from "../../types";
import { Card, CardBody, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

const COLOR_ESTADO: Record<string, string> = {
  Pendiente: "bg-status-pending text-white",
  Pagado: "bg-status-paid text-white",
  "En preparación": "bg-status-preparing text-white",
  Listo: "bg-status-ready text-white",
  Entregado: "bg-status-delivered text-white",
  Cancelado: "bg-status-cancelled text-white",
};

export function ConfirmacionPage() {
  const { id } = useParams<{ id: string }>();
  const [pedido, setPedido] = useState<PedidoDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const data = await api.get<PedidoDetalle>(`/pedidos/${id}`);
        if (activo) {
          setPedido(data);
          setError("");
        }
      } catch (err) {
        if (activo) {
          setError(err instanceof ApiError ? err.message : "Error al cargar el pedido");
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }
    void cargar();
    return () => {
      activo = false;
    };
  }, [id, recarga]);

  if (cargando) {
    return <p className="text-sm text-on-surface-variant">Cargando…</p>;
  }

  if (!pedido) {
    return (
      <Card>
        <CardBody className="space-y-3">
          <CardTitle>Pedido no disponible</CardTitle>
          <p className="text-sm font-medium text-danger">{error}</p>
          <Button variante="secondary" onClick={() => setRecarga((n) => n + 1)}>
            Reintentar
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-on-surface">
        Confirmación de pedido
      </h1>

      <Card>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-on-surface-variant">Folio</p>
              <p className="font-mono text-2xl font-bold text-on-surface">
                {pedido.numero}
              </p>
            </div>
            <Badge
              className={COLOR_ESTADO[pedido.estado] ?? "bg-surface-container"}
            >
              {pedido.estado}
            </Badge>
          </div>

          <div className="grid gap-2 text-sm">
            <p className="text-on-surface-variant">
              Recolección:{" "}
              <span className="font-semibold text-on-surface">
                {formatoFechaHora(pedido.fecha_recoleccion)}
              </span>
            </p>
          </div>

          <ul className="divide-y divide-outline-variant">
            {pedido.items.map((item) => (
              <li
                key={item.menu_dia_id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="text-on-surface">
                  {item.cantidad} × {item.nombre}
                </span>
                <span className="font-semibold text-primary">
                  {formatoMoneda(item.subtotal)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between border-t border-outline-variant pt-3">
            <span className="text-sm text-on-surface-variant">Total</span>
            <span className="font-heading text-2xl font-bold text-primary">
              {formatoMoneda(pedido.total)}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/mis-pedidos">
              <Button>Ver mis pedidos</Button>
            </Link>
            <Link to="/menu">
              <Button variante="secondary">Volver al menú</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
