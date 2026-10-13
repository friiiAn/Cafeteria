# Quickstart: Sprint 2 — Gestión y consulta del menú

**Feature**: `003-menu-management` | **Date**: 2026-10-13

## Prerrequisitos

- Sprint 1 completado (auth + RBAC + backend/frontend levantando).
- Migraciones aplicadas (`migrations/001`, `002`).

## Levantar

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

## Flujo manual de verificación

1. Iniciar sesión como administrador (`admin@itsh.edu.mx`).
2. En `/admin`, crear un platillo nuevo y agregarlo al menú de hoy con precio.
3. Marcar otro platillo como **no disponible** y uno como **especial**.
4. Abrir `/menu` (cliente): ver el especial destacado y el no disponible identificado.
5. Cambiar el precio de un platillo en admin y recargar `/menu`: el precio cambia de inmediato.
6. Intentar gestionar menú con una sesión de cajero → respuesta `403`.

## Pruebas

```bash
cd backend && npm test && npm run typecheck
cd frontend && npm test && npm run typecheck
```

## Criterios de aceptación del sprint

- Un platillo no disponible aparece identificado y no puede seleccionarse.
- Los cambios de precio/disponibilidad se reflejan de inmediato en `/menu`.
- El menú se consulta sin esperas perceptibles en horario de receso (móvil).
