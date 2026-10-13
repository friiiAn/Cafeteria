import type { MenuEntrada } from "../types";
import { cn, formatoMoneda } from "../lib/utils";
import { Card, CardBody } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface PlatilloCardProps {
  entrada: MenuEntrada;
  onSeleccionar?: (entrada: MenuEntrada) => void;
}

export function PlatilloCard({ entrada, onSeleccionar }: PlatilloCardProps) {
  const seleccionable = entrada.disponible && Boolean(onSeleccionar);

  return (
    <Card className={cn("h-full", !entrada.disponible && "opacity-60")}>
      <CardBody className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold text-on-surface">
            {entrada.nombre}
          </h3>
          <span className="whitespace-nowrap font-semibold text-primary">
            {formatoMoneda(entrada.precio)}
          </span>
        </div>

        {entrada.categoria && (
          <p className="text-xs font-medium tracking-wide text-on-surface-variant uppercase">
            {entrada.categoria}
          </p>
        )}

        {entrada.descripcion && (
          <p className="text-sm text-on-surface-variant">{entrada.descripcion}</p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2">
          {entrada.especial && (
            <Badge className="bg-tertiary-container text-on-tertiary-container">
              Especial del día
            </Badge>
          )}
          {!entrada.disponible && (
            <Badge className="bg-surface-container text-on-surface-variant">
              No disponible
            </Badge>
          )}
          {onSeleccionar && (
            <Button
              variante="secondary"
              disabled={!seleccionable}
              onClick={() => onSeleccionar(entrada)}
              className="ml-auto h-9 min-h-0 px-4 text-sm"
            >
              Agregar
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
