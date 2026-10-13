import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { RUTA_POR_ROL, type Rol } from "../types";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: Rol[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center text-on-surface-variant">
        Cargando…
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" state={{ desde: location.pathname }} replace />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to={RUTA_POR_ROL[usuario.rol]} replace />;
  }

  return <>{children}</>;
}
