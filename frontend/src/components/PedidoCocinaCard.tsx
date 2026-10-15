import { useState } from "react";
import type { PedidoCocina } from "../types";
import { cn } from "../lib/utils";
import { Card, CardBody } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface PedidoCocinaCardProps {
  pedido: PedidoCocina;
  ocupado?: boolean;
  ahora?: number;
  onAvanzar?: (pedido: PedidoCocina) => void;
}

const COLOR_ESTADO: Record<string, string> = {
  Pagado: "bg-status-paid text-white",
  "En preparación": "bg-status-preparing text-white",
  Listo: "bg-status-ready text-white",
};

function hora(iso: string): string {
  return iso.replace("T", " ").slice(11, 16);
}

function minutosDesde(iso: string, ahora: number): number {
  const inicio = new Date(iso.replace(" ", "T")).getTime();
  return (ahora - inicio) / 60_000;
}

export function PedidoCocinaCard({
  pedido,
  ocupado = false,
  ahora,
  onAvanzar,
}: PedidoCocinaCardProps) {
  const [ahoraMs] = useState(() => ahora ?? Date.now());
  const etiquetaOrigen = pedido.tipo === "anticipado" ? "Anticipado" : "Mostrador";
  const transcurridos = Math.max(0, Math.floor(minutosDesde(pedido.creado_en, ahoraMs)));
  const retrasado = minutosDesde(pedido.fecha_recoleccion, ahoraMs) > 0;
  const listo = pedido.estado === "Listo";

  return (
    <Card className={cn("flex h-full flex-col", retrasado && "border-danger")}>
      <CardBody className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-heading text-3xl font-extrabold text-primary">
              #{pedido.id}
            </p>
            <p className="font-mono text-xl font-semibold text-on-surface">
              {pedido.numero}
            </p>
          </div>
          <Badge className={COLOR_ESTADO[pedido.estado] ?? "bg-surface-container text-on-surface-variant"}>
            {pedido.estado}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge className="bg-secondary-container text-on-secondary-container">
            {etiquetaOrigen}
          </Badge>
          {retrasado && (
            <span className="font-bold text-danger">¡Retrasado!</span>
          )}
        </div>

        <p className="text-sm text-on-surface-variant">
          {pedido.cliente_nombre ?? "Cliente en mostrador"} · {hora(pedido.creado_en)}
          {" · "}
          <span className="font-bold text-on-surface">
            recoge {hora(pedido.fecha_recoleccion)}
          </span>
        </p>

        <p className="text-xs text-on-surface-variant">
          {transcurridos <= 0 ? "Ahora" : `Hace ${transcurridos} min`}
        </p>

        <ul className="divide-y divide-outline-variant rounded-lg border border-outline-variant">
          {pedido.items.map((item) => (
            <li
              key={item.nombre}
              className="flex items-center gap-3 px-3 py-2 text-lg"
            >
              <span className="font-extrabold text-on-surface">
                {item.cantidad}×
              </span>
              <span className="text-on-surface">{item.nombre}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-1">
          {listo ? (
            <p className="text-center text-sm font-medium text-on-surface-variant">
              Listo — en espera de caja
            </p>
          ) : (
            <Button
              className="h-12 w-full text-base"
              disabled={ocupado}
              onClick={() => onAvanzar?.(pedido)}
            >
              {ocupado
                ? "Guardando…"
                : pedido.estado === "Pagado"
                  ? "Iniciar preparación"
                  : "Marcar listo"}
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
