# API Contracts: Sprint 1 — Fundamentos y autenticación

**Feature**: `002-foundation-auth-roles` | **Date**: 2026-10-13

Convenciones generales:

- Base URL: `/api`.
- Formato: JSON (`Content-Type: application/json`).
- Errores: `{ "error": { "code": "<CODE>", "message": "<mensaje claro>" } }`.
- Autenticación: `Authorization: Bearer <jwt>` en rutas protegidas.
- Códigos: `200/201` éxito, `400` validación, `401` no autenticado, `403` sin permiso,
  `404` no encontrado, `409` conflicto.

## Autenticación

### POST /api/auth/register

Registra un cliente (alumno/docente). Siempre asigna el rol cliente.

**Auth**: pública.

**Body**:
```json
{ "nombre": "Ana Pérez", "correo": "ana@itsh.edu.mx", "password": "secreto123" }
```

**201**:
```json
{ "id": 5, "nombre": "Ana Pérez", "correo": "ana@itsh.edu.mx", "rol": "usuario" }
```

**Errores**: `400` datos inválidos; `409` correo ya registrado.

### POST /api/auth/login

**Auth**: pública.

**Body**:
```json
{ "correo": "ana@itsh.edu.mx", "password": "secreto123" }
```

**200**:
```json
{
  "token": "<jwt>",
  "usuario": { "id": 5, "nombre": "Ana Pérez", "correo": "ana@itsh.edu.mx", "rol": "usuario" }
}
```

**Errores**: `401` credenciales inválidas (mensaje genérico, sin revelar si el correo
existe); `401` cuenta desactivada (mismo mensaje genérico).

### GET /api/auth/me

Devuelve el usuario de la sesión actual.

**Auth**: Bearer.

**200**:
```json
{ "id": 5, "nombre": "Ana Pérez", "correo": "ana@itsh.edu.mx", "rol": "usuario", "activo": true }
```

**Errores**: `401` token ausente/expirado/inválido.

## Usuarios operativos (solo administrador)

### GET /api/usuarios

Lista usuarios operativos (`cajero`, `cocinero`) y administradores.

**Auth**: Bearer + rol `administrador`.

**200**:
```json
[
  { "id": 2, "nombre": "Carlos", "correo": "caja@itsh.edu.mx", "rol": "cajero", "activo": true },
  { "id": 3, "nombre": "Luis", "correo": "cocina@itsh.edu.mx", "rol": "cocinero", "activo": true }
]
```

### POST /api/usuarios

Crea un usuario operativo.

**Auth**: Bearer + rol `administrador`.

**Body**:
```json
{ "nombre": "Carlos", "correo": "caja@itsh.edu.mx", "password": "secreto123", "rol": "cajero" }
```

**201**: usuario creado (sin `password_hash`).

**Errores**: `400` datos/rol inválidos; `403` sin permiso; `409` correo ya registrado.

### PUT /api/usuarios/:id

Edita nombre, correo, rol y/o `activo` de un usuario operativo.

**Auth**: Bearer + rol `administrador`.

**Body** (parcial):
```json
{ "nombre": "Carlos M.", "activo": false }
```

**200**: usuario actualizado.

**Errores**: `400` datos inválidos; `403` sin permiso; `404` no encontrado.

## Roles válidos

`administrador`, `cajero`, `cocinero`, `usuario`.
