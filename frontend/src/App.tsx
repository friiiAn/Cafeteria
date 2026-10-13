import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { RUTA_POR_ROL } from "./types";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/layouts/AppLayout";
import { AuthLayout } from "./components/layouts/AuthLayout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { UsuariosPage } from "./pages/admin/UsuariosPage";
import { PlatillosPage } from "./pages/admin/PlatillosPage";
import { MenuDiaPage } from "./pages/admin/MenuDiaPage";
import { CajaPage } from "./pages/caja/CajaPage";
import { CobroPage } from "./pages/caja/CobroPage";
import { CocinaPage } from "./pages/cocina/CocinaPage";
import { MenuPage } from "./pages/clientes/MenuPage";
import { MisPedidosHome } from "./pages/clientes/MisPedidosHome";
import { CarritoPage } from "./pages/clientes/CarritoPage";
import { PagoPage } from "./pages/clientes/PagoPage";

function InicioRedirect() {
  const { usuario, cargando } = useAuth();
  if (cargando) {
    return null;
  }
  return <Navigate to={usuario ? RUTA_POR_ROL[usuario.rol] : "/login"} replace />;
}

export function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={["administrador"]}>
              <UsuariosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/platillos"
          element={
            <ProtectedRoute roles={["administrador"]}>
              <PlatillosPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/menu"
          element={
            <ProtectedRoute roles={["administrador"]}>
              <MenuDiaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/caja"
          element={
            <ProtectedRoute roles={["cajero", "administrador"]}>
              <CajaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/caja/:id/cobro"
          element={
            <ProtectedRoute roles={["cajero", "administrador"]}>
              <CobroPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cocina"
          element={
            <ProtectedRoute roles={["cocinero", "administrador"]}>
              <CocinaPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/menu"
          element={
            <ProtectedRoute roles={["usuario", "administrador"]}>
              <MenuPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-pedidos"
          element={
            <ProtectedRoute roles={["usuario", "administrador"]}>
              <MisPedidosHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/carrito"
          element={
            <ProtectedRoute roles={["usuario", "administrador"]}>
              <CarritoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pago/:id"
          element={
            <ProtectedRoute roles={["usuario", "administrador"]}>
              <PagoPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/" element={<InicioRedirect />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
