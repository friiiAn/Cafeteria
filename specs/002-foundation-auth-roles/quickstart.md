# Quickstart: Sprint 1 — Fundamentos y autenticación

**Feature**: `002-foundation-auth-roles` | **Date**: 2026-10-13

## Prerrequisitos

- Node.js LTS y npm.
- MySQL 8.0+ corriendo con la BD `cafe_itsh` y el usuario `cafe_admin` (ver
  `docs/ejecutar-migraciones.md`).
- Migraciones aplicadas (`migrations/001_crear_esquema.sql`, `002_seed_inicial.sql`).

## Backend

```bash
cd backend
npm install
copy .env.example .env   # ajustar DATABASE_URL y JWT_SECRET
npm run dev              # arranca la API (por defecto http://localhost:3000)
npm test                 # Vitest
npm run typecheck        # tsc --noEmit
```

## Frontend

```bash
cd frontend
npm install
npm run dev              # Vite (por defecto http://localhost:5173)
npm test
npm run typecheck
```

## Variables de entorno (backend/.env)

```text
NODE_ENV=development
PORT=3000
DATABASE_URL=mysql://cafe_admin:cafeContra@127.0.0.1:3306/cafe_itsh
JWT_SECRET=cambia-esta-clave
JWT_EXPIRES_IN=8h
```

## Cuentas iniciales (seed)

| Correo | Contraseña | Rol |
|--------|------------|-----|
| `admin@itsh.edu.mx` | `admin123` | administrador |
| `caja@itsh.edu.mx` | `caja123` | cajero |
| `cocina@itsh.edu.mx` | `cocina123` | cocinero |

> Las contraseñas del seed son solo para desarrollo; deben cambiarse en producción.

## Verificación rápida (flujo manual)

1. `POST /api/auth/login` con `admin@itsh.edu.mx` → obtener `token`.
2. `GET /api/auth/me` con `Authorization: Bearer <token>` → confirma rol.
3. Abrir `http://localhost:5173/login`, iniciar sesión y comprobar la redirección por rol.
4. Intentar abrir `/admin` con el token del cajero → debe denegar.

## Criterios de aceptación del sprint

- Credenciales válidas de cada rol redirigen a su ruta; inválidas muestran mensaje claro
  sin revelar si la cuenta existe.
- Acceder a una ruta sin sesión redirige a `/login`; con otro rol, se deniega.
- Las contraseñas nunca viajan ni se almacenan en texto plano.
- `npm test` y `npm run typecheck` en verde (backend y frontend).
