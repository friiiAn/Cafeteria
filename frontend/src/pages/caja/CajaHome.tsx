import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/apiClient";
import { hoyISO } from "../../lib/utils";
import type { PedidoEntrega } from "../../types";
import { Card, CardBody } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

const INTERVALO_MS = 15000;

export function CajaHome() {
  const [pendientes, setPendientes] = useState<number | null>(null);

  useEffect(() => {
    let vivo = true;
    async function cargar(): Promise<void> {
      try {
        const data = await api.get<PedidoEntrega[]>("/caja/pedidos");
        if (vivo) {
          setPendientes(data.length);
        }
      } catch {
        /* silencioso: el contador no debe romper el inicio */
      }
    }
    void cargar();
    const timer = window.setInterval(() => void cargar(), INTERVALO_MS);
    return () => {
      vivo = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-on-surface">
          Cafetería ITSH · Caja
        </h1>
        <p className="text-sm text-on-surface-variant">{hoyISO()}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="bg-surface-container">
          <CardBody className="flex h-full flex-col gap-4">
            <div>
              <h2 className="font-heading text-lg font-bold text-on-surface">
                Capturar pedido
              </h2>
              <p className="text-sm text-on-surface-variant">
                Registra y cobra el pedido de mostrador en un solo paso.
              </p>
            </div>
            <Link to="/caja/nuevo" className="mt-auto">
              <Button className="w-full">Capturar pedido</Button>
            </Link>
          </CardBody>
        </Card>

        <Card className="bg-surface-container">
          <CardBody className="flex h-full flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-bold text-on-surface">
                  Entregas
                </h2>
                <p className="text-sm text-on-surface-variant">
                  Pedidos listos en espera de entrega.
                </p>
              </div>
              {pendientes !== null && (
                <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-danger px-2 text-sm font-bold text-on-danger">
                  {pendientes}
                </span>
              )}
            </div>
            <Link to="/caja/entregas" className="mt-auto">
              <Button variante="secondary" className="w-full">
                Ver entregas
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>

      <Card className="bg-surface-container">
        <CardBody className="flex flex-col items-center gap-2 py-10 text-center">
          <span aria-hidden="true" className="text-4xl">
            ☕
          </span>
          <p className="font-heading text-lg font-bold text-on-surface">
            ¡Buen día! Tu café, en buenas manos
          </p>
          <p className="text-sm text-on-surface-variant">
            Usa el menú lateral para moverte entre caja y entregas.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
