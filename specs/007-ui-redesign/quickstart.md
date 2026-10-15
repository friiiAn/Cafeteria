# Quickstart: Sprint 7 — Rediseño UI/UX por rol

**Feature**: `007-ui-redesign` | **Date**: 2026-10-14

## Prerrequisitos

- Sprints 1–5 completados y migraciones `001`–`004` aplicadas.
- Variables de entorno de backend y frontend ya configuradas.
- No se requieren migraciones nuevas.

## Levantar

```bash
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

## Flujo manual de verificación

1. **Navegación**: iniciar sesión con cada rol; verificar drawer (todos) y bottom
   bar (caja y cliente); resaltar activo; cerrar sesión desde el drawer.
2. **Cocina**: con pedidos `Pagado`/`En preparación`, abrir `/cocina`; ver folio,
   número, badge, chip de origen, cliente, hora de registro y "recoge HH:MM";
   avanzar con un toque; ver "act. hace X s"; simular retraso → "¡Retrasado!".
3. **Caja**: en `/caja`, capturar pedido con búsqueda/chips/stepper; revisar
   resumen y cobrar con un solo botón (efectivo); ver folio; abrir Entregas y
   entregar/cancelar.
4. **Admin**: en `/admin`, ver conteos; crear/editar usuario, platillo y menú del
   día; probar estados vacío/error.
5. **Cliente**: en `/menu`, buscar y filtrar; armar carrito; ir a
   `/pedido/confirmar` (regla de 10 min); pagar en `/pedido/:id/pago`; ver
   `/pedido/:id/confirmacion` con folio; ver "¡Listo para recoger!" en
   `/mis-pedidos`.
6. **Rutas antiguas**: entrar a `/carrito` y `/pago/1` → redirigen.

## Verificación de base de datos

```sql
SELECT p.id, p.numero, e.nombre AS estado, p.cliente_nombre, p.creado_en
FROM pedido p JOIN estado_pedido e ON e.id = p.estado_id
WHERE e.nombre = 'Listo' ORDER BY p.creado_en DESC;
```

## Pruebas

```bash
cd backend && npm test && npm run typecheck
cd frontend && npm test && npm run typecheck && npm run lint
```

## Criterios de aceptación del sprint

- Navegación por drawer (todos) y bottom bar (caja y cliente) en su lugar.
- Cocina muestra folio, cliente, horas y tiempo; avance de un toque.
- Caja captura y cobra en un solo paso (efectivo) y entrega pedidos listos.
- Admin tiene landing con conteos y las tres pantallas rediseñadas.
- Cliente completa el flujo con las rutas `/pedido/*` y la confirmación con folio.
- Backend y frontend en verde (tests, typecheck, lint).
