import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../../lib/apiClient";
import { formatoMoneda } from "../../lib/utils";
import type { PagoConfirmado, PedidoDetalle } from "../../types";
import { Card, CardBody, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

export function CobroPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState<PedidoDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [cobrando, setCobrando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [pago, setPago] = useState<PagoConfirmado | null>(null);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const data = await api.get<PedidoDetalle>(`/caja/pedidos/${id}`);
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

  async function cobrar() {
    setError("");
    setCobrando(true);
    try {
      const resultado = await api.post<PagoConfirmado>(
        `/caja/pedidos/${id}/cobrar`,
        { metodo: "efectivo" },
      );
      setPago(resultado);
      setPedido((previo) =>
        previo ? { ...previo, estado: resultado.estado } : previo,
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cobrar el pedido");
    } finally {
      setCobrando(false);
    }
  }

  async function cancelar() {
    setError("");
    setCancelando(true);
    try {
      await api.post(`/caja/pedidos/${id}/cancelar`);
      navigate("/caja");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo cancelar el pedido");
    } finally {
      setCancelando(false);
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
          <Link to="/caja" className="mt-4 inline-block">
            <Button variante="secondary">Volver a caja</Button>
          </Link>
        </CardBody>
      </Card>
    );
  }

  const pagado = pedido.estado === "Pagado";
  const exito = Boolean(pago) || pagado;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="font-heading text-2xl font-bold text-on-surface">Cobro</h1>
        <Badge
          className={
            exito
              ? "bg-status-paid text-white"
              : "bg-surface-container text-on-surface-variant"
          }
        >
          {pedido.estado}
        </Badge>
      </div>

      <Card>
        <CardBody className="space-y-3">
          <p className="font-mono text-lg font-semibold text-on-surface">
            {pedido.numero}
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
            <span className="font-heading text-2xl font-bold text-primary">
              {formatoMoneda(pedido.total)}
            </span>
          </div>
        </CardBody>
      </Card>

      {exito ? (
        <Card>
          <CardBody className="space-y-3">
            <CardTitle>Cobro confirmado</CardTitle>
            <p className="text-on-surface-variant">
              Cobro confirmado: folio{" "}
              <span className="font-mono font-bold text-on-surface">
                {pedido.numero}
              </span>
            </p>
            <p className="text-sm text-on-surface-variant">
              El pedido pasó a <strong>Pagado</strong> y ya es visible en cocina.
            </p>
            <Button onClick={() => navigate("/caja/nuevo")}>Nuevo pedido</Button>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="space-y-4">
            <p className="text-sm text-on-surface-variant">
              El pedido se registra y cobra en efectivo en un solo paso.
            </p>

            {error && (
              <p role="alert" className="text-sm font-medium text-danger">
                {error}
              </p>
            )}

            <Button onClick={cobrar} disabled={cobrando} className="w-full">
              {cobrando ? "Cobrando…" : `Registrar y cobrar ${formatoMoneda(pedido.total)}`}
            </Button>

            {error && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variante="secondary"
                  onClick={cobrar}
                  disabled={cobrando}
                >
                  Reintentar cobro
                </Button>
                <Button
                  variante="ghost"
                  onClick={cancelar}
                  disabled={cancelando}
                >
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
