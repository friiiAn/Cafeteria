import { useEffect, useMemo, useState, type FormEvent } from "react";
import { api, ApiError } from "../../lib/apiClient";
import type { Rol, Usuario } from "../../types";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardBody, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

const ROLES_OPERATIVOS: Rol[] = ["cajero", "cocinero", "administrador"];

const ETIQUETAS: Record<Rol, string> = {
  administrador: "Administrador",
  cajero: "Cajero",
  cocinero: "Cocinero",
  usuario: "Cliente",
};

const FORM_VACIO = { nombre: "", correo: "", password: "", rol: "cajero" as Rol };

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");

  const [formAbierto, setFormAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombre, setNombre] = useState(FORM_VACIO.nombre);
  const [correo, setCorreo] = useState(FORM_VACIO.correo);
  const [password, setPassword] = useState(FORM_VACIO.password);
  const [rol, setRol] = useState<Rol>(FORM_VACIO.rol);
  const [enviando, setEnviando] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      setUsuarios(await api.get<Usuario[]>("/usuarios"));
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
    setNombre(FORM_VACIO.nombre);
    setCorreo(FORM_VACIO.correo);
    setPassword(FORM_VACIO.password);
    setRol(FORM_VACIO.rol);
  }

  function nuevo() {
    setError("");
    setMensaje("");
    cerrarFormulario();
    setFormAbierto(true);
  }

  function editar(usuario: Usuario) {
    setError("");
    setMensaje("");
    setEditandoId(usuario.id);
    setNombre(usuario.nombre);
    setCorreo(usuario.correo);
    setRol(usuario.rol);
    setFormAbierto(true);
  }

  async function guardar(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMensaje("");
    setEnviando(true);
    try {
      if (editandoId === null) {
        await api.post("/usuarios", { nombre, correo, password, rol });
        setMensaje("Usuario creado correctamente");
      } else {
        await api.put(`/usuarios/${editandoId}`, { nombre, correo, rol });
        setMensaje("Usuario actualizado correctamente");
      }
      cerrarFormulario();
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar");
    } finally {
      setEnviando(false);
    }
  }

  async function alternarActivo(usuario: Usuario) {
    if (
      usuario.activo &&
      !window.confirm(`¿Deshabilitar a ${usuario.nombre}?`)
    ) {
      return;
    }
    setError("");
    try {
      await api.put(`/usuarios/${usuario.id}`, { activo: !usuario.activo });
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar");
    }
  }

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) {
      return usuarios;
    }
    return usuarios.filter(
      (u) =>
        u.nombre.toLowerCase().includes(termino) ||
        u.correo.toLowerCase().includes(termino),
    );
  }, [usuarios, busqueda]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-on-surface">
            Usuarios
          </h1>
          <p className="text-sm text-on-surface-variant">
            Personal operativo de la cafetería.
          </p>
        </div>
        <Button onClick={nuevo}>Nuevo usuario</Button>
      </div>

      {formAbierto && (
        <Card>
          <CardBody className="space-y-4">
            <CardTitle>
              {editandoId === null ? "Nuevo usuario operativo" : "Editar usuario"}
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
                <Label htmlFor="correo">Correo</Label>
                <Input
                  id="correo"
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  required
                />
              </div>
              {editandoId === null && (
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              )}
              <div>
                <Label htmlFor="rol">Rol</Label>
                <select
                  id="rol"
                  value={rol}
                  onChange={(e) => setRol(e.target.value as Rol)}
                  className="h-11 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-base"
                >
                  {ROLES_OPERATIVOS.map((r) => (
                    <option key={r} value={r}>
                      {ETIQUETAS[r]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 sm:col-span-2">
                <Button type="submit" disabled={enviando}>
                  {enviando
                    ? "Guardando…"
                    : editandoId === null
                      ? "Crear usuario"
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

      <div>
        <Label htmlFor="buscar-usuario">Buscar por nombre o correo</Label>
        <Input
          id="buscar-usuario"
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="mt-1"
        />
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
      ) : usuarios.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-2 py-10 text-center">
            <p className="font-heading text-lg font-bold text-on-surface">
              Aún no hay usuarios operativos
            </p>
            <Button onClick={nuevo}>Nuevo usuario</Button>
          </CardBody>
        </Card>
      ) : filtrados.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          Sin resultados para “{busqueda}”.
        </p>
      ) : (
        <ul className="divide-y divide-outline-variant rounded-xl border border-outline-variant bg-surface-container-lowest">
          {filtrados.map((usuario) => (
            <li
              key={usuario.id}
              className="flex min-h-[56px] flex-wrap items-center gap-3 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-on-surface">
                  {usuario.nombre}
                </p>
                <p className="truncate text-sm text-on-surface-variant">
                  {usuario.correo}
                </p>
              </div>
              <Badge className="bg-secondary-container text-on-secondary-container">
                {ETIQUETAS[usuario.rol]}
              </Badge>
              <Badge
                className={
                  usuario.activo
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-surface-container text-on-surface-variant"
                }
              >
                {usuario.activo ? "Activo" : "Inhabilitado"}
              </Badge>
              <Button
                variante="ghost"
                onClick={() => editar(usuario)}
                className="h-9 min-h-0 px-3 text-sm"
              >
                Editar
              </Button>
              <Button
                variante="secondary"
                onClick={() => void alternarActivo(usuario)}
                className="h-9 min-h-0 px-3 text-sm"
              >
                {usuario.activo ? "Deshabilitar" : "Activar"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
