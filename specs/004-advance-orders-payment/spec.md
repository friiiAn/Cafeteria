### Functional Requirements

- **FR-001**: **Cuando** un cliente arme un pedido anticipado, el sistema deberá permitirle
  seleccionar uno o más platillos y la cantidad de cada uno. (FR-015.)
- **FR-002**: **Cuando** el cliente agregue, quite o modifique platillos o cantidades, el
  sistema deberá calcular y mostrar el total antes de que el cliente confirme. (FR-016.)
- **FR-003**: (FR-017.)
  - (a) **Cuando** un cliente confirme un pedido anticipado, el sistema deberá verificar que
    la hora de recogida sea al menos 10 minutos posterior a la hora actual.
  - (b) **Si** la hora de recogida es menos de 10 minutos posterior a la hora actual,
    **entonces** el sistema deberá rechazar el pedido y mostrar un mensaje que explique el
    margen mínimo.
- **FR-004**: **Si** un pedido incluye un platillo no disponible, **entonces** el sistema
  deberá rechazar la creación del pedido completo. (FR-018.)
- **FR-005**: **Cuando** el cliente confirme un pedido anticipado, el sistema deberá
  solicitar el pago mediante el servicio de pago en línea como parte del mismo flujo.
  (FR-019.)
- **FR-006**: El sistema no deberá almacenar datos sensibles de tarjeta; deberá registrar
  únicamente la información necesaria para identificar y validar la transacción. (FR-020.)
- **FR-007**: **Cuando** el proveedor de pago confirme el cobro de un pedido en estado
  `Pendiente`, el sistema deberá cambiar el estado del pedido a `Pagado` y registrar el
  cambio en el historial de estados. (FR-021.)
- **FR-008**: El sistema deberá mantener cada pedido en un estado válido en todo momento; en
  este sprint los estados válidos son `Pendiente` y `Pagado`. (FR-022.)
- **FR-009**: **Cuando** se cree un pedido, el sistema deberá guardar en su detalle el precio
  unitario vigente del menú; **cuando** el menú cambie después, el sistema no deberá alterar
  el precio unitario de los pedidos ya creados. (FR-013/precios congelados.)
- **FR-010**: **Cuando** se cree un pedido, el sistema deberá asignarle un folio único
  (`numero`).
- **FR-011**: **Mientras** un pedido tenga un pago registrado, el sistema deberá rechazar
  cualquier intento de registrar otro pago para ese pedido.
- **FR-012**: **Cuando** el sistema reciba los datos de un pedido, deberá validarlos antes de
  almacenarlos. (FR-036.)
- **FR-013**: El sistema no deberá exponer al cliente información del proveedor de pago más
  allá del resultado de la transacción.