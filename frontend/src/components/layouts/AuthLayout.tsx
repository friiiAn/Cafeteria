import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="font-display text-2xl font-extrabold text-primary">
            Cafetería ITSH
          </p>
          <p className="text-sm text-on-surface-variant">Pedidos anticipados</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
