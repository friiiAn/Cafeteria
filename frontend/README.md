# Frontend — Cafetería ITSH

Aplicación web única (React + TypeScript + Vite + Tailwind CSS) del Sistema de Pedidos
Anticipados. Organiza las vistas por rol mediante rutas protegidas con JWT.

## Requisitos

- Node.js LTS y npm.
- El backend corriendo en `http://localhost:3000` (o ajustar `VITE_API_URL`).

## Configuración

```bash
copy .env.example .env
```

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL base de la API | `http://localhost:3000/api` |

## Comandos

```bash
npm install        # dependencias
npm run dev        # servidor de desarrollo (http://localhost:5173)
npm run build      # compilación de producción
npm run preview    # sirve la compilación
npm run lint       # ESLint
npm test           # pruebas (Vitest + Testing Library)
npm run typecheck  # verificación de tipos
```

## Rutas por rol

| Ruta | Rol | Descripción |
|------|-----|-------------|
| `/login` | pública | Inicio de sesión |
| `/register` | pública | Registro de cliente |
| `/admin` | administrador | Gestión de usuarios operativos |
| `/admin/platillos` | administrador | Catálogo de platillos |
| `/admin/menu` | administrador | Menú del día |
| `/caja` | cajero | Armar y cobrar pedidos de mostrador |
| `/caja/:id/cobro` | cajero | Cobro de un pedido de mostrador (efectivo/tarjeta) |
| `/cocina` | cocinero | Tablero de cocina con acciones iniciar/listo |
| `/menu` | cliente | Consulta del menú y armado del carrito |
| `/carrito` | cliente | Resumen del pedido y hora de recolección |
| `/pago/:id` | cliente | Detalle del pedido y pago en línea |
| `/mis-pedidos` | cliente | Seguimiento de pedidos propios (se refresca automáticamente) |

Las rutas protegidas exigen sesión activa; si el rol no corresponde, el usuario es
redirigido a su módulo.

En las vistas de cliente, la barra superior incluye una campana de avisos
(`NotificacionBell`) que sondea las notificaciones y las marca como leídas. La lista
`/mis-pedidos` consulta el estado cada 12 s y muestra el timeline de cada pedido; la
vista de caja muestra un panel «Listos para entrega» que se actualiza cada 10 s.

## Estructura

```text
src/
├── components/
│   ├── ui/          # primitives estilo shadcn/ui
│   └── layouts/     # layouts de autenticación y de la app
├── contexts/        # AuthContext (sesión)
├── lib/             # apiClient, carrito, utilidades
├── pages/           # páginas por rol
│   ├── admin/
│   ├── caja/
│   ├── cocina/
│   └── clientes/
└── test/            # configuración de pruebas
```
