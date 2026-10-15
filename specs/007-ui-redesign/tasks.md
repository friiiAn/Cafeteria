---

description: "Task list for Sprint 7 â€” RediseÃ±o UI/UX por rol"
---

# Tasks: Sprint 7 â€” RediseÃ±o UI/UX por rol

**Input**: Design documents from `specs/007-ui-redesign/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

**Tests**: incluidas (constituciÃ³n Â§VIII) para los campos nuevos de backend y para
los componentes/rutas de UI crÃ­ticos.

**Organization**: las tareas se agrupan por historia de usuario para permitir
implementaciÃ³n y prueba independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- **[Story]**: US1..US5
- Cada tarea incluye la ruta exacta del archivo

## Path Conventions

- Backend: `backend/src/`, `backend/tests/`
- Frontend: `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: preparar utilidades compartidas del sistema de diseÃ±o.

- [ ] T001 Revisar y, si faltan, aÃ±adir utilidades tipogrÃ¡ficas (`stat-lg`, `font-heading`) en `frontend/src/index.css` usando tokens existentes
- [ ] T002 [P] Confirmar tokens `--color-status-*` en `frontend/src/index.css` y documentar su uso para badges de estado

---

## Phase 2: Foundational (US1 â€” NavegaciÃ³n por rol) ðŸŽ¯

**Purpose**: shell de navegaciÃ³n (drawer + bottom bar) del que dependen todas las
pantallas.

**âš ï¸ CRITICAL**: ninguna otra historia puede cerrarse sin este shell.

### Tests for US1

- [ ] T003 [P] [US1] Test de rutas por rol y redirects en `frontend/src/App.test.tsx`
- [ ] T004 [P] [US1] Test de navegaciÃ³n del drawer (apertura/cierre, activo, logout) en `frontend/src/components/ui/Drawer.test.tsx`

### Implementation for US1

- [ ] T005 [P] [US1] Crear `frontend/src/components/ui/drawer.tsx` (panel lateral, overlay, cierre por `Esc`/click, `role="dialog"`, panel fijo en `lg`)
- [ ] T006 [P] [US1] Crear `frontend/src/components/ui/bottom-bar.tsx` (2â€“3 pestaÃ±as, badge de contador, altura â‰¥ 56 px)
- [ ] T007 [P] [US1] Crear `frontend/src/components/ui/chip.tsx` (chip de categorÃ­a con estado seleccionado)
- [ ] T008 [P] [US1] Extraer `frontend/src/components/Stepper.tsx` (botones 44 px, cantidad 0â€“99, `âˆ’` deshabilitado en 0)
- [ ] T009 [US1] Refactorizar `frontend/src/components/layouts/AppLayout.tsx`: definiciÃ³n `ENLACES` por rol, header con hamburguesa, drawer y bottom bar
- [ ] T010 [US1] Reemplazar el stepper inline por `Stepper` en `frontend/src/components/PlatilloCard.tsx`
- [ ] T011 [US1] Modificar `frontend/src/App.tsx`: registrar rutas nuevas por rol y redirects `/carrito`â†’`/pedido/confirmar`, `/pago/:id`â†’`/pedido/:id/pago`
- [ ] T012 [US1] Integrar `NotificacionBell` en el drawer del cliente (badge de "listo") en `frontend/src/components/layouts/AppLayout.tsx`

**Checkpoint**: la navegaciÃ³n por rol funciona; las rutas protegidas siguen vigentes.

---

## Phase 3: US2 â€” Tablero de cocina (KDS) (Priority: P1)

**Goal**: cocina con tarjeta KDS (folio, cliente, horas, tiempo) y avance de un toque.

**Independent Test**: abrir `/cocina` con pedidos activos y avanzarlos.

### Tests for US2

- [ ] T013 [P] [US2] Test de campos nuevos en `backend/tests/integration/cocina.test.ts` (cliente_nombre, creado_en)
- [ ] T014 [P] [US2] Test de la tarjeta KDS (retrasado, CTA por estado) en `frontend/src/components/PedidoCocinaCard.test.tsx`

### Implementation for US2

- [ ] T015 [US2] Extender `listarParaCocina` en `backend/src/db/pedidoRepository.ts` con `creado_en` y `COALESCE(p.cliente_nombre, u.nombre)` (LEFT JOIN `usuario`)
- [ ] T016 [US2] Extender `frontend/src/types.ts` y `backend/src/types/pedido.ts` con `cliente_nombre`/`creado_en` en `PedidoCocina`
- [ ] T017 [US2] Propagar los campos en `backend/src/services/cocinaService.ts`
- [ ] T018 [P] [US2] Crear `frontend/src/components/PedidoCocinaCard.tsx` (folio grande, nÃºmero `font-mono`, badge `status-*`, chip de origen, horas, tiempo transcurrido/"Â¡Retrasado!", CTA o "en espera de caja")
- [ ] T019 [US2] RediseÃ±ar `frontend/src/pages/cocina/CocinaPage.tsx`: header con contador + "act. hace X s" + "Sin conexiÃ³n â€” reintentandoâ€¦"; sondeo 4 s; grid `sm:grid-cols-2 lg:grid-cols-3`; estados carga/vacÃ­o/error/conflicto
- [ ] T020 [US2] Marcar la tarjeta como "ocupada" mientras se procesa el avance en `frontend/src/pages/cocina/CocinaPage.tsx`

**Checkpoint**: cocina operativa de forma independiente.

---

## Phase 4: US3 â€” OperaciÃ³n de caja (Priority: P1)

**Goal**: panel de caja, captura (bÃºsqueda/chips/stepper), cobro en un paso y entregas.

**Independent Test**: capturar, cobrar y entregar un pedido mostrador.

### Tests for US3

- [ ] T021 [P] [US3] Test de campos nuevos en `backend/tests/integration/entrega.test.ts` (`creado_en`, `items`)
- [ ] T022 [P] [US3] Test del flujo de caja (carrito â†’ cobro en un paso) en `frontend/src/pages/caja/Caja.test.tsx`

### Implementation for US3

- [ ] T023 [US3] Extender `listarListos` en `backend/src/db/pedidoRepository.ts` con `creado_en` e `items` (reutilizar `listarItemsDePedidos`)
- [ ] T024 [US3] Extender `frontend/src/types.ts` y `backend/src/types/pedido.ts` con `creado_en`/`items` en `PedidoEntrega`
- [ ] T025 [US3] Propagar los campos en `backend/src/services/pedidoService.ts` (`listarParaEntrega`)
- [ ] T026 [P] [US3] Crear `frontend/src/pages/caja/CajaHome.tsx` (acciÃ³n "Capturar pedido" + mÃ³dulo Entregas con contador + bienvenida)
- [ ] T027 [P] [US3] Crear `frontend/src/pages/caja/NuevoPedidoPage.tsx` (nombre cliente, bÃºsqueda en vivo, chips de categorÃ­a, `PlatilloCard` con stepper, barra flotante)
- [ ] T028 [US3] Ajustar `frontend/src/pages/caja/CobroPage.tsx` como resumen de cobro y **fallback** efectivo en `/caja/:id/cobro`: CTA Ãºnico "Registrar y cobrar", Ã©xito con folio `font-mono`, reintento/cancelar
- [ ] T029 [US3] Crear `frontend/src/pages/caja/EntregasPage.tsx` (folio, hora de registro, cliente, partidas, CTA Entregar/Cancelar, estado vacÃ­o "Â¡Todo estÃ¡ al dÃ­a!")
- [ ] T030 [US3] Conectar el cobro en un solo paso (crear + cobrar en efectivo) en `frontend/src/pages/caja/NuevoPedidoPage.tsx` / `CobroPage.tsx`
- [ ] T031 [US3] AÃ±adir el enlace y badge de Entregas a la bottom bar/drawer de caja en `frontend/src/components/layouts/AppLayout.tsx`

**Checkpoint**: caja operativa de forma independiente.

---

## Phase 5: US4 â€” Panel de administraciÃ³n (Priority: P2)

**Goal**: landing con conteos y rediseÃ±o de Usuarios/Platillos/MenÃº.

**Independent Test**: ver conteos y completar el CRUD de cada secciÃ³n.

### Tests for US4

- [ ] T032 [P] [US4] Test de la landing admin (conteos) en `frontend/src/pages/admin/AdminHome.test.tsx`

### Implementation for US4

- [ ] T033 [P] [US4] Crear `frontend/src/pages/admin/AdminHome.tsx` (acciones rÃ¡pidas con conteos desde `GET /usuarios`, `GET /platillos`, `GET /menu`; resumen del menÃº de hoy)
- [ ] T034 [US4] RediseÃ±ar `frontend/src/pages/admin/UsuariosPage.tsx` (filas â‰¥ 56 px, CTA "Nuevo usuario", panel/sheet, buscador, confirmaciÃ³n de deshabilitar, estados con `Reintentar`)
- [ ] T035 [US4] RediseÃ±ar `frontend/src/pages/admin/PlatillosPage.tsx` (buscador + chips de categorÃ­a, tarjetas con badge/estado, estados vacÃ­o/vacÃ­o-de-filtro/error)
- [ ] T036 [US4] RediseÃ±ar `frontend/src/pages/admin/MenuDiaPage.tsx` (selector de fecha, grid con toggle `Disponible` y badge `Especial`, panel "Agregar al menÃº", confirmaciÃ³n al quitar)
- [ ] T037 [US4] Ajustar la navegaciÃ³n de admin en `frontend/src/App.tsx` y `frontend/src/components/layouts/AppLayout.tsx` (`/admin` landing + `/admin/usuarios`)

**Checkpoint**: admin operativo de forma independiente.

---

## Phase 6: US5 â€” App del cliente (Priority: P2)

**Goal**: menÃº con filtros, flujo `/pedido/*`, pago simulado, confirmaciÃ³n y Mis pedidos.

**Independent Test**: completar el flujo del cliente de principio a fin.

### Tests for US5

- [ ] T038 [P] [US5] Test de la regla de 10 min y navegaciÃ³n del flujo en `frontend/src/pages/clientes/ConfirmarPage.test.tsx`
- [ ] T039 [P] [US5] Test del aviso "Listo para recoger!" en `frontend/src/components/PedidoCard.test.tsx`

### Implementation for US5

- [ ] T040 [US5] RediseÃ±ar `frontend/src/pages/clientes/MenuPage.tsx` (bienvenida, bÃºsqueda, chips de categorÃ­a, barra flotante "Ver pedido", no disponibles atenuados)
- [ ] T041 [US5] Crear `frontend/src/pages/clientes/ConfirmarPage.tsx` (desglose, hora de recolecciÃ³n con regla de 10 min inline, CTA "Continuar al pago", vacÃ­o â†’ menÃº)
- [ ] T042 [US5] Trasladar la lÃ³gica del carrito de `frontend/src/pages/clientes/CarritoPage.tsx` a `ConfirmarPage.tsx` y retirar/reemplazar `CarritoPage.tsx`
- [ ] T043 [US5] RediseÃ±ar `frontend/src/pages/clientes/PagoPage.tsx` (sin campo de token; token simulado por defecto; fallo forzable con `?demo=fail`; "Este proceso no captura datos de tarjeta"; caso "ya pagado")
- [ ] T044 [P] [US5] Crear `frontend/src/pages/clientes/ConfirmacionPage.tsx` (folio `font-mono`, badge de estado, desglose, CTA "Ver mis pedidos"/"Volver al menÃº")
- [ ] T045 [US5] Registrar rutas `/pedido/confirmar`, `/pedido/:id/pago`, `/pedido/:id/confirmacion` en `frontend/src/App.tsx`
- [ ] T046 [US5] RediseÃ±ar `frontend/src/pages/clientes/MisPedidosHome.tsx` (badge de activos, aviso `status-ready`, CTA flotante "Nuevo pedido")
- [ ] T047 [US5] Actualizar `frontend/src/components/PedidoCard.tsx` para usar tokens `status-*` y borde `status-ready`

**Checkpoint**: cliente operativo de forma independiente.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T048 [P] Alinear badges de estado a tokens `status-*` en `frontend/src/components/EstadoTimeline.tsx` y demÃ¡s componentes
- [ ] T049 [P] Revisar estados de carga/vacÃ­o/error con `Reintentar` en todas las pantallas nuevas
- [ ] T050 [P] Actualizar `frontend/README.md` y `backend/README.md` con el rediseÃ±o y los campos nuevos
- [ ] T051 [P] Actualizar `docs/sprints.md` (Sprint 7) y `docs/demo-sprint5.md` â†’ demo del rediseÃ±o
- [ ] T052 Corregir la higiene de documentos: mover/alinear referencias `design/` â†” `docs/diseÃ±o-*.md` y `GET /api/caja/pedidos` â†’ `GET /api/caja/pedidos`
- [ ] T053 Ejecutar `cd backend && npm test && npm run typecheck`
- [ ] T054 Ejecutar `cd frontend && npm test && npm run typecheck && npm run lint && npm run build`
- [ ] T055 Ejecutar la validaciÃ³n de `specs/007-ui-redesign/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2 / US1)**: depende de Setup; **bloquea** el resto.
- **US2 (Phase 3)**, **US3 (Phase 4)**, **US4 (Phase 5)**, **US5 (Phase 6)**: dependen de US1; en lo demÃ¡s son independientes.
- **Polish (Phase 7)**: depende de las historias deseadas.

### Within Each User Story

- Backend (campos) antes que la vista que los consume (US2, US3).
- Componentes antes que las pÃ¡ginas.
- PÃ¡gina completa antes de la conectividad de navegaciÃ³n.

### Parallel Opportunities

- T003â€“T008 (tests y componentes UI base) en paralelo.
- T013/T014, T021/T022, T032, T038/T039 (tests) en paralelo.
- T018, T026/T027, T033, T040/T044 (componentes/pÃ¡ginas nuevas) en paralelo dentro de su historia.
- T048â€“T051 en paralelo en Polish.

---

## Implementation Strategy

### Incremental delivery (confirmado)

1. Setup + Foundational (US1) â†’ shell listo.
2. US2 Cocina â†’ validar y commit `feat: sprint 7 (cocina KDS)`.
3. US3 Caja â†’ validar y commit `feat: sprint 7 (caja)`.
4. US4 Admin â†’ validar y commit `feat: sprint 7 (admin)`.
5. US5 Cliente â†’ validar y commit `feat: sprint 7 (cliente)`.
6. Polish â†’ validar; commit final solo si se solicita.

## Notes

- Sin migraciones de base de datos.
- Sin dependencias nuevas.
- Solo se hace commit cuando el usuario lo solicite.
