import { useEffect, useMemo, useState, type FormEvent } from "react";
import { api, ApiError } from "../../lib/apiClient";
import type { Platillo } from "../../types";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardBody, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Chip } from "../../components/ui/chip";

export function PlatillosPage() {
  const [platillos, setPlatillos] = useState<Platillo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);

  const [formAbierto, setFormAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [categoriaForm, setCategoriaForm] = useState("");
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
    async function iniciar() {
      if (activo) {
        await cargar();
      }
    }
    void iniciar();
    return () => {
      activo = false;
    };
  }, []);

  function cerrarFormulario() {
    setFormAbierto(false);
    setEditandoId(null);
    setNombre("");
    setCategoriaForm("");
    setDescripcion("");
  }

  function nuevo() {
    setError("");
    setMensaje("");
    cerrarFormulario();
    setFormAbierto(true);
  }

  function editar(platillo: Platillo) {
    setError("");
    setMensaje("");
    setEditandoId(platillo.id);
    setNombre(platillo.nombre);
    setCategoriaForm(platillo.categoria ?? "");
    setDescripcion(platillo.descripcion ?? "");
    setFormAbierto(true);
  }

  async function guardar(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMensaje("");
    setEnviando(true);
    const payload = {
      nombre,
      categoria: categoriaForm.trim() || null,
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
      cerrarFormulario();
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

  const categorias = useMemo(
    () =>
      Array.from(
        new Set(platillos.map((p) => p.categoria).filter((c): c is string => Boolean(c))),
      ),
    [platillos],
  );

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return platillos.filter((p) => {
      if (categoria && p.categoria !== categoria) {
        return false;
      }
      if (termino && !p.nombre.toLowerCase().includes(termino)) {
        return false;
      }
      return true;
    });
  }, [platillos, busqueda, categoria]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-on-surface">
            Catálogo de platillos
          </h1>
          <p className="text-sm text-on-surface-variant">
            El precio se asigna al publicarlo en el menú del día.
          </p>
        </div>
        <Button onClick={nuevo}>Nuevo platillo</Button>
      </div>

      {formAbierto && (
        <Card>
          <CardBody className="space-y-4">
            <CardTitle>
              {editandoId === null ? "Nuevo platillo" : "Editar platillo"}
            </CardTitle>
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
                  value={categoriaForm}
                  onChange={(e) => setCategoriaForm(e.target.value)}
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
                  {enviando
                    ? "Guardando…"
                    : editandoId === null
                      ? "Crear platillo"
                      : "Guardar cambios"}
                </Button>
                <Button variante="ghost" onClick={cerrarFormulario}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <div className="space-y-3">
        <div>
          <Label htmlFor="buscar-platillo">Buscar platillo</Label>
          <Input
            id="buscar-platillo"
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
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
      </div>

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
      ) : platillos.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="font-heading text-lg font-bold text-on-surface">
              El catálogo está vacío
            </p>
            <Button onClick={nuevo}>Nuevo platillo</Button>
          </CardBody>
        </Card>
      ) : filtrados.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          Sin resultados para “{busqueda || categoria}”.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtrados.map((platillo) => (
            <Card key={platillo.id} className={!platillo.activo ? "opacity-60" : ""}>
              <CardBody className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-heading text-lg font-bold text-on-surface">
                    {platillo.nombre}
                  </h3>
                  <Badge
                    className={
                      platillo.activo
                        ? "bg-primary-container text-on-primary-container"
                        : "bg-surface-container text-on-surface-variant"
                    }
                  >
                    {platillo.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-secondary-container text-on-secondary-container">
                    {platillo.categoria ?? "Sin categoría"}
                  </Badge>
                </div>
                {platillo.descripcion && (
                  <p className="text-sm text-on-surface-variant">
                    {platillo.descripcion}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    variante="secondary"
                    onClick={() => editar(platillo)}
                    className="h-9 min-h-0 px-3 text-sm"
                  >
                    Editar
                  </Button>
                  <Button
                    variante="ghost"
                    onClick={() => void alternarActivo(platillo)}
                    className="h-9 min-h-0 px-3 text-sm"
                  >
                    {platillo.activo ? "Desactivar" : "Activar"}
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
