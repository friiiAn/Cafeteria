# Implementation Plan: Sprint 1 — Fundamentos y autenticación

**Branch**: `002-foundation-auth-roles` | **Date**: 2026-10-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-foundation-auth-roles/spec.md`

## Summary

Establecer la base técnica y de seguridad del sistema: scaffold del backend
(Node LTS + Express + TypeScript) y del frontend (React + TypeScript + Vite), conexión a
MySQL 8.0+ con `mysql2`, autenticación por correo/contraseña con bcrypt + JWT, control de
acceso por rol (RBAC) en backend y frontend, y gestión de usuarios operativos por el
administrador. Es el Sprint 1 de `docs/sprints.md`; traza a US1 y US7 de la spec maestra.

## Technical Context

**Language/Version**: TypeScript 5.x — Node.js LTS (backend); React 19 + TypeScript (frontend)

**Primary Dependencies**: Express, `mysql2`, `jsonwebtoken`, `bcryptjs`, `zod`, `cors`,
`helmet`, `dotenv`; React Router, Tailwind CSS, shadcn/ui; Vitest, supertest

**Storage**: MySQL 8.0+ (`cafe_itsh`, usuario `cafe_admin`) con `mysql2` (pool)

**Testing**: Vitest (unit) + supertest (integración)

**Target Platform**: Web responsiva (móvil y escritorio)

**Project Type**: Web app (frontend + backend) en un monorepo

**Performance Goals**: login < 1 s; rutas protegidas < 200 ms; CRUD de usuarios < 300 ms

**Constraints**: contraseñas hasheadas; mensajes genéricos en login; sin stack traces;
configuración por variables de entorno; RBAC estricto

**Scale/Scope**: MVP académico, docenas de usuarios concurrentes en receso

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Simplicidad (§3, §17, §22)**: PASS — Express + `mysql2` sin ORM; carpetas por
  funcionalidad, sin capas innecesarias.
- **Seguridad (§5, §16, §23)**: PASS — bcrypt, JWT, RBAC, secretos en `.env`.
- **TypeScript (§1, §18)**: PASS — backend y frontend en TS; se migra el scaffold JSX.
- **Testing (§20)**: PASS — Vitest cubre auth, autorización y gestión de usuarios.
- **Alcance (§27)**: PASS — solo auth, RBAC y usuarios operativos.
- **Validación (§14)**: PASS — `zod` en backend; validación en frontend.
- **Errores (§15)**: PASS — middleware central, sin exponer información interna.

Sin violaciones que justificar.

## Project Structure

### Documentation (this feature)

```text
specs/002-foundation-auth-roles/
├── spec.md
├── plan.md              # Este archivo
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── config/            # env, constantes
│   ├── db/                # pool mysql2, helpers de consulta
│   ├── middlewares/       # requireAuth, requireRole, errorHandler, validate
│   ├── services/          # authService, usuarioService
│   ├── controllers/       # authController, usuarioController
│   ├── routes/            # auth.routes.ts, usuario.routes.ts
│   ├── utils/             # jwt, password, httpError, logger
│   ├── app.ts             # app Express (rutas + middlewares)
│   └── server.ts          # arranque
├── tests/
│   ├── unit/              # password, jwt, rbac
│   └── integration/       # auth, usuarios
├── .env.example
├── tsconfig.json
└── package.json

frontend/
├── src/
│   ├── components/ui/     # shadcn/ui
│   ├── components/        # ProtectedRoute, layouts
│   ├── contexts/          # AuthContext
│   ├── lib/               # apiClient
│   ├── pages/
│   │   ├── admin/         # UsuariosPage
│   │   ├── caja/          # CajaHome
│   │   ├── cocina/        # CocinaHome
│   │   └── clientes/      # MenuHome, MisPedidosHome
│   ├── App.tsx            # router
│   └── main.tsx
├── index.html
├── tsconfig.json
└── package.json

migrations/
├── 001_crear_esquema.sql
└── 002_seed_inicial.sql
```

**Structure Decision**: Web app de dos proyectos (`backend/`, `frontend/`) más `migrations/`,
alineado con `docs/reglas.md` §17. Se renombra `fronted/` → `frontend/` y se migra de JSX a
TypeScript.

## Complexity Tracking

> Sin violaciones al Constitution Check.
