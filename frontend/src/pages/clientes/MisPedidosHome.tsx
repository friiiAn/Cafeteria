import { Card, CardBody, CardTitle } from "../../components/ui/card";

export function MisPedidosHome() {
  return (
    <Card>
      <CardBody>
        <CardTitle>Mis pedidos</CardTitle>
        <p className="mt-2 text-on-surface-variant">
          El seguimiento de pedidos estará disponible en un sprint posterior.
        </p>
      </CardBody>
    </Card>
  );
}
