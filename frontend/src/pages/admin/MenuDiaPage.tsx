import { useEffect, useState, type FormEvent } from "react";
import { api, ApiError } from "../../lib/apiClient";
import { formatoMoneda, hoyISO } from "../../lib/utils";
import type { MenuEntrada, Platillo } from "../../types";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardBody, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

interface TarjetaEntradaProps {
  entrada: MenuEntrada;
  onPrecio: (id: number, precio: number) => void;
  onDisponible: (entrada: MenuEntrada) => void;
  onEspecial: (entrada: MenuEntrada) => void;
  onQuitar: (id: number) => void;
}

function TarjetaEntrada({
  entrada,
  onPrecio,
  onDisponible,
  onEspecial,
  onQuitar,
}: TarjetaEntradaProps) {
  const [precio, setPrecio] = useState(String(entrada.precio));
  const precioNumero = Number(precio);
  const precioValido =
    precio.trim() !== "" && !Number.isNaN(precioNumero) && precioNumero >= 0;

  return (
    <Card className={!entrada.disponible ? "opacity-70" : ""}>
      <CardBody className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-heading text-lg font-bold text-on-surface">
              {entrada.nombre}
            </h3>
            <p className="truncate text-sm text-on-surface-variant">
              {entrada.categoria ?? "Sin categoría"}
            </p>
          </div>
          <button
            type="button"
            aria-pressed={entrada.especial}
            onClick={() => onEspecial(entrada)}
            className="shrink-0"
          >
            <Badge
              className={
                entrada.especial
                  ? "bg-tertiary-container text-on-tertiary-container"
                  : "bg-surface-container text-on-surface-variant"
              }
            >
              {entrada.especial ? "Especial" : "Marcar especial"}
            </Badge>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor={`precio-${entrada.id}`} className="mb-0 text-xs">
            Precio
          </Label>
          <Input
            id={`precio-${entrada.id}`}
            type="number"
            min={0}
            step="0.5"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="h-9 w-24 text-sm"
          />
          <Button
            variante="ghost"
            disabled={!precioValido || precioNumero === entrada.precio}
            onClick={() => onPrecio(entrada.id, precioNumero)}
            className="h-9 min-h-0 px-3 text-sm"
          >
            Guardar
          </Button>
          <span className="ml-auto font-bold text-primary">
            {formatoMoneda(entrada.precio)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variante={entrada.disponible ? "secondary" : "primary"}
            onClick={() => onDisponible(entrada)}
            className="h-11 min-h-[44px] px-4 text-sm"
          >
            {entrada.disponible ? "Disponible" : "No disponible"}
          </Button>
          <Button
            variante="danger"
            onClick={() => onQuitar(entrada.id)}
            className="h-11 min-h-[44px] px-4 text-sm"
          >
            Quitar del menú
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

export function MenuDiaPage() {
  const [fecha, setFecha] = useState(hoyISO());
  const [entradas, setEntradas] = useState<MenuEntrada[]>([]);
  const [platillos, setPlatillos] = useState<Platillo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [platilloId, setPlatilloId] = useState("");
  const [precio, setPrecio] = useState("");
  const [disponible, setDisponible] = useState(true);
  const [especial, setEspecial] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      const data = await api.get<MenuEntrada[]>(`/menu?fecha=${fecha}`);
      setEntradas(data);
      setError("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al cargar el menú");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    let activo = true;
    async function cargarMenu() {
      setCargando(true);
      try {
        const data = await api.get<MenuEntrada[]>(`/menu?fecha=${fecha}`);
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
    void cargarMenu();
    return () => {
      activo = false;
    };
  }, [fecha]);

  useEffect(() => {
    let activo = true;
    async function cargarPlatillos() {
      try {
        const lista = await api.get<Platillo[]>("/platillos?activo=true");
        if (activo) {
          setPlatillos(lista);
        }
      } catch (err) {
        if (activo) {
          setError(err instanceof ApiError ? err.message : "Error al cargar platillos");
        }
      }
    }
    void cargarPlatillos();
    return () => {
      activo = false;
    };
  }, []);

  async function agregar(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMensaje("");
    setEnviando(true);
    try {
      await api.post("/menu", {
        fecha,
        platillo_id: Number(platilloId),
        precio: Number(precio),
        disponible,
        especial,
      });
      setPlatilloId("");
      setPrecio("");
      setDisponible(true);
      setEspecial(false);
      setMensaje("Platillo agregado al menú");
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo agregar");
    } finally {
      setEnviando(false);
    }
  }

  async function cambiarDisponible(entrada: MenuEntrada) {
    setError("");
    try {
      await api.put(`/menu/${entrada.id}`, { disponible: !entrada.disponible });
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar");
    }
  }

  async function cambiarEspecial(entrada: MenuEntrada) {
    setError("");
    try {
      await api.put(`/menu/${entrada.id}`, { especial: !entrada.especial });
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar");
    }
  }

  async function guardarPrecio(id: number, nuevoPrecio: number) {
    setError("");
    try {
      await api.put(`/menu/${id}`, { precio: nuevoPrecio });
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar el precio");
    }
  }

  async function quitar(id: number) {
    if (!window.confirm("¿Quitar este platillo del menú?")) {
      return;
    }
    setError("");
    try {
      await api.del(`/menu/${id}`);
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo quitar");
    }
  }

  const esHoy = fecha === hoyISO();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-bold text-on-surface">
            Menú del día
          </h1>
          {esHoy && (
            <Badge className="bg-primary-container text-on-primary-container">
              Menú de hoy
            </Badge>
          )}
        </div>
        <div className="w-full max-w-xs">
          <Label htmlFor="fecha">Fecha</Label>
          <Input
            id="fecha"
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardBody className="space-y-4">
          <CardTitle>Agregar al menú</CardTitle>
          <form onSubmit={agregar} className="grid gap-4 sm:grid-cols-2" noValidate>
            <div>
              <Label htmlFor="platillo">Platillo</Label>
              <select
                id="platillo"
                value={platilloId}
                onChange={(e) => setPlatilloId(e.target.value)}
                required
                className="h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-base"
              >
                <option value="">Selecciona un platillo…</option>
                {platillos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="precio-nuevo">Precio</Label>
              <Input
                id="precio-nuevo"
                type="number"
                min={0}
                step="0.5"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center gap-6 sm:col-span-2">
              <label className="flex items-center gap-2 text-sm text-on-surface">
                <input
                  type="checkbox"
                  checked={disponible}
                  onChange={(e) => setDisponible(e.target.checked)}
                  className="h-4 w-4"
                />
                Disponible
              </label>
              <label className="flex items-center gap-2 text-sm text-on-surface">
                <input
                  type="checkbox"
                  checked={especial}
                  onChange={(e) => setEspecial(e.target.checked)}
                  className="h-4 w-4"
                />
                Especial del día
              </label>
            </div>
            <div className="sm:col-span-2">
              <Button
                type="submit"
                disabled={enviando || platilloId === "" || precio === ""}
              >
                {enviando ? "Agregando…" : "Agregar al menú"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-danger bg-danger-container px-4 py-3"
        >
          <p className="text-sm font-medium text-on-danger-container">{error}</p>
          <Button
            variante="secondary"
            className="h-9 min-h-0 px-4 text-sm"
            onClick={() => void cargar()}
          >
            Reintentar
          </Button>
        </div>
      )}
      {mensaje && <p className="text-sm font-medium text-primary">{mensaje}</p>}

      {cargando ? (
        <p className="text-sm text-on-surface-variant">Cargando…</p>
      ) : entradas.length === 0 ? (
        <Card>
          <CardBody className="py-10 text-center">
            <p className="font-heading text-lg font-bold text-on-surface">
              No hay menú publicado para esta fecha
            </p>
            <p className="mt-2 text-sm text-on-surface-variant">
              Usa el formulario de arriba para agregar platillos.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {entradas.map((entrada) => (
            <TarjetaEntrada
              key={entrada.id}
              entrada={entrada}
              onPrecio={guardarPrecio}
              onDisponible={cambiarDisponible}
              onEspecial={cambiarEspecial}
              onQuitar={quitar}
            />
          ))}
        </div>
      )}
    </div>
  );
}
