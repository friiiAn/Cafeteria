# Research: Sprint 7 — Rediseño UI/UX por rol

**Feature**: `007-ui-redesign` | **Date**: 2026-10-14

## Decisiones técnicas

### 1. Shell de navegación único parametrizado por rol

- **Decisión**: mantener un solo `AppLayout` y definir una lista `ENLACES` por rol
  que alimenta el drawer y la bottom bar. No crear layouts por rol.
- **Razón**: §VII (evitar duplicación); el patrón visual es idéntico y solo cambia
  el conjunto de enlaces y si hay bottom bar.
- **Alternativa descartada**: layouts separados por rol (duplicarían header,
  logout y lógica de sesión).

### 2. Drawer y bottom bar sin dependencias

- **Decisión**: implementar `ui/drawer.tsx` y `ui/bottom-bar.tsx` con React
  (estado `open`), `createPortal` opcional a `document.body`, Tailwind y cierre
  por overlay/`Esc`.
- **Razón**: §VII prohíbe librerías innecesarias; Radix/shadcn `Sheet` no está
  instalado.
- **Accesibilidad**: `role="dialog"`, `aria-modal`, foco inicial y cierre por
  teclado; en escritorio el drawer es un panel fijo (`lg:` visible, sin overlay).

### 3. Chips y Stepper reutilizables

- **Decisión**: extraer `components/Stepper.tsx` (hoy duplicado en `PlatilloCard`
  y `CarritoPage`) con botones de 44 px; `ui/chip.tsx` para categorías con estado
  seleccionado.
- **Razón**: DRY (§VII) y área táctil ≥ 44 px (FR-019).

### 4. Reorganización del flujo del cliente con redirects

- **Decisión**: rutas nuevas `/pedido/confirmar`, `/pedido/:id/pago`,
  `/pedido/:id/confirmacion`; `<Navigate>` desde `/carrito` y `/pago/:id`.
- **Razón**: FR-003/FR-014; conserva enlaces y atajos previos.
- **Detalle**: la confirmación consulta el pedido al montar (fuente de verdad del
  servidor); tras pagar, redirige a `/pedido/:id/confirmacion`.

### 5. Pago simulado sin captura de tarjeta

- **Decisión**: la `PagoPage` no muestra campo de token; usa el token simulado
  válido por defecto y permite forzar el fallo con un parámetro oculto
  (`?demo=fail`) para demos.
- **Razón**: FR-016/FR-012 (no capturar datos de tarjeta); conserva la vía de
  demostración del rechazo.
- **Alternativa descartada**: campo de token visible (contradice FR-012).

### 6. Campos nuevos en backend (solo lectura)

- **Decisión**: `listarParaCocina` añade `creado_en` y
  `COALESCE(p.cliente_nombre, u.nombre)` con `LEFT JOIN usuario`; `listarListos`
  añade `creado_en` e `items` (reutilizando `listarItemsDePedidos`).
- **Razón**: FR-020; las vistas de cocina y entregas necesitan estos datos y hoy
  no se exponen. **Sin migración** (`creado_en` existe desde el Sprint 5).
- **Impacto**: contratos de `GET /api/cocina/pedidos` y `GET /api/caja/pedidos`
  ampliados (compatible hacia atrás: se agregan campos).

### 7. Colores de estado con tokens `status-*`

- **Decisión**: los badges de estado usan las variables `--color-status-*` (ya
  definidas en `index.css`, hoy sin uso) en lugar de los `*-container`.
- **Razón**: FR-018; `docs/DESIGN.md` define colores de estado con texto blanco y
  los tokens ya existen.

### 8. Sondeo con feedback

- **Decisión**: cocina sondea cada 4 s y expone "act. hace X s"; tras 2 fallos
  consecutivos muestra "Sin conexión — reintentando…". Caja (entregas) mantiene
  sondeo moderado.
- **Razón**: FR-006/SC-S4-03; sin infraestructura de push.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| Regresión de navegación al reemplazar tabs | Refactor aislado en la Fase 1 con pruebas de rutas por rol |
| Endpoints de conteo del admin costosos | Se consultan una vez al montar la landing; sin sondeo en admin |
| Confusión de métodos de pago tras quitar tarjeta | El CTA único envía `efectivo`; `CobroPage` queda como fallback en efectivo |
| Ruptura de enlaces antiguos | Redirects `<Navigate>` desde `/carrito` y `/pago/:id` |
| Componentes a mano sin accesibilidad | `role="dialog"`, `aria-modal`, cierre por teclado y foco |
