import { useEffect, useState, type FormEvent } from "react";
import { api, ApiError } from "../../lib/apiClient";
import type { Rol, Usuario } from "../../types";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

const ROLES_OPERATIVOS: Rol[] = ["cajero", "cocinero", "administrador"];

const ETIQUETAS: Record<Rol, string> = {
  administrador: "Administrador",
  cajero: "Cajero",
  cocinero: "Cocinero",
  usuario: "Cliente",
};

export function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<Rol>("cajero");
  const [enviando, setEnviando] = useState(false);

  async function cargar() {
    setCargando(true);
    try {
      setUsuarios(await api.get<Usuario[]>("/usuarios"));
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
        const lista = await api.get<Usuario[]>("/usuarios");
        if (activo) {
          setUsuarios(lista);
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

  async function crear(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMensaje("");
    setEnviando(true);
    try {
      await api.post("/usuarios", { nombre, correo, password, rol });
      setNombre("");
      setCorreo("");
      setPassword("");
      setRol("cajero");
      setMensaje("Usuario creado correctamente");
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo crear");
    } finally {
      setEnviando(false);
    }
  }

  async function alternarActivo(usuario: Usuario) {
    setError("");
    try {
      await api.put(`/usuarios/${usuario.id}`, { activo: !usuario.activo });
      await cargar();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo actualizar");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Nuevo usuario operativo</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={crear} className="grid gap-4 sm:grid-cols-2" noValidate>
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
            <div className="sm:col-span-2">
              <Button type="submit" disabled={enviando}>
                {enviando ? "Creando…" : "Crear usuario"}
              </Button>
            </div>
          </form>
          {error && (
            <p role="alert" className="mt-3 text-sm font-medium text-danger">
              {error}
            </p>
          )}
          {mensaje && (
            <p className="mt-3 text-sm font-medium text-primary">{mensaje}</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios operativos</CardTitle>
        </CardHeader>
        <CardBody>
          {cargando ? (
            <p className="text-on-surface-variant">Cargando…</p>
          ) : (
            <ul className="divide-y divide-outline-variant">
              {usuarios.map((usuario) => (
                <li
                  key={usuario.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-on-surface">
                      {usuario.nombre}
                    </p>
                    <p className="truncate text-sm text-on-surface-variant">
                      {usuario.correo} · {ETIQUETAS[usuario.rol]}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        usuario.activo
                          ? "bg-primary-container text-on-primary-container"
                          : "bg-surface-container text-on-surface-variant"
                      }
                    >
                      {usuario.activo ? "Activo" : "Inactivo"}
                    </Badge>
                    <Button
                      variante="secondary"
                      onClick={() => alternarActivo(usuario)}
                      className="h-9 min-h-0 px-3 text-sm"
                    >
                      {usuario.activo ? "Desactivar" : "Activar"}
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
