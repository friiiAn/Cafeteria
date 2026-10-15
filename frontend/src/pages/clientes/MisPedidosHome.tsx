import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError } from "../../lib/apiClient";
import type { PedidoResumen } from "../../types";
import { Card, CardBody } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { PedidoCard } from "../../components/PedidoCard";

const INTERVALO_MS = 12000;

const ACTIVO = (estado: string): boolean =>
  estado !== "Entregado" && estado !== "Cancelado";

export function MisPedidosHome() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<PedidoResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const data = await api.get<PedidoResumen[]>("/pedidos");
        if (activo) {
          setPedidos(data);
          setError("");
        }
      } catch (err) {
        if (activo) {
          setError(
            err instanceof ApiError ? err.message : "Error al cargar tus pedidos",
          );
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }
    void cargar();
    const timer = window.setInterval(() => {
      void cargar();
    }, INTERVALO_MS);
    return () => {
      activo = false;
      window.clearInterval(timer);
    };
  }, [recarga]);

  const activos = useMemo(
    () => pedidos.filter((p) => ACTIVO(p.estado)).length,
    [pedidos],
  );

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-2xl font-bold text-on-surface">
          Mis pedidos
        </h1>
        {activos > 0 && (
          <Badge className="bg-primary-container text-on-primary-container">
            {activos}
          </Badge>
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
            onClick={() => setRecarga((n) => n + 1)}
          >
            Reintentar
          </Button>
        </div>
      )}

      {cargando ? (
        <p className="text-sm text-on-surface-variant">Cargando…</p>
      ) : pedidos.length === 0 ? (
        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="font-heading text-lg font-bold text-on-surface">
              Aún no has hecho pedidos
            </p>
            <p className="text-sm text-on-surface-variant">
              Cuando hagas un pedido anticipado aparecerá aquí.
            </p>
            <Link to="/menu">
              <Button>Ver el menú</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {pedidos.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              onPagar={(id) => navigate(`/pedido/${id}/pago`)}
            />
          ))}
        </div>
      )}

      {activos === 0 && pedidos.length > 0 && (
        <div className="fixed inset-x-0 bottom-14 z-30 border-t border-outline-variant bg-surface-container-lowest lg:bottom-0">
          <div className="mx-auto w-full max-w-5xl px-4 py-3">
            <Link to="/menu">
              <Button className="w-full">Nuevo pedido</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
