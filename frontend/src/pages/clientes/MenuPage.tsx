import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../../lib/apiClient";
import { formatoMoneda, hoyISO } from "../../lib/utils";
import { agregar, cambiarCantidad, useCarrito } from "../../lib/carrito";
import type { MenuEntrada } from "../../types";
import { PlatilloCard } from "../../components/PlatilloCard";
import { Card, CardBody } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Chip } from "../../components/ui/chip";

export function MenuPage() {
  const [entradas, setEntradas] = useState<MenuEntrada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const { items, total, cantidad } = useCarrito();

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

  const cantidadDe = (id: number): number =>
    items.find((item) => item.menu_dia_id === id)?.cantidad ?? 0;

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
      if (categoria && entrada.categoria !== categoria) {
        return false;
      }
      if (termino && !entrada.nombre.toLowerCase().includes(termino)) {
        return false;
      }
      return true;
    });
  }, [entradas, busqueda, categoria]);

  return (
    <div className="space-y-6 pb-24">
      <Card className="bg-surface-container">
        <CardBody className="flex flex-col items-center gap-2 py-8 text-center">
          <span aria-hidden="true" className="text-4xl">
            ☕
          </span>
          <h1 className="font-heading text-2xl font-bold text-on-surface">
            ¡Buen día! Tu café, en buenas manos
          </h1>
          <p className="text-sm text-on-surface-variant">Menú del {hoyISO()}</p>
        </CardBody>
      </Card>

      <div>
        <Label htmlFor="buscar-menu">Buscar producto…</Label>
        <Input
          id="buscar-menu"
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
        <p className="text-sm text-on-surface-variant">Cargando…</p>
      ) : entradas.length === 0 ? (
        <Card>
          <CardBody>
            <p className="font-heading text-lg font-bold text-on-surface">
              Menú no disponible hoy
            </p>
            <p className="mt-2 text-on-surface-variant">
              Vuelve más tarde; la cafetería todavía no publicó el menú de hoy.
            </p>
          </CardBody>
        </Card>
      ) : visibles.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          Sin resultados para “{busqueda || categoria}”.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visibles.map((entrada) => (
            <PlatilloCard
              key={entrada.id}
              entrada={entrada}
              cantidad={cantidadDe(entrada.id)}
              onAgregar={agregar}
              onCambiarCantidad={(e, c) => cambiarCantidad(e.id, c)}
            />
          ))}
        </div>
      )}

      {cantidad > 0 && (
        <div className="fixed inset-x-0 bottom-14 z-30 border-t border-outline-variant bg-surface-container-lowest lg:bottom-0">
          <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-3">
            <span className="text-sm font-medium text-on-surface-variant">
              {cantidad} producto{cantidad === 1 ? "" : "s"}
            </span>
            <span className="font-heading text-lg font-bold text-primary">
              {formatoMoneda(total)}
            </span>
            <Link to="/pedido/confirmar" className="ml-auto">
              <Button>Ver pedido</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
