import { useEffect, useState, type FormEvent } from "react";
import { api, ApiError } from "../../lib/apiClient";
import { formatoMoneda, hoyISO } from "../../lib/utils";
import type { MenuEntrada, Platillo } from "../../types";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

interface FilaEntradaProps {
  entrada: MenuEntrada;
  onPrecio: (id: number, precio: number) => void;
  onDisponible: (entrada: MenuEntrada) => void;
  onEspecial: (entrada: MenuEntrada) => void;
  onQuitar: (id: number) => void;
}

function FilaEntrada({
  entrada,
  onPrecio,
  onDisponible,
  onEspecial,
  onQuitar,
}: FilaEntradaProps) {
  const [precio, setPrecio] = useState(String(entrada.precio));
  const precioNumero = Number(precio);
  const precioValido = precio.trim() !== "" && !Number.isNaN(precioNumero) && precioNumero >= 0;

  return (
    <li className="flex flex-wrap items-center gap-3 py-3">
      <div className="min-w-40 flex-1">
        <p className="truncate font-semibold text-on-surface">{entrada.nombre}</p>
        <p className="truncate text-sm text-on-surface-variant">
          {entrada.categoria ?? "Sin categoría"} · costo actual{" "}
          {formatoMoneda(entrada.precio)}
        </p>
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
      </div>

      <div className="flex items-center gap-2">
        {entrada.especial && (
          <Badge className="bg-tertiary-container text-on-tertiary-container">
            Especial
          </Badge>
        )}
        <Button
          variante={entrada.disponible ? "secondary" : "primary"}
          onClick={() => onDisponible(entrada)}
          className="h-9 min-h-0 px-3 text-sm"
        >
          {entrada.disponible ? "Marcar no disponible" : "Marcar disponible"}
        </Button>
        <Button
          variante="ghost"
          onClick={() => onEspecial(entrada)}
          className="h-9 min-h-0 px-3 text-sm"
        >
          {entrada.especial ? "Quitar especial" : "Hacer especial"}
        </Button>
        <Button
          variante="danger"
          onClick={() => onQuitar(entrada.id)}
          className="h-9 min-h-0 px-3 text-sm"
        >
          Quitar
        </Button>
      </div>
    </li>
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
    setError("");
    try {
      await api.del(`/menu/${id}`);
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo quitar");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Menú del día</CardTitle>
        </CardHeader>
        <CardBody className="space-y-5">
          <div className="max-w-xs">
            <Label htmlFor="fecha">Fecha</Label>
            <Input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </div>

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
              <Button type="submit" disabled={enviando || platilloId === "" || precio === ""}>
                {enviando ? "Agregando…" : "Agregar al menú"}
              </Button>
            </div>
          </form>

          {error && (
            <p role="alert" className="text-sm font-medium text-danger">
              {error}
            </p>
          )}
          {mensaje && <p className="text-sm font-medium text-primary">{mensaje}</p>}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platillos del {fecha}</CardTitle>
        </CardHeader>
        <CardBody>
          {cargando ? (
            <p className="text-on-surface-variant">Cargando…</p>
          ) : entradas.length === 0 ? (
            <p className="text-on-surface-variant">
              No hay platillos en el menú de esta fecha.
            </p>
          ) : (
            <ul className="divide-y divide-outline-variant">
              {entradas.map((entrada) => (
                <FilaEntrada
                  key={entrada.id}
                  entrada={entrada}
                  onPrecio={guardarPrecio}
                  onDisponible={cambiarDisponible}
                  onEspecial={cambiarEspecial}
                  onQuitar={quitar}
                />
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
