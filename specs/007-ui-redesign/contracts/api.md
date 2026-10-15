# API Contracts: Sprint 7 — Rediseño UI/UX por rol

**Feature**: `007-ui-redesign` | **Date**: 2026-10-14

Convenciones: `/api`, JSON, errores `{ "error": { "code", "message" } }`,
`Authorization: Bearer <jwt>`. Este sprint **solo amplía** dos respuestas de
lectura; no cambia rutas, métodos ni códigos de estado.

## Cocina — `GET /api/cocina/pedidos`

**Auth**: `cocinero` | `administrador`.

Pedidos activos (`Pagado`, `En preparación`, `Listo`) ordenados por llegada.

**200** (campos nuevos en negrita conceptual):
```json
[
  {
    "id": 47,
    "numero": "A-20261014-001",
    "tipo": "anticipado",
    "estado": "En preparación",
    "cliente_nombre": "Marta López",
    "creado_en": "2026-10-14T11:05:00",
    "fecha_recoleccion": "2026-10-14T11:30:00",
    "items": [
      { "cantidad": 2, "nombre": "Café americano" },
      { "cantidad": 1, "nombre": "Concha verde" }
    ]
  }
]
```

- `cliente_nombre`: `null` en mostrador sin nombre; la UI muestra "Sin nombre".
- `creado_en`: nuevo; alimenta el tiempo transcurrido.

## Entregas de caja — `GET /api/caja/pedidos`

**Auth**: `cajero` | `administrador`.

Pedidos en estado `Listo` pendientes de entrega.

**200**:
```json
[
  {
    "id": 47,
    "numero": "A-20261014-001",
    "tipo": "anticipado",
    "cliente_nombre": "Marta López",
    "total": 55.00,
    "creado_en": "2026-10-14T11:05:00",
    "fecha_recoleccion": "2026-10-14T11:30:00",
    "items": [
      { "cantidad": 2, "nombre": "Café americano" },
      { "cantidad": 1, "nombre": "Concha verde" }
    ]
  }
]
```

- `creado_en` e `items`: nuevos; alimentan la hora de registro y las partidas.

## Endpoints reutilizados sin cambio

| Uso | Endpoint | Auth |
|-----|----------|------|
| Landing admin (conteos y resumen) | `GET /api/usuarios`, `GET /api/platillos`, `GET /api/menu` | admin |
| Catálogo de caja y cliente | `GET /api/menu/cliente` | cajero/admin/usuario |
| Crear pedido mostrador | `POST /api/caja/pedidos` | cajero/admin |
| Cobrar / cancelar (caja) | `POST /api/caja/pedidos/:id/cobrar`, `/cancelar` | cajero/admin |
| Entregar | `POST /api/caja/pedidos/:id/entregar` | cajero/admin |
| Avanzar cocina | `POST /api/cocina/pedidos/:id/iniciar`, `/listo` | cocinero/admin |
| Crear pedido anticipado | `POST /api/pedidos` | usuario |
| Pagar pedido | `POST /api/pedidos/:id/pagar` | usuario |
| Mis pedidos + detalle | `GET /api/pedidos`, `GET /api/pedidos/:id` | usuario |
| Notificaciones | `GET /api/notificaciones`, `POST /api/notificaciones/:id/leer` | usuario |

## Rutas de frontend (no son API)

| Ruta | Pantalla | Nota |
|------|----------|------|
| `/admin` | Landing admin (conteos) | nueva |
| `/admin/usuarios` | Usuarios | rediseño |
| `/admin/platillos` | Platillos | rediseño |
| `/admin/menu` | Menú del día | rediseño |
| `/caja` | Panel de caja | nueva landing |
| `/caja/nuevo` | Catálogo / nuevo pedido | nueva |
| `/caja/entregas` | Entregas | nueva |
| `/caja/:id/cobro` | Cobro (fallback, efectivo) | conservada |
| `/cocina` | Tablero KDS | rediseño |
| `/menu` | Menú del cliente | rediseño |
| `/pedido/confirmar` | Confirmar pedido | nueva (reemplaza `/carrito`) |
| `/pedido/:id/pago` | Pago simulado | nueva (reemplaza `/pago/:id`) |
| `/pedido/:id/confirmacion` | Confirmación con folio | nueva |
| `/mis-pedidos` | Mis pedidos | rediseño |

**Redirects**: `/carrito` → `/pedido/confirmar`; `/pago/:id` →
`/pedido/:id/pago`.

## Reglas transversales

- Las respuestas ampliadas son **compatibles hacia atrás** (solo agregan campos).
- Las rutas siguen protegidas por JWT y rol (§IV).
- El pago NO recibe ni expone datos de tarjeta.
