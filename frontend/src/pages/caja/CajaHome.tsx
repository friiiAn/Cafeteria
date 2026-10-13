import { Card, CardBody, CardTitle } from "../../components/ui/card";

export function CajaHome() {
  return (
    <Card>
      <CardBody>
        <CardTitle>Módulo de caja</CardTitle>
        <p className="mt-2 text-on-surface-variant">
          La captura y cobro de pedidos de mostrador estará disponible en el
          siguiente sprint.
        </p>
      </CardBody>
    </Card>
  );
}
