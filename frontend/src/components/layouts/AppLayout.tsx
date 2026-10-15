import { useCallback, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ETIQUETA_ROL, type PedidoEntrega, type PedidoResumen, type Rol } from "../../types";
import { api } from "../../lib/apiClient";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Drawer } from "../ui/drawer";
import { BottomBar, type BottomBarItem } from "../ui/bottom-bar";
import { NotificacionBell } from "../NotificacionBell";

interface Enlace {
  ruta: string;
  etiqueta: string;
  roles: Rol[];
  end?: boolean;
}

const ENLACES: Enlace[] = [
  { ruta: "/admin", etiqueta: "Inicio", roles: ["administrador"], end: true },
  { ruta: "/admin/usuarios", etiqueta: "Usuarios", roles: ["administrador"] },
  { ruta: "/admin/platillos", etiqueta: "Platillos", roles: ["administrador"] },
  { ruta: "/admin/menu", etiqueta: "Menú del día", roles: ["administrador"] },
  { ruta: "/caja", etiqueta: "Inicio", roles: ["cajero"], end: true },
  { ruta: "/caja/nuevo", etiqueta: "Capturar pedido", roles: ["cajero"] },
  { ruta: "/caja/entregas", etiqueta: "Entregas", roles: ["cajero"] },
  { ruta: "/cocina", etiqueta: "Pedidos", roles: ["cocinero"] },
  { ruta: "/menu", etiqueta: "Menú", roles: ["usuario"] },
  { ruta: "/mis-pedidos", etiqueta: "Mis pedidos", roles: ["usuario"] },
];

function useContadorEntregas(activo: boolean): number {
  const [contador, setContador] = useState(0);
  useEffect(() => {
    if (!activo) {
      return;
    }
    let vivo = true;
    async function cargar(): Promise<void> {
      try {
        const data = await api.get<PedidoEntrega[]>("/caja/pedidos");
        if (vivo) {
          setContador(data.length);
        }
      } catch {
        /* silencioso: el badge no debe romper la navegación */
      }
    }
    void cargar();
    const timer = window.setInterval(() => void cargar(), 15000);
    return () => {
      vivo = false;
      window.clearInterval(timer);
    };
  }, [activo]);
  return contador;
}

function usePedidoListo(activo: boolean): boolean {
  const [hayListo, setHayListo] = useState(false);
  useEffect(() => {
    if (!activo) {
      return;
    }
    let vivo = true;
    async function cargar(): Promise<void> {
      try {
        const data = await api.get<PedidoResumen[]>("/pedidos");
        if (vivo) {
          setHayListo(data.some((pedido) => pedido.estado === "Listo"));
        }
      } catch {
        /* silencioso */
      }
    }
    void cargar();
    const timer = window.setInterval(() => void cargar(), 15000);
    return () => {
      vivo = false;
      window.clearInterval(timer);
    };
  }, [activo]);
  return hayListo;
}

export function AppLayout() {
  const { usuario, logout } = useAuth();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const cerrar = useCallback(() => setMenuAbierto(false), []);

  useEffect(() => {
    setMenuAbierto((prev) => (prev ? false : prev));
  }, [location.pathname]);

  const esCajero = usuario?.rol === "cajero";
  const esCliente = usuario?.rol === "usuario";
  const contadorEntregas = useContadorEntregas(esCajero);
  const hayPedidoListo = usePedidoListo(esCliente);

  if (!usuario) {
    return null;
  }

  const enlaces = ENLACES.filter((enlace) => enlace.roles.includes(usuario.rol));

  const bottomItems: BottomBarItem[] =
    usuario.rol === "cajero"
      ? [
          { ruta: "/caja", etiqueta: "Caja", end: true },
          { ruta: "/caja/entregas", etiqueta: "Entregas", badge: contadorEntregas },
        ]
      : esCliente
        ? [
            { ruta: "/menu", etiqueta: "Menú" },
            {
              ruta: "/mis-pedidos",
              etiqueta: "Mis pedidos",
              badge: hayPedidoListo ? 1 : undefined,
            },
          ]
        : [];

  const contenido = (
    <>
      <div className="flex items-center gap-3 border-b border-outline-variant p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container font-display font-extrabold text-on-primary-container">
          {usuario.nombre.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-on-surface">
            {usuario.nombre}
          </p>
          <p className="text-xs text-on-surface-variant">
            {ETIQUETA_ROL[usuario.rol]}
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {enlaces.map((enlace) => (
          <NavLink
            key={enlace.ruta}
            to={enlace.ruta}
            end={enlace.end}
            className={({ isActive }) =>
              cn(
                "flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium",
                isActive
                  ? "bg-primary-container text-on-primary-container"
                  : "text-on-surface-variant hover:bg-surface-container",
              )
            }
          >
            {enlace.etiqueta}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-outline-variant p-3">
        <Button variante="ghost" onClick={logout} className="w-full justify-start">
          Cerrar sesión
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest lg:flex">
        {contenido}
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-outline-variant bg-surface-container-lowest">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              type="button"
              aria-label="Abrir menú"
              onClick={() => setMenuAbierto(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-on-surface hover:bg-surface-container lg:hidden"
            >
              <span aria-hidden="true" className="text-xl leading-none">
                ≡
              </span>
            </button>
            <span className="font-display text-lg font-extrabold text-primary">
              Cafetería ITSH
            </span>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-on-surface">
                  {usuario.nombre}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {ETIQUETA_ROL[usuario.rol]}
                </p>
              </div>
              {esCliente && <NotificacionBell />}
              <Button variante="ghost" onClick={logout} className="px-3">
                Salir
              </Button>
            </div>
          </div>
        </header>

        <main
          className={cn(
            "mx-auto w-full max-w-5xl flex-1 px-4 py-6",
            bottomItems.length > 0 && "pb-24 lg:pb-6",
          )}
        >
          <Outlet />
        </main>
      </div>

      <Drawer abierto={menuAbierto} onCerrar={cerrar} etiqueta="Menú de navegación">
        {contenido}
      </Drawer>

      {bottomItems.length > 0 && <BottomBar items={bottomItems} />}
    </div>
  );
}
