import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../../lib/apiClient";
import { formatoFechaHora, formatoMoneda } from "../../lib/utils";
import type { PagoConfirmado, PedidoDetalle } from "../../types";
import { Card, CardBody, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";

export function PagoPage() {
  const { id } = useParams<{ id: string }>();
  const [pedido, setPedido] = useState<PedidoDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [token, setToken] = useState("tok_ok_demo");
  const [pagando, setPagando] = useState(false);
  const [pago, setPago] = useState<PagoConfirmado | null>(null);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const data = await api.get<PedidoDetalle>(`/pedidos/${id}`);
        if (activo) {
          setPedido(data);
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
  }, [id]);

  async function pagar() {
    setError("");
    setPagando(true);
    try {
      const resultado = await api.post<PagoConfirmado>(`/pedidos/${id}/pagar`, {
        token_pago: token,
      });
      setPago(resultado);
      setPedido((previo) =>
        previo ? { ...previo, estado: resultado.estado } : previo,
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo procesar el pago");
    } finally {
      setPagando(false);
    }
  }

  if (cargando) {
    return <p className="text-on-surface-variant">Cargando…</p>;
  }

  if (!pedido) {
    return (
      <Card>
        <CardBody>
          <CardTitle>Pedido no disponible</CardTitle>
          <p className="mt-2 text-sm font-medium text-danger">{error}</p>
          <Link to="/mis-pedidos" className="mt-4 inline-block">
            <Button variante="secondary">Ver mis pedidos</Button>
          </Link>
        </CardBody>
      </Card>
    );
  }

  const pagado = pedido.estado === "Pagado";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-on-surface">
          Pedido {pedido.numero}
        </h1>
        <Badge className="bg-primary-container text-on-primary-container">
          {pedido.estado}
        </Badge>
      </div>

      <Card>
        <CardBody className="space-y-3">
          <p className="text-sm text-on-surface-variant">
            Recolección: {formatoFechaHora(pedido.fecha_recoleccion)}
          </p>
          <ul className="divide-y divide-outline-variant">
            {pedido.items.map((item) => (
              <li
                key={item.menu_dia_id}
                className="flex items-center justify-between py-2"
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
            <span className="font-display text-xl font-bold text-primary">
              {formatoMoneda(pedido.total)}
            </span>
          </div>
        </CardBody>
      </Card>

      {pago || pagado ? (
        <Card>
          <CardBody className="space-y-2">
            <CardTitle>Pago confirmado</CardTitle>
            <p className="text-on-surface-variant">
              Referencia: {pago?.pago.referencia ?? "—"}
            </p>
            <p className="text-sm text-on-surface-variant">
              Tu pedido está pagado y en cola de preparación.
            </p>
            <Link to="/mis-pedidos" className="mt-2 inline-block">
              <Button>Ver mis pedidos</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="space-y-4">
            <CardTitle>Pago en línea</CardTitle>
            <p className="text-sm text-on-surface-variant">
              Pago simulado de desarrollo. Usa <code>tok_ok_demo</code> para
              aprobar o <code>tok_fail_demo</code> para simular un rechazo.
            </p>
            <div>
              <Label htmlFor="token-pago">Token de pago</Label>
              <Input
                id="token-pago"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className="mt-1"
              />
            </div>
            {error && (
              <p role="alert" className="text-sm font-medium text-danger">
                {error}
              </p>
            )}
            <Button onClick={pagar} disabled={pagando} className="w-full">
              {pagando ? "Procesando…" : `Pagar ${formatoMoneda(pedido.total)}`}
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
