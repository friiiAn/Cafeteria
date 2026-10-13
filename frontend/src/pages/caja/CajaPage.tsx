import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../../lib/apiClient";
import { hoyISO, formatoMoneda, formatoFechaHora } from "../../lib/utils";
import type { MenuEntrada, PedidoDetalle, PedidoEntrega } from "../../types";
import { PlatilloCard } from "../../components/PlatilloCard";
import { Card, CardBody, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";

const INTERVALO_ENTREGAS_MS = 10000;

export function CajaPage() {
  const navigate = useNavigate();
  const [entradas, setEntradas] = useState<MenuEntrada[]>([]);
  const [seleccion, setSeleccion] = useState<Record<number, number>>({});
  const [cliente, setCliente] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [listos, setListos] = useState<PedidoEntrega[]>([]);
  const [entregando, setEntregando] = useState<number | null>(null);
  const [recargaListos, setRecargaListos] = useState(0);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const data = await api.get<MenuEntrada[]>("/menu/cliente");
        if (activo) {
          setEntradas(data);
        }
      } catch (err) {
        if (activo) {
          setError(err instanceof ApiError ? err.message : "Error al cargar el menú");
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

  useEffect(() => {
    let activo = true;
    async function cargarListos() {
      try {
        const data = await api.get<PedidoEntrega[]>("/caja/pedidos");
        if (activo) {
          setListos(data);
        }
      } catch {
        /* silencioso: no bloquea la captura de mostrador */
      }
    }
    void cargarListos();
    const timer = window.setInterval(() => {
      void cargarListos();
    }, INTERVALO_ENTREGAS_MS);
    return () => {
      activo = false;
      window.clearInterval(timer);
    };
  }, [recargaListos]);

  async function entregar(pedido: PedidoEntrega): Promise<void> {
    setError("");
    setEntregando(pedido.id);
    try {
      await api.post(`/caja/pedidos/${pedido.id}/entregar`);
      setRecargaListos((n) => n + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo entregar el pedido");
    } finally {
      setEntregando(null);
    }
  }

  const cantidadDe = (id: number): number => seleccion[id] ?? 0;

  const fijarCantidad = (entrada: MenuEntrada, cantidad: number): void => {
    setSeleccion((previo) => {
      const copia = { ...previo };
      if (cantidad <= 0) {
        delete copia[entrada.id];
      } else {
        copia[entrada.id] = cantidad;
      }
      return copia;
    });
  };

  const lineas = entradas
    .filter((entrada) => (seleccion[entrada.id] ?? 0) > 0)
    .map((entrada) => ({
      menu_dia_id: entrada.id,
      cantidad: seleccion[entrada.id],
      precio: entrada.precio,
    }));

  const cantidadTotal = lineas.reduce((suma, linea) => suma + linea.cantidad, 0);
  const total = lineas.reduce(
    (suma, linea) => suma + linea.cantidad * linea.precio,
    0,
  );

  async function crear() {
    setError("");
    if (lineas.length === 0) {
      setError("Agrega al menos un platillo al pedido");
      return;
    }
    setEnviando(true);
    try {
      const pedido = await api.post<PedidoDetalle>("/caja/pedidos", {
        cliente_nombre: cliente.trim() || undefined,
        items: lineas.map((linea) => ({
          menu_dia_id: linea.menu_dia_id,
          cantidad: linea.cantidad,
        })),
      });
      navigate(`/caja/${pedido.id}/cobro`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear el pedido");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-6 pb-28">
      <div>
        <h1 className="font-display text-2xl font-bold text-on-surface">
          Pedido de mostrador
        </h1>
        <p className="text-sm text-on-surface-variant">{hoyISO()}</p>
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}

      {listos.length > 0 && (
        <Card>
          <CardBody className="space-y-3">
            <CardTitle>Listos para entrega</CardTitle>
            <ul className="divide-y divide-outline-variant">
              {listos.map((pedido) => (
                <li
                  key={pedido.id}
                  className="flex flex-wrap items-center gap-3 py-3"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-on-surface">{pedido.numero}</p>
                    <p className="text-sm text-on-surface-variant">
                      {pedido.cliente_nombre ?? "Cliente de mostrador"} ·{" "}
                      {formatoFechaHora(pedido.fecha_recoleccion)}
                    </p>
                  </div>
                  <Badge className="bg-tertiary-container text-on-tertiary-container">
                    Listo
                  </Badge>
                  <Button
                    disabled={entregando === pedido.id}
                    onClick={() => void entregar(pedido)}
                  >
                    {entregando === pedido.id ? "Entregando…" : "Confirmar entrega"}
                  </Button>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      {cargando ? (
        <p className="text-on-surface-variant">Cargando…</p>
      ) : entradas.length === 0 ? (
        <Card>
          <CardBody>
            <CardTitle>Aún no hay menú publicado</CardTitle>
            <p className="mt-2 text-on-surface-variant">
              No se puede registrar un pedido de mostrador sin menú del día.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {entradas.map((entrada) => (
            <PlatilloCard
              key={entrada.id}
              entrada={entrada}
              cantidad={cantidadDe(entrada.id)}
              onAgregar={(e) => fijarCantidad(e, cantidadDe(e.id) + 1)}
              onCambiarCantidad={(e, c) => fijarCantidad(e, c)}
            />
          ))}
        </div>
      )}

      <Card>
        <CardBody className="space-y-3">
          <div>
            <Label htmlFor="cliente-mostrador">Nombre del cliente (opcional)</Label>
            <Input
              id="cliente-mostrador"
              value={cliente}
              maxLength={100}
              placeholder="Cliente de mostrador"
              onChange={(event) => setCliente(event.target.value)}
              className="mt-1"
            />
          </div>
          <p className="text-sm text-on-surface-variant">
            {cantidadTotal} artículo{cantidadTotal === 1 ? "" : "s"} seleccionado
            {cantidadTotal === 1 ? "" : "s"}
          </p>
        </CardBody>
      </Card>

      {cantidadTotal > 0 && (
        <div className="fixed inset-x-0 bottom-0 border-t border-outline-variant bg-surface-container-lowest">
          <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-3">
            <span className="text-sm font-medium text-on-surface-variant">
              {cantidadTotal} artículo{cantidadTotal === 1 ? "" : "s"}
            </span>
            <span className="font-display text-lg font-bold text-primary">
              {formatoMoneda(total)}
            </span>
            <Button onClick={crear} disabled={enviando} className="ml-auto">
              {enviando ? "Creando…" : "Crear y cobrar"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
