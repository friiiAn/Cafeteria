import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ETIQUETA_ROL, type Rol } from "../../types";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

interface Enlace {
  ruta: string;
  etiqueta: string;
  roles: Rol[];
}

const ENLACES: Enlace[] = [
  { ruta: "/admin", etiqueta: "Usuarios", roles: ["administrador"] },
  { ruta: "/admin/platillos", etiqueta: "Platillos", roles: ["administrador"] },
  { ruta: "/admin/menu", etiqueta: "Menú del día", roles: ["administrador"] },
  { ruta: "/caja", etiqueta: "Caja", roles: ["cajero"] },
  { ruta: "/cocina", etiqueta: "Cocina", roles: ["cocinero"] },
  { ruta: "/menu", etiqueta: "Menú", roles: ["usuario"] },
  { ruta: "/mis-pedidos", etiqueta: "Mis pedidos", roles: ["usuario"] },
];

export function AppLayout() {
  const { usuario, logout } = useAuth();
  if (!usuario) {
    return null;
  }

  const enlaces = ENLACES.filter((enlace) => enlace.roles.includes(usuario.rol));

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-outline-variant bg-surface-container-lowest">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-4 py-3">
          <span className="font-display text-lg font-extrabold text-primary">
            Cafetería ITSH
          </span>
          <nav className="flex flex-1 gap-1 overflow-x-auto">
            {enlaces.map((enlace) => (
              <NavLink
                key={enlace.ruta}
                to={enlace.ruta}
                end={enlace.ruta === "/admin"}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap",
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
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-on-surface">{usuario.nombre}</p>
            <p className="text-xs text-on-surface-variant">
              {ETIQUETA_ROL[usuario.rol]}
            </p>
          </div>
          <Button variante="ghost" onClick={logout} className="px-3">
            Salir
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
