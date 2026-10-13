import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError } from "../../lib/apiClient";
import type { PedidoResumen } from "../../types";
import { Card, CardBody, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { PedidoCard } from "../../components/PedidoCard";

const INTERVALO_MS = 12000;

export function MisPedidosHome() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<PedidoResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

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
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-on-surface">
          Mis pedidos
        </h1>
        <p className="text-sm text-on-surface-variant">
          El estado se actualiza automáticamente cada {INTERVALO_MS / 1000} segundos.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}

      {cargando ? (
        <p className="text-on-surface-variant">Cargando…</p>
      ) : pedidos.length === 0 ? (
        <Card>
          <CardBody>
            <CardTitle>Aún no tienes pedidos</CardTitle>
            <p className="mt-2 text-on-surface-variant">
              Cuando hagas un pedido anticipado aparecerá aquí.
            </p>
            <Link to="/menu" className="mt-4 inline-block">
              <Button variante="secondary">Ver el menú</Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {pedidos.map((pedido) => (
            <PedidoCard
              key={pedido.id}
              pedido={pedido}
              onPagar={(id) => navigate(`/pago/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
