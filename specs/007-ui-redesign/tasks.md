---

description: "Task list for Sprint 7 — Rediseño UI/UX por rol"
---

# Tasks: Sprint 7 — Rediseño UI/UX por rol

**Input**: Design documents from `specs/007-ui-redesign/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

**Tests**: incluidas (constitución §VIII) para los campos nuevos de backend y para
los componentes/rutas de UI críticos.

**Organization**: las tareas se agrupan por historia de usuario para permitir
implementación y prueba independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: US1..US5
- Cada tarea incluye la ruta exacta del archivo

## Path Conventions

- Backend: `backend/src/`, `backend/tests/`
- Frontend: `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: preparar utilidades compartidas del sistema de diseño.

- [x] T001 Revisar y, si faltan, añadir utilidades tipográficas (`stat-lg`, `font-heading`) en `frontend/src/index.css` usando tokens existentes
- [x] T002 [P] Confirmar tokens `--color-status-*` en `frontend/src/index.css` y documentar su uso para badges de estado

---

## Phase 2: Foundational (US1 — Navegación por rol) 🎯

**Purpose**: shell de navegación (drawer + bottom bar) del que dependen todas las
pantallas.

**⚠️ CRITICAL**: ninguna otra historia puede cerrarse sin este shell.

### Tests for US1

- [x] T003 [P] [US1] Test de rutas por rol y redirects en `frontend/src/App.test.tsx`
- [ ] T004 [P] [US1] Test de navegación del drawer (apertura/cierre, activo, logout) en `frontend/src/components/ui/Drawer.test.tsx`

### Implementation for US1

- [x] T005 [P] [US1] Crear `frontend/src/components/ui/drawer.tsx` (panel lateral, overlay, cierre por `Esc`/click, `role="dialog"`, panel fijo en `lg`)
- [x] T006 [P] [US1] Crear `frontend/src/components/ui/bottom-bar.tsx` (2–3 pestañas, badge de contador, altura ≥ 56 px)
- [x] T007 [P] [US1] Crear `frontend/src/components/ui/chip.tsx` (chip de categoría con estado seleccionado)
- [x] T008 [P] [US1] Extraer `frontend/src/components/Stepper.tsx` (botones 44 px, cantidad 0–99, `−` deshabilitado en 0)
- [x] T009 [US1] Refactorizar `frontend/src/components/layouts/AppLayout.tsx`: definición `ENLACES` por rol, header con hamburguesa, drawer y bottom bar
- [x] T010 [US1] Reemplazar el stepper inline por `Stepper` en `frontend/src/components/PlatilloCard.tsx`
- [x] T011 [US1] Modificar `frontend/src/App.tsx`: registrar rutas nuevas por rol y redirects `/carrito`→`/pedido/confirmar`, `/pago/:id`→`/pedido/:id/pago`
- [x] T012 [US1] Integrar `NotificacionBell` en el drawer del cliente (badge de "listo") en `frontend/src/components/layouts/AppLayout.tsx`

**Checkpoint**: la navegación por rol funciona; las rutas protegidas siguen vigentes.

---

## Phase 3: US2 — Tablero de cocina (KDS) (Priority: P1)

**Goal**: cocina con tarjeta KDS (folio, cliente, horas, tiempo) y avance de un toque.

**Independent Test**: abrir `/cocina` con pedidos activos y avanzarlos.

### Tests for US2

- [x] T013 [P] [US2] Test de campos nuevos en `backend/tests/integration/cocina.test.ts` (cliente_nombre, creado_en)
- [x] T014 [P] [US2] Test de la tarjeta KDS (retrasado, CTA por estado) en `frontend/src/components/PedidoCocinaCard.test.tsx`

### Implementation for US2

- [x] T015 [US2] Extender `listarParaCocina` en `backend/src/db/pedidoRepository.ts` con `creado_en` y `COALESCE(p.cliente_nombre, u.nombre)` (LEFT JOIN `usuario`)
- [x] T016 [US2] Extender `frontend/src/types.ts` y `backend/src/types/pedido.ts` con `cliente_nombre`/`creado_en` en `PedidoCocina`
- [x] T017 [US2] Propagar los campos en `backend/src/services/cocinaService.ts`
- [x] T018 [P] [US2] Crear `frontend/src/components/PedidoCocinaCard.tsx` (folio grande, número `font-mono`, badge `status-*`, chip de origen, horas, tiempo transcurrido/"¡Retrasado!", CTA o "en espera de caja")
- [x] T019 [US2] Rediseñar `frontend/src/pages/cocina/CocinaPage.tsx`: header con contador + "act. hace X s" + "Sin conexión — reintentando…"; sondeo 4 s; grid `sm:grid-cols-2 lg:grid-cols-3`; estados carga/vacío/error/conflicto
- [x] T020 [US2] Marcar la tarjeta como "ocupada" mientras se procesa el avance en `frontend/src/pages/cocina/CocinaPage.tsx`

**Checkpoint**: cocina operativa de forma independiente.

---

## Phase 4: US3 — Operación de caja (Priority: P1)

**Goal**: panel de caja, captura (búsqueda/chips/stepper), cobro en un paso y entregas.

**Independent Test**: capturar, cobrar y entregar un pedido mostrador.

### Tests for US3

- [x] T021 [P] [US3] Test de campos nuevos en `backend/tests/integration/entrega.test.ts` (`creado_en`, `items`)
- [x] T022 [P] [US3] Test del flujo de caja (carrito → cobro en un paso) en `frontend/src/pages/caja/Caja.test.tsx`

### Implementation for US3

- [x] T023 [US3] Extender `listarListos` en `backend/src/db/pedidoRepository.ts` con `creado_en` e `items` (reutilizar `listarItemsDePedidos`)
- [x] T024 [US3] Extender `frontend/src/types.ts` y `backend/src/types/pedido.ts` con `creado_en`/`items` en `PedidoEntrega`
- [x] T025 [US3] Propagar los campos en `backend/src/services/pedidoService.ts` (`listarParaEntrega`)
- [x] T026 [P] [US3] Crear `frontend/src/pages/caja/CajaHome.tsx` (acción "Capturar pedido" + módulo Entregas con contador + bienvenida)
- [x] T027 [P] [US3] Crear `frontend/src/pages/caja/NuevoPedidoPage.tsx` (nombre cliente, búsqueda en vivo, chips de categoría, `PlatilloCard` con stepper, barra flotante)
- [x] T028 [US3] Ajustar `frontend/src/pages/caja/CobroPage.tsx` como resumen de cobro y **fallback** efectivo en `/caja/:id/cobro`: CTA único "Registrar y cobrar", éxito con folio `font-mono`, reintento/cancelar
- [x] T029 [US3] Crear `frontend/src/pages/caja/EntregasPage.tsx` (folio, hora de registro, cliente, partidas, CTA Entregar/Cancelar, estado vacío "¡Todo está al día!")
- [x] T030 [US3] Conectar el cobro en un solo paso (crear + cobrar en efectivo) en `frontend/src/pages/caja/NuevoPedidoPage.tsx` / `CobroPage.tsx`
- [x] T031 [US3] Añadir el enlace y badge de Entregas a la bottom bar/drawer de caja en `frontend/src/components/layouts/AppLayout.tsx`

**Checkpoint**: caja operativa de forma independiente.

---

## Phase 5: US4 — Panel de administración (Priority: P2)

**Goal**: landing con conteos y rediseño de Usuarios/Platillos/Menú.

**Independent Test**: ver conteos y completar el CRUD de cada sección.

### Tests for US4

- [x] T032 [P] [US4] Test de la landing admin (conteos) en `frontend/src/pages/admin/AdminHome.test.tsx`

### Implementation for US4

- [x] T033 [P] [US4] Crear `frontend/src/pages/admin/AdminHome.tsx` (acciones rápidas con conteos desde `GET /usuarios`, `GET /platillos`, `GET /menu`; resumen del menú de hoy)
- [x] T034 [US4] Rediseñar `frontend/src/pages/admin/UsuariosPage.tsx` (filas ≥ 56 px, CTA "Nuevo usuario", panel/sheet, buscador, confirmación de deshabilitar, estados con `Reintentar`)
- [x] T035 [US4] Rediseñar `frontend/src/pages/admin/PlatillosPage.tsx` (buscador + chips de categoría, tarjetas con badge/estado, estados vacío/vacío-de-filtro/error)
- [x] T036 [US4] Rediseñar `frontend/src/pages/admin/MenuDiaPage.tsx` (selector de fecha, grid con toggle `Disponible` y badge `Especial`, panel "Agregar al menú", confirmación al quitar)
- [x] T037 [US4] Ajustar la navegación de admin en `frontend/src/App.tsx` y `frontend/src/components/layouts/AppLayout.tsx` (`/admin` landing + `/admin/usuarios`)

**Checkpoint**: admin operativo de forma independiente.

---

## Phase 6: US5 — App del cliente (Priority: P2)

**Goal**: menú con filtros, flujo `/pedido/*`, pago simulado, confirmación y Mis pedidos.

**Independent Test**: completar el flujo del cliente de principio a fin.

### Tests for US5

- [x] T038 [P] [US5] Test de la regla de 10 min y navegación del flujo en `frontend/src/pages/clientes/ConfirmarPage.test.tsx`
- [x] T039 [P] [US5] Test del aviso "Listo para recoger!" en `frontend/src/components/PedidoCard.test.tsx`

### Implementation for US5

- [x] T040 [US5] Rediseñar `frontend/src/pages/clientes/MenuPage.tsx` (bienvenida, búsqueda, chips de categoría, barra flotante "Ver pedido", no disponibles atenuados)
- [x] T041 [US5] Crear `frontend/src/pages/clientes/ConfirmarPage.tsx` (desglose, hora de recolección con regla de 10 min inline, CTA "Continuar al pago", vacío → menú)
- [x] T042 [US5] Trasladar la lógica del carrito de `frontend/src/pages/clientes/CarritoPage.tsx` a `ConfirmarPage.tsx` y retirar/reemplazar `CarritoPage.tsx`
- [x] T043 [US5] Rediseñar `frontend/src/pages/clientes/PagoPage.tsx` (sin campo de token; token simulado por defecto; fallo forzable con `?demo=fail`; "Este proceso no captura datos de tarjeta"; caso "ya pagado")
- [x] T044 [P] [US5] Crear `frontend/src/pages/clientes/ConfirmacionPage.tsx` (folio `font-mono`, badge de estado, desglose, CTA "Ver mis pedidos"/"Volver al menú")
- [x] T045 [US5] Registrar rutas `/pedido/confirmar`, `/pedido/:id/pago`, `/pedido/:id/confirmacion` en `frontend/src/App.tsx`
- [x] T046 [US5] Rediseñar `frontend/src/pages/clientes/MisPedidosHome.tsx` (badge de activos, aviso `status-ready`, CTA flotante "Nuevo pedido")
- [x] T047 [US5] Actualizar `frontend/src/components/PedidoCard.tsx` para usar tokens `status-*` y borde `status-ready`

**Checkpoint**: cliente operativo de forma independiente.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T048 [P] Alinear badges de estado a tokens `status-*` en `frontend/src/components/EstadoTimeline.tsx` y demás componentes
- [ ] T049 [P] Revisar estados de carga/vacío/error con `Reintentar` en todas las pantallas nuevas
- [ ] T050 [P] Actualizar `frontend/README.md` y `backend/README.md` con el rediseño y los campos nuevos
- [ ] T051 [P] Actualizar `docs/sprints.md` (Sprint 7) y `docs/demo-sprint5.md` → demo del rediseño
- [ ] T052 Corregir la higiene de documentos: mover/alinear referencias `design/` ↔ `docs/diseño-*.md` y `GET /api/caja/pedidos` → `GET /api/caja/pedidos`
- [ ] T053 Ejecutar `cd backend && npm test && npm run typecheck`
- [ ] T054 Ejecutar `cd frontend && npm test && npm run typecheck && npm run lint && npm run build`
- [ ] T055 Ejecutar la validación de `specs/007-ui-redesign/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2 / US1)**: depende de Setup; **bloquea** el resto.
- **US2 (Phase 3)**, **US3 (Phase 4)**, **US4 (Phase 5)**, **US5 (Phase 6)**: dependen de US1; en lo demás son independientes.
- **Polish (Phase 7)**: depende de las historias deseadas.

### Within Each User Story

- Backend (campos) antes que la vista que los consume (US2, US3).
- Componentes antes que las páginas.
- Página completa antes de la conectividad de navegación.

### Parallel Opportunities

- T003–T008 (tests y componentes UI base) en paralelo.
- T013/T014, T021/T022, T032, T038/T039 (tests) en paralelo.
- T018, T026/T027, T033, T040/T044 (componentes/páginas nuevas) en paralelo dentro de su historia.
- T048–T051 en paralelo en Polish.

---

## Implementation Strategy

### Incremental delivery (confirmado)

1. Setup + Foundational (US1) → shell listo.
2. US2 Cocina → validar y commit `feat: sprint 7 (cocina KDS)`.
3. US3 Caja → validar y commit `feat: sprint 7 (caja)`.
4. US4 Admin → validar y commit `feat: sprint 7 (admin)`.
5. US5 Cliente → validar y commit `feat: sprint 7 (cliente)`.
6. Polish → validar; commit final solo si se solicita.

## Notes

- Sin migraciones de base de datos.
- Sin dependencias nuevas.
- Solo se hace commit cuando el usuario lo solicite.