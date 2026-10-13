# Backend — Cafetería ITSH

API REST del Sistema de Pedidos Anticipados (Node.js LTS + Express + TypeScript + MySQL 8.0+).

## Requisitos

- Node.js LTS y npm.
- MySQL 8.0+ con la base `cafe_itsh` (ver `../docs/ejecutar-migraciones.md`).

## Configuración

1. Copia el archivo de ejemplo y ajusta los valores:

   ```bash
   copy .env.example .env
   ```

2. Variables de entorno principales:

   | Variable | Descripción | Ejemplo |
   |----------|-------------|---------|
   | `NODE_ENV` | Entorno | `development` |
   | `PORT` | Puerto de la API | `3000` |
   | `DATABASE_URL` | Cadena de conexión MySQL | `mysql://cafe_admin:cafeContra@127.0.0.1:3306/cafe_itsh` |
   | `JWT_SECRET` | Clave de firma de JWT | (secreto) |
   | `JWT_EXPIRES_IN` | Vigencia del token | `8h` |
   | `CORS_ORIGIN` | Origen permitido (frontend) | `http://localhost:5173` |
   | `PAYMENT_PROVIDER` | Proveedor de pago (`mock` en desarrollo) | `mock` |
   | `PAYMENT_API_KEY` | Clave del proveedor (vacía con `mock`) | (secreto) |
   | `MIN_LEAD_MINUTES` | Anticipación mínima de un pedido | `10` |
   | `MAIL_PROVIDER` | Envío de correo (`console` en dev, `fail` simula errores) | `console` |
   | `MAIL_FROM` | Remitente de las notificaciones | `Cafetería ITSH <no-reply@itsh.edu.mx>` |
   | `NOTIFICACION_MAX_INTENTOS` | Reintentos máximos de envío | `5` |
   | `NOTIFICACION_POLL_MS` | Frecuencia del worker de notificaciones (ms; `0` lo desactiva) | `15000` |

## Comandos

```bash
npm install       # dependencias
npm run dev       # servidor en modo desarrollo (tsx watch)
npm run seed      # crea/actualiza las cuentas operativas iniciales
npm test          # pruebas (Vitest)
npm run typecheck # verificación de tipos
npm run build     # compila a dist/
npm start         # ejecuta la versión compilada
```

## Cuentas iniciales (seed, solo desarrollo)

| Correo | Contraseña | Rol |
|--------|------------|-----|
| `admin@itsh.edu.mx` | `admin123` | administrador |
| `caja@itsh.edu.mx` | `caja123` | cajero |
| `cocina@itsh.edu.mx` | `cocina123` | cocinero |

## Endpoints (Sprint 1)

Base: `/api`. Errores: `{ "error": { "code", "message" } }`.

### Autenticación

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/auth/register` | pública | Registra un cliente (rol `usuario`) |
| `POST` | `/auth/login` | pública | Devuelve `{ token, usuario }` |
| `GET` | `/auth/me` | Bearer | Perfil de la sesión |

### Usuarios operativos (rol `administrador`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/usuarios` | Lista usuarios operativos y administradores |
| `POST` | `/usuarios` | Crea un usuario operativo |
| `PUT` | `/usuarios/:id` | Edita `nombre`, `correo`, `rol` y/o `activo` |

## Endpoints (Sprint 2 — menú)

### Platillos (rol `administrador`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/platillos` | Lista el catálogo (filtro opcional `?activo=true\|false`) |
| `POST` | `/platillos` | Crea un platillo (`nombre`, `categoria?`, `descripcion?`) |
| `PUT` | `/platillos/:id` | Edita `nombre`, `categoria`, `descripcion` y/o `activo` |

### Menú del día

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/menu?fecha=YYYY-MM-DD` | Bearer | Menú de una fecha (por defecto hoy; incluye platillos inactivos) |
| `GET` | `/menu/cliente?fecha=YYYY-MM-DD` | Bearer | Vista del cliente: solo platillos activos |
| `POST` | `/menu` | administrador | Agrega un platillo al menú (`fecha`, `platillo_id`, `precio`, `disponible?`, `especial?`) |
| `PUT` | `/menu/:id` | administrador | Edita `precio`, `disponible` y/o `especial` |
| `DELETE` | `/menu/:id` | administrador | Quita el platillo del menú (`204`) |

Reglas: un platillo solo puede agregarse una vez por fecha (`409`); el precio debe ser
numérico y no negativo (`400`); un platillo inactivo no aparece en `/menu/cliente`.

## Endpoints (Sprint 3 — pedidos y pago)

Requieren sesión autenticada. Cada pedido es privado de su dueño (verificación de propiedad).

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/pedidos` | Crea un pedido anticipado (`fecha_recoleccion`, `items[]`); estado inicial `Pendiente` |
| `GET` | `/pedidos` | Lista los pedidos propios (filtros opcionales `?estado=`, `?desde=`, `?hasta=`) |
| `GET` | `/pedidos/:id` | Detalle de un pedido propio con `items` e `historial` |
| `POST` | `/pedidos/:id/pagar` | Paga en línea (`token_pago`); pasa el pedido a `Pagado` |
| `POST` | `/pedidos/:id/cancelar` | Cancela un pedido propio mientras siga `Pendiente` |

Reglas y códigos:

- El `total` y los `precio_unitario` se calculan en el backend; el cliente no puede fijarlos.
- Ventana mínima `MIN_LEAD_MINUTES` sobre `fecha_recoleccion` (`409` si no se cumple).
- Platillo no disponible o inactivo: `409`.
- Pago rechazado: `402` y el pedido continúa `Pendiente`. Pedido ya no `Pendiente`: `409`.
- Pedido inexistente o ajeno: `404`.
- El pago (`pago`) es único por pedido (`UNIQUE(pedido_id)`); nunca se reciben ni almacenan
  datos de tarjeta, solo el `token_pago` del proveedor.
- En desarrollo `PAYMENT_PROVIDER=mock`: `tok_ok_*` aprueba, `tok_fail_*` rechaza.

## Endpoints (Sprint 4 — ventanilla y cocina)

### Caja (rol `cajero` o `administrador`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/caja/pedidos` | Registra un pedido de mostrador (`cliente_nombre?`, `items[]`); sin ventana mínima; estado inicial `Pendiente` |
| `GET` | `/caja/pedidos` | Lista los pedidos `Listo` pendientes de entrega |
| `GET` | `/caja/pedidos/:id` | Detalle del pedido para el cobro (sin verificación de propiedad) |
| `POST` | `/caja/pedidos/:id/cobrar` | Cobra en caja (`metodo`: `efectivo` \| `tarjeta`); pasa el pedido a `Pagado` |
| `POST` | `/caja/pedidos/:id/entregar` | `Listo` → `Entregado` |
| `POST` | `/caja/pedidos/:id/cancelar` | Cancela un pedido de mostrador mientras siga `Pendiente` |

### Cocina (rol `cocinero` o `administrador`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/cocina/pedidos` | Pedidos `Pagado` y `En preparación`, ordenados por hora de recolección |
| `POST` | `/cocina/pedidos/:id/iniciar` | `Pagado` → `En preparación` |
| `POST` | `/cocina/pedidos/:id/listo` | `En preparación` → `Listo` |

Reglas y códigos:

- Los folios de mostrador usan el prefijo `M-` (los anticipados, `A-`); `fecha_recoleccion`
  de un pedido de mostrador se fija al momento de crearlo.
- El cobro en caja no usa `PaymentGateway`: inserta `pago` (`metodo` `efectivo`/`tarjeta`) y
  cambia el estado en una transacción.
- Pago único por pedido (`UNIQUE(pedido_id)`): doble cobro `409`; pedido no `Pendiente` `409`.
- Transiciones de estado validadas contra la tabla `transicion_estado`; toda transición
  inserta una fila en `pedido_estado_historial`. Una transición fuera de secuencia o
  concurrente: `409`.
- Pedido inexistente: `404`; sin el rol requerido: `403`; sin sesión: `401`.

## Endpoints (Sprint 5 — seguimiento y notificaciones)

### Notificaciones (rol `usuario`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/notificaciones` | Lista las notificaciones propias, más recientes primero |
| `POST` | `/notificaciones/:id/leer` | Marca una notificación propia como leída |

Reglas y códigos:

- Solo los pedidos **anticipados** generan notificación; se crea al pasar el pedido a
  `Listo` (`cocinaService`), dentro de la misma transacción.
- El `usuario_id` del pedido distingue al destinatario; pedido inexistente o ajenos:
  `404`; notificación de otro usuario: `403`.
- El `creado_en` de la API corresponde a la columna `fecha` de `notificacion`; el
  `detalle_error` se expone como diagnóstico de envío. Los valores de `estado_envio`
  son `pendiente`, `enviada` y `fallida` (este último tras agotar
  `NOTIFICACION_MAX_INTENTOS`).
- El **worker** (`notificacionWorker`) procesa las notificaciones `pendiente`
  periódicamente (`NOTIFICACION_POLL_MS`; `0` lo desactiva). El transporte de correo es
  un stub (`ConsoleMailer` / `FailMailer`) tras la interfaz `Mailer`; el SMTP real es un
  punto de extensión documentado.
- En el detalle de un pedido propio, un pedido ajeno devuelve `403` y uno inexistente
  `404`; las acciones `pagar`/`cancelar` de un pedido ajeno siguen devolviendo `404`.

### Utilidad

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Verificación de disponibilidad |

## Estructura

```text
src/
├── config/       # carga y validación de variables de entorno
├── db/           # pool de MySQL y repositorios
├── middlewares/  # auth, validación, manejo de errores
├── controllers/  # capa HTTP
├── services/     # lógica de negocio (incluye mail/ y notificacionService)
├── workers/      # workers en segundo plano (notificaciones)
├── routes/       # definición de rutas
├── schemas/      # esquemas de validación (zod)
└── utils/        # jwt, password, logger, errores
scripts/          # seed de usuarios
tests/            # unit e integration (Vitest + supertest)
```
