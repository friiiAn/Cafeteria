import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../../lib/apiClient";
import { formatoMoneda, hoyISO } from "../../lib/utils";
import type { MenuEntrada, Platillo, Usuario } from "../../types";
import { Card, CardBody } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

interface Conteos {
  usuarios: number;
  platillos: number;
  menu: number;
}

export function AdminHome() {
  const [conteos, setConteos] = useState<Conteos | null>(null);
  const [menu, setMenu] = useState<MenuEntrada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      setCargando(true);
      try {
        const [usuarios, platillos, entradas] = await Promise.all([
          api.get<Usuario[]>("/usuarios"),
          api.get<Platillo[]>("/platillos"),
          api.get<MenuEntrada[]>(`/menu?fecha=${hoyISO()}`),
        ]);
        if (activo) {
          setConteos({
            usuarios: usuarios.filter((u) => u.activo).length,
            platillos: platillos.length,
            menu: entradas.length,
          });
          setMenu(entradas);
          setError("");
        }
      } catch (err) {
        if (activo) {
          setError(err instanceof ApiError ? err.message : "Error al cargar el panel");
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

  const reintentar = useCallback(() => setRecarga((n) => n + 1), []);

  if (cargando) {
    return <p className="text-sm text-on-surface-variant">Cargando panel…</p>;
  }

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-danger bg-danger-container px-4 py-3"
      >
        <p className="text-sm font-medium text-on-danger-container">{error}</p>
        <Button
          variante="secondary"
          className="h-9 min-h-0 px-4 text-sm"
          onClick={reintentar}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  const tarjetas = [
    { ruta: "/admin/usuarios", titulo: "Usuarios", valor: conteos?.usuarios ?? 0, texto: "activos" },
    { ruta: "/admin/platillos", titulo: "Platillos", valor: conteos?.platillos ?? 0, texto: "en catálogo" },
    { ruta: "/admin/menu", titulo: "Menú del día", valor: conteos?.menu ?? 0, texto: "publicados hoy" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-on-surface">
          Panel de administración
        </h1>
        <p className="text-sm text-on-surface-variant">{hoyISO()}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {tarjetas.map((tarjeta) => (
          <Link key={tarjeta.ruta} to={tarjeta.ruta}>
            <Card className="h-full bg-surface-container">
              <CardBody className="space-y-2">
                <p className="text-sm font-medium text-on-surface-variant">
                  {tarjeta.titulo}
                </p>
                <p className="font-heading text-4xl font-extrabold text-primary">
                  {tarjeta.valor}
                </p>
                <p className="text-sm text-on-surface-variant">{tarjeta.texto}</p>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardBody className="space-y-3">
          <h2 className="font-heading text-lg font-bold text-on-surface">
            Menú de hoy
          </h2>
          {menu.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              No hay platillos publicados para hoy.
            </p>
          ) : (
            <ul className="divide-y divide-outline-variant">
              {menu.map((entrada) => (
                <li
                  key={entrada.id}
                  className="flex flex-wrap items-center gap-3 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-on-surface">
                      {entrada.nombre}
                    </p>
                    <p className="truncate text-sm text-on-surface-variant">
                      {entrada.categoria ?? "Sin categoría"}
                    </p>
                  </div>
                  {entrada.especial && (
                    <Badge className="bg-tertiary-container text-on-tertiary-container">
                      Especial
                    </Badge>
                  )}
                  {!entrada.disponible && (
                    <Badge className="bg-surface-container text-on-surface-variant">
                      No disponible
                    </Badge>
                  )}
                  <span className="font-bold text-primary">
                    {formatoMoneda(entrada.precio)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
