import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "../../lib/apiClient";
import { cn, formatoMoneda } from "../../lib/utils";
import type { PagoConfirmado, PedidoDetalle } from "../../types";
import { Card, CardBody, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

const METODOS = [
  { valor: "efectivo", etiqueta: "Efectivo" },
  { valor: "tarjeta", etiqueta: "Tarjeta" },
] as const;

type Metodo = (typeof METODOS)[number]["valor"];

export function CobroPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState<PedidoDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [metodo, setMetodo] = useState<Metodo>("efectivo");
  const [cobrando, setCobrando] = useState(false);
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
        { metodo },
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-on-surface">
          Cobro {pedido.numero}
        </h1>
        <Badge className="bg-primary-container text-on-primary-container">
          {pedido.estado}
        </Badge>
      </div>

      <Card>
        <CardBody className="space-y-3">
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
            <span className="text-sm text-on-surface-variant">Total a cobrar</span>
            <span className="font-display text-xl font-bold text-primary">
              {formatoMoneda(pedido.total)}
            </span>
          </div>
        </CardBody>
      </Card>

      {pago || pagado ? (
        <Card>
          <CardBody className="space-y-3">
            <CardTitle>Cobro registrado</CardTitle>
            <p className="text-on-surface-variant">
              Método: {pago?.pago.metodo ?? "—"} · Total{" "}
              {formatoMoneda(pago?.pago.monto ?? pedido.total)}
            </p>
            <p className="text-sm text-on-surface-variant">
              El pedido pasó a <strong>Pagado</strong> y ya es visible en cocina.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => navigate("/caja")}>Nuevo pedido</Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardBody className="space-y-4">
            <CardTitle>Método de pago</CardTitle>
            <div className="grid grid-cols-2 gap-3">
              {METODOS.map((opcion) => (
                <button
                  key={opcion.valor}
                  type="button"
                  aria-pressed={metodo === opcion.valor}
                  onClick={() => setMetodo(opcion.valor)}
                  className={cn(
                    "flex h-12 min-h-[44px] items-center justify-center rounded-lg border text-base font-semibold transition",
                    metodo === opcion.valor
                      ? "border-primary bg-primary-container text-on-primary-container"
                      : "border-outline-variant text-on-surface-variant hover:bg-surface-container",
                  )}
                >
                  {opcion.etiqueta}
                </button>
              ))}
            </div>

            {error && (
              <p role="alert" className="text-sm font-medium text-danger">
                {error}
              </p>
            )}

            <Button onClick={cobrar} disabled={cobrando} className="w-full">
              {cobrando ? "Cobrando…" : `Cobrar ${formatoMoneda(pedido.total)}`}
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
