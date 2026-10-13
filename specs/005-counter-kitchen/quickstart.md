# Quickstart: Sprint 4 — Ventanilla y cocina

**Feature**: `005-counter-kitchen` | **Date**: 2026-10-13

## Prerrequisitos

- Sprints 1–3 completados.
- Usuarios de prueba con roles `cajero` y `cocinero` (seed de usuarios).
- Menú del día publicado (Sprint 2).

## Levantar

```bash
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

## Flujo manual de verificación

1. Iniciar sesión como **cajero** y abrir `/caja`.
2. Armar un pedido de mostrador y cobrarlo en efectivo → pasa a `Pagado`.
3. Iniciar sesión como **cocinero** y abrir `/cocina`.
4. Verificar que el pedido aparece ordenado por hora de recolección.
5. Iniciarlo → `En preparación`; terminarlo → `Listo`.
6. Intentar iniciar un pedido ya `Listo` → error `409`.
7. Intentar cobrar dos veces el mismo pedido → error `409`.
8. Como **cajero/cocinero**, intentar acceder a rutas del otro rol → `403`.

## Verificación de base de datos

```sql
SELECT p.numero, e.nombre AS estado
FROM pedido p JOIN estado_pedido e ON e.id = p.estado_id
WHERE p.tipo = 'mostrador' ORDER BY p.id DESC LIMIT 5;

SELECT * FROM pedido_estado_historial ORDER BY id DESC LIMIT 10;
```

## Pruebas

```bash
cd backend && npm test && npm run typecheck
cd frontend && npm test && npm run typecheck
```

## Criterios de aceptación del sprint

- Pedido de mostrador creado y cobrado; pasa a `Pagado` sin ventana de 10 minutos.
- Pedidos `Pagado` visibles en cocina, ordenados por hora de recolección.
- Transiciones `Pagado → En preparación → Listo` con historial.
- Transiciones inválidas rechazadas con `409`.
