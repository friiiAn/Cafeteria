import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="font-display text-3xl font-extrabold text-on-surface">
        Página no encontrada
      </h1>
      <p className="text-on-surface-variant">
        La ruta que buscas no existe.
      </p>
      <Link to="/" className="font-semibold text-primary">
        Volver al inicio
      </Link>
    </div>
  );
}
