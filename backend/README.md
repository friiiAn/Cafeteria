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
├── services/     # lógica de negocio
├── routes/       # definición de rutas
├── schemas/      # esquemas de validación (zod)
└── utils/        # jwt, password, logger, errores
scripts/          # seed de usuarios
tests/            # unit e integration (Vitest + supertest)
```
