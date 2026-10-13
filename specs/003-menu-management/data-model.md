# Data Model: Sprint 2 — Gestión y consulta del menú

**Feature**: `003-menu-management` | **Date**: 2026-10-13

Fuente: `migrations/001_crear_esquema.sql` (MySQL 8.0+).

## Tablas de este sprint

### `platillo`

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `nombre` | VARCHAR(100) | NOT NULL |
| `categoria` | VARCHAR(50) | NULL |
| `descripcion` | TEXT | NULL |
| `activo` | TINYINT(1) | NOT NULL, DEFAULT 1 |
| `creado_en` | DATETIME | NOT NULL, DEFAULT CURRENT_TIMESTAMP |
| `actualizado_en` | DATETIME | NOT NULL (trigger `trg_platillo_actualizado`) |

### `menu_dia`

| Columna | Tipo | Restricciones |
|---------|------|---------------|
| `id` | INT | PK, AUTO_INCREMENT |
| `fecha` | DATE | NOT NULL |
| `platillo_id` | INT | NOT NULL, FK → `platillo(id)` |
| `precio` | DECIMAL(10,2) | NOT NULL, CHECK ≥ 0 |
| `disponible` | TINYINT(1) | NOT NULL, DEFAULT 1 |
| `especial` | TINYINT(1) | NOT NULL, DEFAULT 0 |

Restricción única: `uq_menu_dia_fecha_platillo (fecha, platillo_id)`.
Índice: `idx_menu_dia_fecha (fecha)`.

## Reglas de negocio

- Un platillo puede existir en el menú de varias fechas, pero solo una vez por fecha.
- El precio pertenece a la fecha (se congela); no se toma del catálogo.
- `disponible = 0` marca el platillo como no seleccionable para esa fecha.
- `especial = 1` destaca el platillo dentro del menú de la fecha.
- `platillo.activo = 0` lo saca de la oferta (no debe listarse en el menú).

## Relaciones

```
platillo 1 ──── N menu_dia
```

## Mapeo de entidades de la spec

| Entidad spec | Tabla |
|--------------|-------|
| Platillo | `platillo` |
| Menú del día | `menu_dia` |
| Especial del día | `menu_dia.especial` |

## Consulta principal

```sql
SELECT md.id, md.fecha, p.id AS platillo_id, p.nombre, p.categoria, p.descripcion,
       md.precio, md.disponible, md.especial
FROM menu_dia md
JOIN platillo p ON p.id = md.platillo_id
WHERE md.fecha = ? AND p.activo = 1
ORDER BY md.especial DESC, p.nombre;
```
