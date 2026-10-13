---

description: "Task list for Sprint 1 — Fundamentos y autenticación"
---

# Tasks: Sprint 1 — Fundamentos y autenticación

**Input**: Design documents from `specs/002-foundation-auth-roles/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

**Tests**: Incluidos (Vitest) — exigidos por el criterio de aceptación del sprint.

**Organization**: Tareas agrupadas por user story para permitir implementación y prueba
independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: puede correr en paralelo (archivos distintos, sin dependencias)
- **[Story]**: US1, US2, US3

## Path Conventions

- Backend: `backend/src/`, `backend/tests/`
- Frontend: `frontend/src/`
- Migraciones: `migrations/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Inicializar la estructura del proyecto.

- [ ] T001 Renombrar `fronted/` → `frontend/` y actualizar referencias internas
- [ ] T002 [P] Inicializar backend TypeScript en `backend/` (tsconfig, deps: express, mysql2, jsonwebtoken, bcryptjs, zod, cors, helmet, dotenv; devDeps: typescript, tsx, vitest, supertest, @types/*)
- [ ] T003 [P] Migrar scaffold de `frontend/` a TypeScript (`vite.config.ts`, `tsconfig.json`, `main.tsx`, `App.tsx`) y añadir react-router-dom, tailwindcss, shadcn/ui, vitest
- [ ] T004 [P] Configurar scripts `dev`, `test`, `typecheck`, `lint` en ambos `package.json`
- [ ] T005 [P] Crear `backend/.env.example` y `frontend/.env.example`; añadir `.env` a `.gitignore`
- [ ] T006 [P] Configurar Tailwind y los tokens de `docs/DESIGN.md` en `frontend/src/index.css` y `tailwind.config.ts`

**Checkpoint**: Estructura lista para el trabajo base.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Infraestructura núcleo que bloquea todas las user stories.

**⚠️ CRITICAL**: Ninguna user story puede empezar hasta completar esta fase.

- [ ] T007 Verificar/aplicar migraciones MySQL `migrations/001_crear_esquema.sql` y `002_seed_inicial.sql` (11 tablas + seed)
- [ ] T008 Implementar carga de entorno y `mysql2` pool en `backend/src/config/env.ts` y `backend/src/db/pool.ts`
- [ ] T009 [P] Implementar utilidades de contraseña (bcrypt) en `backend/src/utils/password.ts`
- [ ] T010 [P] Implementar utilidades JWT (firmar/verificar) en `backend/src/utils/jwt.ts`
- [ ] T011 [P] Implementar `httpError` y `logger` en `backend/src/utils/`
- [ ] T012 Implementar middleware de errores y de validación (`zod`) en `backend/src/middlewares/errorHandler.ts` y `validate.ts`
- [ ] T013 Implementar `app.ts` con `cors`, `helmet`, `express.json()` y montaje de `/api`
- [ ] T014 Implementar `server.ts` (arranque y cierre del pool)
- [ ] T015 Seed de cuentas operativas iniciales (admin, cajero, cocinero) con contraseñas hasheadas (script idempotente `backend/scripts/seed-usuarios.ts`)

**Checkpoint**: Base lista — las user stories pueden empezar.

---

## Phase 3: User Story 1 - Iniciar sesión y acceder solo a mi módulo (Priority: P1) 🎯 MVP

**Goal**: Autenticación con JWT y acceso por rol en backend y frontend.

**Independent Test**: Login con cada rol → redirige a su ruta; ruta ajena denegada; ruta sin
sesión → `/login`.

### Tests for User Story 1

- [ ] T016 [P] [US1] Unit test de `password` (hash/compare) en `backend/tests/unit/password.test.ts`
- [ ] T017 [P] [US1] Unit test de `jwt` (firma/expiración/verificación) en `backend/tests/unit/jwt.test.ts`
- [ ] T018 [P] [US1] Integration test de `POST /api/auth/login` y `GET /api/auth/me` en `backend/tests/integration/auth.test.ts`
- [ ] T019 [P] [US1] Integration test de RBAC (401/403) en `backend/tests/integration/rbac.test.ts`

### Implementation for User Story 1

- [ ] T020 [US1] Implementar `authService` (login, verificación de activo, emisión de token) en `backend/src/services/authService.ts`
- [ ] T021 [US1] Implementar `authController` y `auth.routes.ts` (`/login`, `/me`) en `backend/src/`
- [ ] T022 [US1] Implementar middleware `requireAuth` y `requireRole` en `backend/src/middlewares/`
- [ ] T023 [P] [US1] Crear `AuthContext` y `apiClient` en `frontend/src/contexts/` y `frontend/src/lib/`
- [ ] T024 [US1] Crear `LoginPage` en `frontend/src/pages/LoginPage.tsx` con validación y mensajes genéricos
- [ ] T025 [US1] Crear `ProtectedRoute` por rol y el router en `frontend/src/App.tsx`
- [ ] T026 [P] [US1] Crear layouts y navegación por rol en `frontend/src/components/layouts/`

**Checkpoint**: US1 funcional y testeable de forma independiente.

---

## Phase 4: User Story 2 - Registrar una cuenta de cliente (Priority: P1)

**Goal**: Autorregistro de clientes (alumno/docente).

**Independent Test**: Registro válido crea cuenta con rol cliente; correo duplicado
rechazado; datos inválidos rechazados.

### Tests for User Story 2

- [ ] T027 [P] [US2] Integration test de `POST /api/auth/register` (éxito, duplicado, inválido) en `backend/tests/integration/register.test.ts`

### Implementation for User Story 2

- [ ] T028 [US2] Implementar `register` en `authService` (rol fijo `usuario`, hash de contraseña) en `backend/src/services/authService.ts`
- [ ] T029 [US2] Exponer `POST /api/auth/register` en `auth.routes.ts` con esquema `zod`
- [ ] T030 [US2] Crear `RegisterPage` en `frontend/src/pages/RegisterPage.tsx` con validación y enlace desde login

**Checkpoint**: US1 y US2 funcionan de forma independiente.

---

## Phase 5: User Story 3 - Gestionar usuarios operativos (Priority: P2)

**Goal**: CRUD de usuarios operativos por el administrador.

**Independent Test**: Admin crea cajero/cocinero, edita y deshabilita; la cuenta
deshabilitada no puede iniciar sesión; no-admin recibe 403.

### Tests for User Story 3

- [ ] T031 [P] [US3] Integration test de `/api/usuarios` (CRUD + 403) en `backend/tests/integration/usuarios.test.ts`

### Implementation for User Story 3

- [ ] T032 [US3] Implementar `usuarioService` (listar, crear, editar, desactivar) en `backend/src/services/usuarioService.ts`
- [ ] T033 [US3] Implementar `usuarioController` y `usuario.routes.ts` protegido con `requireRole('administrador')`
- [ ] T034 [US3] Crear `UsuariosPage` (listado + alta + edición + desactivar) en `frontend/src/pages/admin/UsuariosPage.tsx`
- [ ] T035 [US3] Proteger la ruta `/admin` solo para administrador en `frontend/src/App.tsx`

**Checkpoint**: Las tres user stories funcionan de forma independiente.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T036 [P] Documentar endpoints y variables de entorno en `backend/README.md`
- [ ] T037 [P] Añadir validación de límites y saneo de entradas en todos los controladores
- [ ] T038 Verificar que no se exponen stack traces ni datos internos en respuestas de error
- [ ] T039 [P] Añadir pruebas de tipo y ajustar `tsconfig` en frontend y backend
- [ ] T040 Ejecutar `npm test` y `npm run typecheck` en backend y frontend (SC-005)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias.
- **Foundational (Phase 2)**: depende de Setup; bloquea todas las historias.
- **User Stories (Phase 3–5)**: dependen de Foundational.
- **Polish (Phase 6)**: depende de las historias deseadas.

### User Story Dependencies

- **US1 (P1)**: base; no depende de otras historias.
- **US2 (P1)**: reutiliza `authService`/rutas de US1.
- **US3 (P2)**: reutiliza `requireAuth`/`requireRole` de US1.

### Within Each User Story

- Tests primero (deben fallar), luego implementación.
- Servicios antes que controladores/rutas.
- Backend antes que integración de frontend.

---

## Implementation Strategy

### MVP First (US1)

1. Setup + Foundational.
2. US1 completo → validar login y RBAC.
3. Desplegar/demostrar como base segura.

### Incremental Delivery

1. Setup + Foundational → base lista.
2. US1 → demo (login por rol).
3. US2 → registro de clientes.
4. US3 → gestión de operativos.

## Notes

- Las contraseñas del seed son solo para desarrollo.
- `npm run typecheck` es obligatorio antes de cada commit.
- Respetar `docs/reglas.md` (camelCase, PascalCase, sin capas innecesarias).
