import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError } from "../../lib/apiClient";
import { cambiarCantidad, quitar, useCarrito, vaciar } from "../../lib/carrito";
import { fechaHoraLocal, formatoMoneda } from "../../lib/utils";
import type { PedidoDetalle } from "../../types";
import { Card, CardBody, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

const MINUTOS_MINIMOS = 10;

export function ConfirmarPage() {
  const navigate = useNavigate();
  const { items, total, cantidad } = useCarrito();
  const [fecha, setFecha] = useState(fechaHoraLocal(15));
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function continuar() {
    setError("");
    const fechaDate = new Date(fecha);
    if (Number.isNaN(fechaDate.getTime())) {
      setError("Ingresa una hora de recolección válida");
      return;
    }
    if (fechaDate.getTime() < Date.now() + MINUTOS_MINIMOS * 60_000) {
      setError(
        `La hora de recolección debe ser al menos ${MINUTOS_MINIMOS} minutos después de ahora`,
      );
      return;
    }

    setEnviando(true);
    try {
      const pedido = await api.post<PedidoDetalle>("/pedidos", {
        fecha_recoleccion: `${fecha}:00`,
        items: items.map((item) => ({
          menu_dia_id: item.menu_dia_id,
          cantidad: item.cantidad,
        })),
      });
      vaciar();
      navigate(`/pedido/${pedido.id}/pago`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear el pedido");
    } finally {
      setEnviando(false);
    }
  }

  if (cantidad === 0) {
    return (
      <Card>
        <CardBody className="flex flex-col items-center gap-3 py-10 text-center">
          <CardTitle>Tu carrito está vacío</CardTitle>
          <p className="text-sm text-on-surface-variant">
            Agrega platillos desde el menú para hacer un pedido anticipado.
          </p>
          <Link to="/menu">
            <Button>Volver al menú</Button>
          </Link>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold text-on-surface">
        Revisa tu pedido
      </h1>

      <Card>
        <CardBody className="divide-y divide-outline-variant">
          {items.map((item) => (
            <div key={item.menu_dia_id} className="flex items-center gap-3 py-3">
              <div className="flex-1">
                <p className="font-semibold text-on-surface">{item.nombre}</p>
                <p className="text-sm text-on-surface-variant">
                  {formatoMoneda(item.precio)} c/u
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variante="secondary"
                  aria-label={`Quitar uno de ${item.nombre}`}
                  onClick={() => cambiarCantidad(item.menu_dia_id, item.cantidad - 1)}
                  className="h-11 w-11 px-0 text-lg"
                >
                  −
                </Button>
                <span className="min-w-6 text-center font-semibold">
                  {item.cantidad}
                </span>
                <Button
                  variante="secondary"
                  aria-label={`Agregar uno de ${item.nombre}`}
                  onClick={() => cambiarCantidad(item.menu_dia_id, item.cantidad + 1)}
                  className="h-11 w-11 px-0 text-lg"
                >
                  +
                </Button>
              </div>
              <span className="w-24 text-right font-semibold text-primary">
                {formatoMoneda(item.precio * item.cantidad)}
              </span>
              <Button
                variante="ghost"
                aria-label={`Quitar ${item.nombre} del carrito`}
                onClick={() => quitar(item.menu_dia_id)}
                className="px-2 text-sm text-danger"
              >
                ×
              </Button>
            </div>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <div>
            <Label htmlFor="fecha-recoleccion">Hora de recolección</Label>
            <Input
              id="fecha-recoleccion"
              type="datetime-local"
              value={fecha}
              min={fechaHoraLocal(MINUTOS_MINIMOS)}
              onChange={(event) => setFecha(event.target.value)}
              className="mt-1"
            />
            <p className="mt-1 text-xs text-on-surface-variant">
              Mínimo {MINUTOS_MINIMOS} minutos de anticipación.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-on-surface-variant">Total</span>
            <span className="font-heading text-2xl font-bold text-primary">
              {formatoMoneda(total)}
            </span>
          </div>

          <p className="text-sm text-on-surface-variant">
            Recogida presencial en la cafetería.
          </p>

          {error && (
            <p role="alert" className="text-sm font-medium text-danger">
              {error}
            </p>
          )}

          <Button onClick={continuar} disabled={enviando} className="h-12 w-full">
            {enviando ? "Creando pedido…" : "Continuar al pago"}
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
