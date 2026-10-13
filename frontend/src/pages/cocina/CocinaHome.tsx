import { Card, CardBody, CardTitle } from "../../components/ui/card";

export function CocinaHome() {
  return (
    <Card>
      <CardBody>
        <CardTitle>Pantalla de cocina</CardTitle>
        <p className="mt-2 text-on-surface-variant">
          Aquí se mostrarán los pedidos por preparar en un sprint posterior.
        </p>
      </CardBody>
    </Card>
  );
}
