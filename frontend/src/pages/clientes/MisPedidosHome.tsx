import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../../lib/apiClient";
import { formatoFechaHora, formatoMoneda } from "../../lib/utils";
import type { PedidoResumen } from "../../types";
import { Card, CardBody, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

const COLOR_ESTADO: Record<string, string> = {
  Pendiente: "bg-secondary-container text-on-secondary-container",
  Pagado: "bg-primary-container text-on-primary-container",
  "En preparación": "bg-tertiary-container text-on-tertiary-container",
  Listo: "bg-tertiary-container text-on-tertiary-container",
  Entregado: "bg-surface-container text-on-surface-variant",
  Cancelado: "bg-danger/15 text-danger",
};

export function MisPedidosHome() {
  const [pedidos, setPedidos] = useState<PedidoResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const data = await api.get<PedidoResumen[]>("/pedidos");
        if (activo) {
          setPedidos(data);
        }
      } catch (err) {
        if (activo) {
          setError(
            err instanceof ApiError ? err.message : "Error al cargar tus pedidos",
          );
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
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-on-surface">
        Mis pedidos
      </h1>

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
            <CardTitle>Aún no tienes pedidos</CardTitle>
            <p className="mt-2 text-on-surface-variant">
              Cuando hagas un pedido anticipado aparecerá aquí.
            </p>
            <Link to="/menu" className="mt-4 inline-block font-medium text-primary">
              Ver el menú
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {pedidos.map((pedido) => (
            <Card key={pedido.id}>
              <CardBody className="flex flex-wrap items-center gap-3">
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
                <Link
                  to={`/pago/${pedido.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {pedido.estado === "Pendiente" ? "Pagar" : "Ver detalle"}
                </Link>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
