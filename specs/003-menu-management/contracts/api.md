# API Contracts: Sprint 2 — Gestión y consulta del menú

**Feature**: `003-menu-management` | **Date**: 2026-10-13

Convenciones: `/api`, JSON, errores `{ "error": { "code", "message" } }`, `Authorization:
Bearer <jwt>`. Escrituras: rol `administrador`. Consulta: cualquier sesión autenticada.

## Platillos (administrador)

### GET /api/platillos
Lista el catálogo (con filtro opcional `?activo=true|false`).

**200**: `[ { "id":1, "nombre":"Torta de jamón", "categoria":"Comida", "descripcion":"...", "activo":true } ]`

### POST /api/platillos
**Auth**: administrador.

**Body**: `{ "nombre":"Torta de jamón", "categoria":"Comida", "descripcion":"..." }`

**201**: platillo creado.

### PUT /api/platillos/:id
**Auth**: administrador.

**Body** (parcial): `{ "nombre":"...", "categoria":"...", "descripcion":"...", "activo":false }`

**200**: platillo actualizado.

**Errores**: `400` inválido; `403` sin permiso; `404` no encontrado.

## Menú del día (administrador)

### GET /api/menu?fecha=YYYY-MM-DD
Menú de una fecha (por defecto hoy). Disponible para cualquier sesión.

**200**:
```json
[
  { "id": 10, "fecha": "2026-10-13", "platillo_id": 4, "nombre": "Torta de jamón",
    "categoria": "Comida", "descripcion": "...", "precio": 45.00,
    "disponible": true, "especial": false }
]
```

### POST /api/menu
Agrega un platillo al menú de una fecha.

**Auth**: administrador.

**Body**: `{ "fecha":"2026-10-13", "platillo_id":4, "precio":45.00, "disponible":true, "especial":false }`

**201**: entrada de menú creada. **409** si el platillo ya está en esa fecha.

### PUT /api/menu/:id
Edita `precio`, `disponible` o `especial` de una entrada.

**Auth**: administrador.

**Body** (parcial): `{ "precio":50.00, "disponible":false, "especial":true }`

**200**: entrada actualizada.

### DELETE /api/menu/:id
Quita un platillo del menú de una fecha.

**Auth**: administrador. **204** sin contenido.

## Consulta del cliente

### GET /api/menu/cliente?fecha=YYYY-MM-DD
Vista optimizada para el cliente: solo platillos activos con `disponible` y `especial`.

**200**: igual estructura que `GET /api/menu` (sin campos internos).
