# Data Model: Sprint 1 — Fundamentos y autenticación

**Feature**: `002-foundation-auth-roles` | **Date**: 2026-10-13

Fuente: `migrations/001_crear_esquema.sql` y `migrations/002_seed_inicial.sql` (MySQL 8.0+).

## Tablas de este sprint

### `rol`

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `nombre` | VARCHAR(30) | NOT NULL, UNIQUE |
| `creado_en` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |

Seed: `administrador`, `cajero`, `cocinero`, `usuario` (cliente/alumno-docente).

### `usuario`

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `nombre` | VARCHAR(100) | NOT NULL |
| `correo` | VARCHAR(150) | NOT NULL, UNIQUE |
| `password_hash` | VARCHAR(255) | NOT NULL (bcrypt) |
| `activo` | TINYINT(1) | NOT NULL, DEFAULT 1 |
| `rol_id` | INT | NOT NULL, FK → `rol(id)` |
| `creado_en` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| `actualizado_en` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP (trigger) |

Índice: `idx_usuario_rol (rol_id)`. Trigger: `trg_usuario_actualizado`.

## Reglas de negocio

- `correo` es único; el registro y la creación de operativos fallan si ya existe.
- `password_hash` nunca contiene la contraseña en claro.
- `activo = 0` impide el inicio de sesión.
- Un usuario tiene exactamente un `rol_id` (uno a muchos rol→usuario).
- Solo el rol `administrador` puede crear/editar usuarios operativos (`cajero`, `cocinero`).
- El autorregistro siempre asigna el rol `usuario` (cliente); nunca roles privilegiados.

## Relaciones

```
rol 1 ──── N usuario
```

## Mapeo de entidades de la spec

| Entidad spec | Tabla |
|--------------|-------|
| Rol | `rol` |
| Usuario | `usuario` |
