import { useEffect, useState, type FormEvent } from "react";
import { api, ApiError } from "../../lib/apiClient";
import type { Platillo } from "../../types";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export function PlatillosPage() {
  const [platillos, setPlatillos] = useState<Platillo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      setPlatillos(await api.get<Platillo[]>("/platillos"));
      setError("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Error al cargar");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    let activo = true;
    async function cargarInicial() {
      try {
        const lista = await api.get<Platillo[]>("/platillos");
        if (activo) {
          setPlatillos(lista);
        }
      } catch (err) {
        if (activo) {
          setError(err instanceof ApiError ? err.message : "Error al cargar");
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }
    void cargarInicial();
    return () => {
      activo = false;
    };
  }, []);

  function limpiarFormulario() {
    setEditandoId(null);
    setNombre("");
    setCategoria("");
    setDescripcion("");
  }

  function editar(platillo: Platillo) {
    setEditandoId(platillo.id);
    setNombre(platillo.nombre);
    setCategoria(platillo.categoria ?? "");
    setDescripcion(platillo.descripcion ?? "");
    setError("");
    setMensaje("");
  }

  async function guardar(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMensaje("");
    setEnviando(true);
    const payload = {
      nombre,
      categoria: categoria.trim() || null,
      descripcion: descripcion.trim() || null,
    };
    try {
      if (editandoId === null) {
        await api.post("/platillos", payload);
        setMensaje("Platillo creado correctamente");
      } else {
        await api.put(`/platillos/${editandoId}`, payload);
        setMensaje("Platillo actualizado correctamente");
      }
      limpiarFormulario();
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar");
    } finally {
      setEnviando(false);
    }
  }

  async function alternarActivo(platillo: Platillo) {
    setError("");
    try {
      await api.put(`/platillos/${platillo.id}`, { activo: !platillo.activo });
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editandoId === null ? "Nuevo platillo" : "Editar platillo"}</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={guardar} className="grid gap-4 sm:grid-cols-2" noValidate>
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="categoria">Categoría</Label>
              <Input
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <Button type="submit" disabled={enviando}>
                {enviando ? "Guardando…" : editandoId === null ? "Crear platillo" : "Guardar cambios"}
              </Button>
              {editandoId !== null && (
                <Button variante="ghost" onClick={limpiarFormulario}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
          {error && (
            <p role="alert" className="mt-3 text-sm font-medium text-danger">
              {error}
            </p>
          )}
          {mensaje && <p className="mt-3 text-sm font-medium text-primary">{mensaje}</p>}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Catálogo de platillos</CardTitle>
        </CardHeader>
        <CardBody>
          {cargando ? (
            <p className="text-on-surface-variant">Cargando…</p>
          ) : platillos.length === 0 ? (
            <p className="text-on-surface-variant">Todavía no hay platillos registrados.</p>
          ) : (
            <ul className="divide-y divide-outline-variant">
              {platillos.map((platillo) => (
                <li
                  key={platillo.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-on-surface">
                      {platillo.nombre}
                    </p>
                    <p className="truncate text-sm text-on-surface-variant">
                      {platillo.categoria ?? "Sin categoría"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        platillo.activo
                          ? "bg-primary-container text-on-primary-container"
                          : "bg-surface-container text-on-surface-variant"
                      }
                    >
                      {platillo.activo ? "Activo" : "Inactivo"}
                    </Badge>
                    <Button
                      variante="ghost"
                      onClick={() => editar(platillo)}
                      className="h-9 min-h-0 px-3 text-sm"
                    >
                      Editar
                    </Button>
                    <Button
                      variante="secondary"
                      onClick={() => alternarActivo(platillo)}
                      className="h-9 min-h-0 px-3 text-sm"
                    >
                      {platillo.activo ? "Desactivar" : "Activar"}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
