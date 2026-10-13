# Research: Sprint 1 — Fundamentos y autenticación

**Feature**: `002-foundation-auth-roles` | **Date**: 2026-10-13

## Decisiones técnicas

### 1. Driver de acceso a datos: `mysql2`

- **Decisión**: usar `mysql2` con pool de conexiones y `prepared statements`.
- **Razón**: `docs/reglas.md` §4 pide MySQL y una librería de acceso a datos; §22 prohíbe
  ORMs innecesarios. `mysql2` es ligero, compatible con MySQL 8.0 y soporta promesas.
- **Alternativas descartadas**: `pg` (era PostgreSQL), ORM completo como Sequelize
  (sobre-ingeniería para el tamaño del MVP).

### 2. Hash de contraseñas: `bcryptjs`

- **Decisión**: `bcryptjs` con costo 10.
- **Razón**: `bcryptjs` es puro JavaScript (sin binarios nativos) y cumple el requisito de
  almacenamiento no reversible (FR-006).
- **Alternativas descartadas**: `bcrypt` nativo (compilación), `argon2` (mayor complejidad).

### 3. Sesiones: JWT con `jsonwebtoken`

- **Decisión**: JWT firmado (HS256) con `expiresIn` y payload `{ sub, rol }`.
- **Razón**: `docs/reglas.md` §5 exige JWT. Payload mínimo para evitar exponer datos.
- **Alternativas descartadas**: sesiones en servidor con cookies (no requerido).

### 4. Validación de entrada: `zod`

- **Decisión**: esquemas `zod` compartidos en backend para validar body/params.
- **Razón**: FR-013 exige validar en backend; tipado estricto TS.
- **Alternativas descartadas**: `express-validator` (menos tipado con TS).

### 5. Estructura del backend

`backend/src/{config,db,routes,controllers,services,middlewares,utils}`; `app.ts` monta
las rutas y `server.ts` arranca. Respeta `docs/reglas.md` §17 sin capas innecesarias.

### 6. Estructura del frontend

Renombrar `fronted/` → `frontend/` y migrar a **TypeScript**: `main.tsx`, `App.tsx`,
`vite.config.ts`, `tsconfig.json`. Rutas con `react-router-dom` y guardas por rol.
Layouts por rol en `frontend/src/pages/{admin,caja,cocina,clientes}`.

### 7. Control de acceso por rol (RBAC)

Middleware `requireAuth` (valida JWT) + `requireRole(...roles)` (verifica rol). En el
frontend, un componente `ProtectedRoute` con `requiredRole` redirige a `/login` o muestra
"acceso denegado".

### 8. Manejo de errores

Middleware central de errores que responde `{ error: { code, message } }` con códigos HTTP
adecuados, sin stack traces (FR-015). Registro de errores en consola/servidor.

### 9. Testing con Vitest

Pruebas unitarias de servicios (hash, tokens, RBAC) y de integración de endpoints
(supertest). Scripts `npm test` y `npm run typecheck` en backend y frontend (SC-005).

### 10. Variables de entorno

`DATABASE_URL` (o `DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD`), `JWT_SECRET`,
`NODE_ENV`, `PORT`. Plantilla `.env.example` versionada; `.env` ignorado por git.

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| Triggers de MySQL requieren `log_bin_trust_function_creators` | Documentado en `docs/ejecutar-migraciones.md` |
| Scaffold en JSX contradice reglas TS | Tarea explícita de migración a TS en Sprint 1 |
| Carpeta mal nombrada `fronted/` | Renombrar a `frontend/` en Setup |
| Fuga de información en login | Mensaje genérico único para credenciales inválidas |
