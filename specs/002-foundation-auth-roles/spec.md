# Feature Specification: Sprint 1 — Fundamentos y autenticación

**Feature Branch**: `002-foundation-auth-roles`

**Created**: 2026-10-13

**Status**: Draft

**Input**: Sprint 1 de `docs/sprints.md` (base de datos, JWT, RBAC, scaffold de la app única con rutas por rol y gestión de usuarios operativos). Traza a las User Stories US1 y US7 de la spec maestra `specs/001-sistema-pedidos-anticipados/spec.md`.

**Spec maestra**: `specs/001-sistema-pedidos-anticipados/spec.md`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Iniciar sesión y acceder solo a mi módulo (Priority: P1)

Un usuario (administrador, cajero, cocinero, alumno o docente) inicia sesión con su
correo electrónico y contraseña y accede únicamente a las funciones y pantallas que
corresponden a su rol.

**Why this priority**: Es la base de seguridad y acceso de todo el sistema; sin control
de acceso por rol ninguna de las demás funcionalidades puede operar de forma segura.
Traza a US1 (P1) de la spec maestra.

**Independent Test**: Con una cuenta por cada rol configurada, iniciar sesión con cada
una y verificar que redirige a su ruta y que el intento de abrir la ruta de otro rol es
rechazado.

**Acceptance Scenarios**:

1. **Given** un usuario registrado con su rol, **When** inicia sesión con credenciales
   válidas, **Then** accede a la pantalla principal de su rol y no a las de otros roles.
2. **Given** un usuario autenticado sin el rol requerido, **When** intenta abrir la ruta
   de otro rol, **Then** el acceso es denegado y se le informa que no tiene permiso.
3. **Given** credenciales inválidas, **When** el usuario intenta iniciar sesión, **Then**
   el sistema rechaza el acceso con un mensaje claro sin revelar si el correo existe.
4. **Given** un usuario sin sesión, **When** intenta abrir una ruta protegida, **Then**
   es redirigido a la pantalla de inicio de sesión.
5. **Given** un usuario con cuenta desactivada, **When** intenta iniciar sesión, **Then**
   el acceso es rechazado con el mismo mensaje genérico.

---

### User Story 2 - Registrar una cuenta de cliente (Priority: P1)

Un alumno o docente crea su propia cuenta para poder consultar el menú y hacer pedidos.

**Why this priority**: Sin cuentas de cliente no existe el flujo de pedido anticipado.
Traza a FR-007 de la spec maestra.

**Independent Test**: Registrar una cuenta nueva de cliente con correo y contraseña
válidos y verificar que puede iniciar sesión con el rol cliente (alumno/docente).

**Acceptance Scenarios**:

1. **Given** un correo no registrado, **When** un alumno/docente se registra con datos
   válidos, **Then** la cuenta se crea con rol de cliente y puede iniciar sesión.
2. **Given** un correo ya registrado, **When** se intenta registrar de nuevo, **Then** el
   sistema rechaza el registro con un mensaje claro.
3. **Given** datos incompletos o inválidos, **When** se envía el registro, **Then** el
   sistema no crea la cuenta y muestra los errores de validación correspondientes.

---

### User Story 3 - Gestionar usuarios operativos (Priority: P2)

Un administrador crea, edita y deshabilita las cuentas de los usuarios operativos
(cajeros y cocineros).

**Why this priority**: Facilita la administración del personal; puede resolverse al
principio con cuentas predefinidas, por lo que no bloquea el flujo principal. Traza a
US7 (P4) y FR-006 de la spec maestra.

**Independent Test**: Con una sesión de administrador, crear una cuenta de cajero y una
de cocinero, editarlas, deshabilitar una y verificar que la deshabilitada no puede
iniciar sesión.

**Acceptance Scenarios**:

1. **Given** un administrador autenticado, **When** crea una cuenta de cajero o
   cocinero, **Then** la cuenta queda activa con su rol y permite iniciar sesión.
2. **Given** una cuenta operativa existente, **When** el administrador la edita o la
   desactiva, **Then** los cambios se aplican y una cuenta desactivada no puede iniciar
   sesión.
3. **Given** un usuario sin rol administrador, **When** intenta crear o editar usuarios
   operativos, **Then** el acceso es denegado.

---

### Edge Cases

- **Correo duplicado**: el registro y la creación de usuarios rechazan correos ya
  existentes sin exponer información de otras cuentas.
- **Contraseña débil**: el registro exige un mínimo de longitud y no permite campos
  vacíos; los errores se muestran junto al campo.
- **Token expirado o inválido**: una petición con token expirado/adulterado responde
  `401` y el frontend redirige a `/login`.
- **Cuenta desactivada**: no puede iniciar sesión aunque las credenciales sean correctas.
- **Rol desconocido o ausente**: se trata como acceso denegado.
- **Escalada de privilegios**: un cliente no puede crearse a sí mismo como administrador
  ni cambiar su rol.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir el registro con correo electrónico y contraseña.
  (Traza a FR-001 de 001.)
- **FR-002**: El sistema MUST permitir el inicio de sesión con correo electrónico y
  contraseña. (FR-001 de 001.)
- **FR-003**: El sistema MUST asignar a cada usuario exactamente un rol: administrador,
  cajero, cocinero o cliente (alumno/docente). (FR-002 de 001.)
- **FR-004**: El sistema MUST restringir el acceso a cada módulo y función según el rol.
  (FR-003 de 001.)
- **FR-005**: El sistema MUST proteger todas las rutas exigiendo sesión válida y el rol
  correspondiente. (FR-004 de 001.)
- **FR-006**: El sistema MUST almacenar las contraseñas de forma no reversible con
  bcrypt; NEVER en texto plano. (FR-005 de 001.)
- **FR-007**: El administrador MUST poder crear, editar y desactivar usuarios operativos
  (cajeros y cocineros). (FR-006 de 001.)
- **FR-008**: El sistema MUST permitir el autorregistro de clientes con rol de cliente,
  sin permitir que el usuario elija rol privilegiado. (FR-007 de 001.)
- **FR-009**: El sistema MUST devolver un mensaje genérico en el login fallido, sin
  revelar si el correo existe. (FR-037 de 001.)
- **FR-010**: El sistema MUST emitir un JWT firmado con caducidad al autenticar y MUST
  validarlo en cada petición protegida. (FR-039 de 001.)
- **FR-011**: El frontend MUST exponer las rutas `/login`, `/admin`, `/caja`, `/cocina`,
  `/menu` y `/mis-pedidos` con protección por sesión y rol. (FR-004/FR-041 de 001.)
- **FR-012**: El frontend MUST proveer un layout y navegación por rol. (FR-041 de 001.)
- **FR-013**: El sistema MUST validar los datos de entrada en frontend y backend antes de
  procesarlos. (FR-036 de 001.)
- **FR-014**: El sistema MUST gestionar la configuración sensible (credenciales de BD,
  `JWT_SECRET`) mediante variables de entorno. (FR-039 de 001.)
- **FR-015**: El sistema MUST registrar errores internos sin exponer stack traces ni
  información interna al usuario. (FR-037/FR-038 de 001.)

### Key Entities *(include if feature involves data)*

- **Rol**: perfil de acceso. Atributos: `id`, `nombre` (administrador, cajero, cocinero,
  usuario/cliente), `creado_en`. Tabla `rol`.
- **Usuario**: persona que usa el sistema. Atributos: `id`, `nombre`, `correo` (único),
  `password_hash`, `activo`, `rol_id` (FK a `rol`), `creado_en`, `actualizado_en`. Tabla
  `usuario`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los intentos de acceso a funciones fuera del rol es bloqueado.
  (Traza a SC-009 de 001.)
- **SC-002**: El 0 % de las contraseñas se almacena o transmite en texto plano.
- **SC-003**: Las credenciales válidas de cada rol redirigen a su ruta en menos de 1
  segundo; las inválidas muestran un mensaje genérico.
- **SC-004**: Un administrador completa la creación de un usuario operativo en menos de 30
  segundos.
- **SC-005**: `npm test` y `npm run typecheck` pasan en verde (backend y frontend).

## Assumptions

- Existe al menos una cuenta de administrador inicial sembrada por migración/seed para
  configurar el sistema.
- Los alumnos y docentes se registran por sí mismos; las cuentas operativas las crea el
  administrador.
- La autenticación es por correo y contraseña; no se implementa SSO ni recuperación de
  contraseña en este sprint.
- El frontend parte de un scaffold Vite + React que se migra a **TypeScript**, con Tailwind
  y shadcn/ui, conforme a `docs/reglas.md` (§1, §2, §17).
- La base de datos es MySQL 8.0+ (ver `migrations/`).
- El almacenamiento de tokens en el cliente se resuelve de forma simple (memoria/almacenamiento
  del navegador) dentro del alcance del MVP, sin requisitos avanzados de refresh tokens.
- El alcance se limita al MVP de `docs/reglas.md` (§27); funcionalidades fuera de él
  requieren aprobación previa.
