# Feature Specification: Sprint 2 — Gestión y consulta del menú

**Feature Branch**: `003-menu-management`

**Created**: 2026-10-13

**Status**: Draft

**Input**: Sprint 2 de `docs/sprints.md` (el admin publica el menú del día y los
alumnos/docentes lo consultan). Traza a la User Story US6 y a FR-008..FR-014 de la spec
maestra `specs/001-sistema-pedidos-anticipados/spec.md`.

**Spec maestra**: `specs/001-sistema-pedidos-anticipados/spec.md`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gestionar platillos y menú del día (Priority: P1)

Un administrador crea y edita platillos, y arma el menú de una fecha con sus precios,
disponibilidad y especiales del día.

**Why this priority**: Es lo que puebla el menú que consumen los clientes; sin menú
publicado no hay nada que pedir. Traza a US6 y FR-008..FR-011.

**Independent Test**: Con sesión de administrador, crear un platillo, agregarlo al menú de
hoy con un precio, marcar un especial y deshabilitar otro; verificar que se guardan.

**Acceptance Scenarios**:

1. **Given** un administrador autenticado, **When** crea o edita un platillo, **Then** el
   cambio queda guardado en el catálogo.
2. **Given** un platillo del catálogo, **When** el administrador lo agrega al menú de una
   fecha con precio, disponibilidad y especial, **Then** queda asociado a esa fecha con el
   precio indicado.
3. **Given** un platillo ya en el menú de una fecha, **When** el administrador lo edita,
   **Then** no puede duplicarse el mismo platillo en la misma fecha.
4. **Given** un usuario sin rol administrador, **When** intenta modificar platillos o
   menú, **Then** el acceso es denegado.

---

### User Story 2 - Consultar el menú del día (Priority: P1)

Un alumno o docente consulta el menú publicado con platillos, precios, disponibilidad y
especiales del día.

**Why this priority**: Es la primera pantalla del flujo de valor del cliente. Traza a
FR-014 y parte de US2.

**Independent Test**: Con menú publicado, abrir `/menu` y verificar que se listan los
platillos con precio y que los no disponibles aparecen marcados y no seleccionables.

**Acceptance Scenarios**:

1. **Given** un menú publicado para hoy, **When** el cliente abre `/menu`, **Then** ve los
   platillos con su precio y los especiales destacados.
2. **Given** un platillo marcado como no disponible, **When** el cliente consulta el menú,
   **Then** aparece identificado como no disponible y no puede seleccionarse.
3. **Given** una fecha sin menú publicado, **When** el cliente consulta, **Then** ve un
   mensaje informativo de que aún no hay menú.

---

### User Story 3 - Reflejar cambios de inmediato (Priority: P2)

Los cambios de precio o disponibilidad del administrador se reflejan de inmediato en la
consulta del cliente.

**Why this priority**: Garantiza que los clientes no pidan platillos agotados ni precios
obsoletos. Traza a FR-013.

**Independent Test**: Cambiar el precio de un platillo del menú y recargar `/menu` para
confirmar que el nuevo precio se muestra inmediatamente.

**Acceptance Scenarios**:

1. **Given** un platillo en el menú con precio X, **When** el administrador lo cambia a Y,
   **Then** la consulta del cliente muestra Y de inmediato.
2. **Given** un platillo disponible, **When** el administrador lo marca no disponible,
   **Then** el cliente deja de poder seleccionarlo.

---

### Edge Cases

- **Menú vacío o sin platillos**: la consulta muestra un estado informativo y no permite
  seleccionar nada.
- **Platillo duplicado en la misma fecha**: el sistema impide agregarlo dos veces a la
  misma fecha.
- **Precio inválido**: negativo o no numérico es rechazado.
- **Platillo inactivo del catálogo**: no se ofrece en el menú del día.
- **Cambio de precio posterior**: los pedidos ya creados conservan su precio (eso se
  garantiza en el Sprint 3); el menú solo afecta pedidos nuevos.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El administrador MUST poder crear y modificar el menú diario. (FR-008.)
- **FR-002**: El administrador MUST poder crear, editar y gestionar platillos. (FR-009.)
- **FR-003**: El administrador MUST poder gestionar especiales del día. (FR-009.)
- **FR-004**: El administrador MUST poder asignar y modificar precios de platillos del
  menú. (FR-010.)
- **FR-005**: El administrador MUST poder marcar platillos como disponibles o no
  disponibles en el menú. (FR-011.)
- **FR-006**: Los cambios de menú, precio y disponibilidad MUST reflejarse para los
  usuarios finales. (FR-013.)
- **FR-007**: Los clientes MUST poder consultar el menú de una fecha con platillos,
  precios, disponibilidad y especiales. (FR-014.)
- **FR-008**: Un platillo no disponible NEVER MUST poder seleccionarse en nuevos pedidos.
  (FR-012.)
- **FR-009**: El sistema MUST impedir que un mismo platillo se agregue dos veces a la misma
  fecha.
- **FR-010**: El sistema MUST validar que el precio sea numérico y no negativo antes de
  guardarlo. (FR-036.)
- **FR-011**: El sistema MUST restringir las operaciones de gestión al rol administrador.
  (FR-003.)

### Key Entities *(include if feature involves data)*

- **Platillo**: producto del catálogo. Atributos: `id`, `nombre`, `categoria`,
  `descripcion`, `activo`, `creado_en`, `actualizado_en`. Tabla `platillo`.
- **Menú del día (`menu_dia`)**: asociación de un platillo a una fecha con `precio`,
  `disponible`, `especial`. Clave única `(fecha, platillo_id)`. Tabla `menu_dia`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un platillo no disponible aparece identificado y no puede seleccionarse
  (100 % de los casos).
- **SC-002**: Los cambios de precio/disponibilidad se reflejan en `/menu` en menos de 2
  segundos tras recargar.
- **SC-003**: Un cliente ve el menú del día en menos de 2 segundos en horario de receso
  (móvil). (Traza a SC-005 de 001.)
- **SC-004**: Un administrador agrega un platillo al menú del día en menos de 30 segundos.

## Assumptions

- El catálogo de platillos es global; el menú del día solo asocia platillos a una fecha.
- El precio vive en el menú del día (se congela por fecha), no en el catálogo.
- "No disponible" se modela a nivel del menú del día (un platillo disponible puede volver
  no disponible en la fecha).
- La consulta del cliente es pública o requiere sesión según `docs/reglas.md` §2; en este
  sprint se permite consulta del menú autenticada.
- La base de datos es MySQL 8.0+ (ver `migrations/`).
- El alcance se limita al MVP de `docs/reglas.md` (§27).
