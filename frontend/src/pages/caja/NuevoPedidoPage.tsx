import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../../lib/apiClient";
import { formatoMoneda } from "../../lib/utils";
import type { MenuEntrada, PedidoDetalle } from "../../types";
import { Card, CardBody } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Chip } from "../../components/ui/chip";
import { Stepper } from "../../components/Stepper";

export function NuevoPedidoPage() {
  const navigate = useNavigate();
  const [entradas, setEntradas] = useState<MenuEntrada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [cliente, setCliente] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [seleccion, setSeleccion] = useState<Record<number, number>>({});
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const data = await api.get<MenuEntrada[]>("/menu/cliente");
        if (activo) {
          setEntradas(data);
          setError("");
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
  }, [recarga]);

  const categorias = useMemo(
    () =>
      Array.from(
        new Set(entradas.map((e) => e.categoria).filter((c): c is string => Boolean(c))),
      ),
    [entradas],
  );

  const visibles = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return entradas.filter((entrada) => {
      if (!entrada.disponible) {
        return false;
      }
      if (categoria && entrada.categoria !== categoria) {
        return false;
      }
      if (termino && !entrada.nombre.toLowerCase().includes(termino)) {
        return false;
      }
      return true;
    });
  }, [entradas, busqueda, categoria]);

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

  const cantidadDe = (id: number): number => seleccion[id] ?? 0;

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

  async function verCobro() {
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
      <h1 className="font-heading text-2xl font-bold text-on-surface">
        Nuevo pedido
      </h1>

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

      <div>
        <Label htmlFor="buscar-producto">Buscar producto…</Label>
        <Input
          id="buscar-producto"
          type="search"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          className="mt-1"
        />
      </div>

      {categorias.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Chip activo={categoria === null} onClick={() => setCategoria(null)}>
            Todas
          </Chip>
          {categorias.map((c) => (
            <Chip
              key={c}
              activo={categoria === c}
              onClick={() => setCategoria(categoria === c ? null : c)}
            >
              {c}
            </Chip>
          ))}
        </div>
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
        <p className="text-sm text-on-surface-variant">Cargando menú…</p>
      ) : entradas.length === 0 ? (
        <Card>
          <CardBody>
            <p className="font-heading text-lg font-bold text-on-surface">
              Aún no hay menú publicado
            </p>
            <p className="mt-2 text-on-surface-variant">
              No se puede registrar un pedido de mostrador sin menú del día.
            </p>
          </CardBody>
        </Card>
      ) : visibles.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-on-surface-variant">
              No hay platillos disponibles en el menú de hoy.
            </p>
          </CardBody>
        </Card>
      ) : (
        <ul className="divide-y divide-outline-variant rounded-xl border border-outline-variant bg-surface-container-lowest">
          {visibles.map((entrada) => (
            <li
              key={entrada.id}
              className="flex min-h-[56px] flex-wrap items-center gap-3 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-on-surface">
                  {entrada.nombre}
                </p>
                <p className="text-sm font-bold text-primary">
                  {formatoMoneda(entrada.precio)} c/u
                </p>
              </div>
              <Stepper
                cantidad={cantidadDe(entrada.id)}
                etiqueta={entrada.nombre}
                onCambiar={(nueva) => fijarCantidad(entrada, nueva)}
              />
            </li>
          ))}
        </ul>
      )}

      {cantidadTotal > 0 && (
        <div className="fixed inset-x-0 bottom-14 z-30 border-t border-outline-variant bg-surface-container-lowest lg:bottom-0">
          <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-3">
            <span className="text-sm font-medium text-on-surface-variant">
              {cantidadTotal} platillo{cantidadTotal === 1 ? "" : "s"}
            </span>
            <span className="font-heading text-lg font-bold text-primary">
              {formatoMoneda(total)}
            </span>
            <Button onClick={verCobro} disabled={enviando} className="ml-auto">
              {enviando ? "Creando…" : "Ver cobro"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
