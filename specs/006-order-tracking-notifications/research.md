# Research: Sprint 5 — Seguimiento y notificaciones

**Feature**: `006-order-tracking-notifications` | **Date**: 2026-10-13

## Decisiones técnicas

### 1. Seguimiento por sondeo (refetch)

- **Decisión**: `MisPedidosHome` y el detalle usan `GET /api/pedidos` / `:id` con refetch
  periódico (10–15 s); opcional SSE `GET /api/pedidos/stream` como mejora.
- **Razón**: simplicidad; SC-001 sin infraestructura de push.

### 2. Modelo de notificación en base de datos

- **Decisión**: tabla `notificacion` con `estado_envio` (`pendiente`/`enviado`/`fallido`),
  `intentos`, `tipo` y `pedido_id`/`usuario_id`.
- **Razón**: FR-007/FR-011; permite reintentos y nunca pierde el aviso.

### 3. Disparo de notificación al pasar a `Listo`

- **Decisión**: en `cocinaService.marcarListo`, tras la transición, insertar `notificacion`
  en la misma transacción y **después** (fuera o en cola) intentar el envío.
- **Razón**: FR-004/FR-011; el cambio de estado no depende del correo.

### 4. Abstracción de correo (`Mailer`)

- **Decisión**: interfaz `Mailer` con `send()`; `ConsoleMailer` en dev y `SmtpMailer` en
  producción, elegido por `MAIL_PROVIDER`.
- **Razón**: FR-005/FR-006; testeable y sustituible.

### 5. Reintentos de envío

- **Decisión**: cola ligera: `enviarNotificacionesPendientes()` marca `intentos++` y
  `estado_envio`; un temporizador/worker simple reintenta las `pendiente`/`fallido` con tope
  de intentos.
- **Razón**: FR-006/FR-007 sin infraestructura de mensajería pesada.

### 6. Entrega física (`Listo → Entregado`)

- **Decisión**: `POST /api/caja/pedidos/:id/entregar` con la misma máquina de estados de
  `estadoService`.
- **Razón**: FR-008; cierre del ciclo.

### 7. Seguridad de recursos

- **Decisión**: todas las consultas de pedidos/notificaciones filtran por `usuario_id`;
  la entrega requiere cajera/admin.
- **Razón**: FR-009/FR-004.

### 8. Frontend

- **Decisión**: `MisPedidosHome` con lista + timeline de estados y badge de estado; indicador
  de "pedido listo". Reutiliza `PedidoCard`.
- **Razón**: ruta `/mis-pedidos` de `docs/reglas.md` §2.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| Correo caído | Reintentos con tope + estado `fallido`; el flujo del pedido no se bloquea |
| Notificación perdida | Fila persistida antes del envío; worker reintenta |
| Consultas ajenas | Filtrar por `usuario_id`; `403` |
| Carga de refetch | Intervalo moderado (10–15 s) y consultas indexadas |
