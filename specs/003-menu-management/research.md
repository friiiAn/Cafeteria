# Research: Sprint 2 — Gestión y consulta del menú

**Feature**: `003-menu-management` | **Date**: 2026-10-13

## Decisiones técnicas

### 1. Precio en `menu_dia`, no en `platillo`

- **Decisión**: el precio se guarda por fecha en `menu_dia.precio`.
- **Razón**: permite congelar el precio del historial y cambiar precios día a día, como ya
  define `migrations/001_crear_esquema.sql`. Un pedido copia el precio a su detalle.
- **Alternativa descartada**: precio único en `platillo` (no permite cambios por fecha ni
  historial).

### 2. Idempotencia por fecha con clave única

- **Decisión**: `UNIQUE (fecha, platillo_id)` e inserción con `ON DUPLICATE KEY UPDATE`.
- **Razón**: evita duplicados y permite "upsert" del menú de una fecha.

### 3. Endpoint de consulta con filtro por fecha

- **Decisión**: `GET /api/menu?fecha=YYYY-MM-DD` (por defecto hoy) que hace JOIN con
  `platillo`.
- **Razón**: la consulta del cliente es la ruta caliente; un solo endpoint con índice
  `idx_menu_dia_fecha` responde rápido (SC-003).

### 4. RBAC en la gestión

- **Decisión**: las rutas de escritura usan `requireRole('administrador')`; la consulta del
  menú permite cualquier sesión (cliente/administrador).
- **Razón**: cumple FR-011 del sprint y FR-003 de 001.

### 5. Validación

- **Decisión**: esquemas `zod` para `platillo` (nombre requerido, precio numérico ≥ 0,
  fecha `YYYY-MM-DD`).
- **Razón**: FR-010 del sprint y FR-036 de 001.

### 6. Frontend

- **Decisión**: páginas admin (`PlatillosPage`, `MenuDiaPage`) y página cliente
  (`MenuPage`). La tarjeta de platillo muestra nombre, descripción, precio y control de
  cantidad (el control se activa en el Sprint 3); los no disponibles se muestran
  deshabilitados.

### 7. Estructura

- `backend/src/services/{platilloService,menuService}.ts`,
  `backend/src/controllers/{platilloController,menuController}.ts`,
  rutas `platillo.routes.ts` y `menu.routes.ts`.
- `frontend/src/pages/admin/{PlatillosPage,MenuDiaPage}.tsx`,
  `frontend/src/pages/clientes/MenuPage.tsx`, componente `PlatilloCard`.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| Consulta lenta en receso | Índice por fecha y respuesta plana de un solo SELECT con JOIN |
| Duplicados por fecha | `UNIQUE (fecha, platillo_id)` + upsert |
| Cambios no visibles | Sin caché en este sprint; la consulta siempre lee de la BD |
