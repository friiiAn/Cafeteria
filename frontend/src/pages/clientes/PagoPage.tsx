import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { api, ApiError } from "../../lib/apiClient";
import { formatoFechaHora, formatoMoneda } from "../../lib/utils";
import type { PedidoDetalle } from "../../types";
import { Card, CardBody, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

export function PagoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [pedido, setPedido] = useState<PedidoDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [pagando, setPagando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [recarga, setRecarga] = useState(0);

  const simularFallo = searchParams.get("demo") === "fail";
  const token = simularFallo ? "tok_fail_demo" : "tok_ok_demo";

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

  async function pagar() {
    setError("");
    setPagando(true);
    try {
      await api.post(`/pedidos/${id}/pagar`, { token_pago: token });
      navigate(`/pedido/${id}/confirmacion`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo procesar el pago");
    } finally {
      setPagando(false);
    }
  }

  async function cancelar() {
    if (!window.confirm("¿Cancelar este pedido?")) {
      return;
    }
    setError("");
    setCancelando(true);
    try {
      await api.post(`/pedidos/${id}/cancelar`);
      navigate("/mis-pedidos");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cancelar el pedido");
    } finally {
      setCancelando(false);
    }
  }

  if (cargando) {
    return <p className="text-sm text-on-surface-variant">Cargando…</p>;
  }

  if (!pedido) {
    return (
      <Card>
        <CardBody className="space-y-3">
          <CardTitle>Pedido no disponible</CardTitle>
          <p className="text-sm font-medium text-danger">{error}</p>
          <div className="flex flex-wrap gap-2">
            <Button variante="secondary" onClick={() => setRecarga((n) => n + 1)}>
              Reintentar
            </Button>
            <Link to="/mis-pedidos">
              <Button variante="ghost">Ver mis pedidos</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    );
  }

  const pagado = pedido.estado === "Pagado";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-on-surface">
          Pagar pedido
        </h1>
        <span className="font-heading text-2xl font-extrabold text-primary">
          {formatoMoneda(pedido.total)}
        </span>
      </div>

      <Card>
        <CardBody className="space-y-3">
          <p className="font-mono text-lg font-semibold text-on-surface">
            {pedido.numero}
          </p>
          <p className="text-sm text-on-surface-variant">
            Recolección: {formatoFechaHora(pedido.fecha_recoleccion)}
          </p>
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
        </CardBody>
      </Card>

      {pagado ? (
        <Card>
          <CardBody className="space-y-3">
            <CardTitle>Este pedido ya está pagado</CardTitle>
            <p className="text-sm text-on-surface-variant">
              Tu pedido está en cola de preparación.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => navigate(`/pedido/${id}/confirmacion`)}>
                Ver confirmación
              </Button>
              <Link to="/mis-pedidos">
                <Button variante="secondary">Mis pedidos</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge className="bg-surface-container text-on-surface-variant">
                {pedido.estado}
              </Badge>
              <p className="text-sm text-on-surface-variant">
                Pago simulado: este proceso no captura datos de tarjeta.
              </p>
            </div>

            {error && (
              <p role="alert" className="text-sm font-medium text-danger">
                {error}
              </p>
            )}

            <Button onClick={pagar} disabled={pagando} className="h-12 w-full">
              {pagando ? "Procesando…" : `Pagar ${formatoMoneda(pedido.total)}`}
            </Button>

            {error && (
              <div className="flex flex-wrap gap-2">
                <Button variante="secondary" onClick={pagar} disabled={pagando}>
                  Reintentar pago
                </Button>
                <Button variante="ghost" onClick={cancelar} disabled={cancelando}>
                  {cancelando ? "Cancelando…" : "Cancelar pedido"}
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
