# Demo final — Sprint 5: Seguimiento, notificaciones y pulido

**Sistema de Pedidos Anticipados — Cafetería ITSH**
**Feature**: `specs/006-order-tracking-notifications/` | **Fecha**: 2026-10-13

Guion para la demostración funcional ante la patrocinadora que cierra el MVP
(ver `docs/sprints.md` y `docs/reglas.md` §Aceptación final).

## Objetivo de la demo

Demostrar el flujo completo de extremo a extremo:

> menú → selección → pedido → pago → cocina → preparación → listo →
> notificación → recogida (entrega)

y validar los criterios de aceptación del Sprint 5.

## Prerrequisitos

1. Base de datos `cafe_itsh` con las migraciones `001` → `002` → `003` → `004`
   aplicadas (ver `docs/ejecutar-migraciones.md`).
2. Cuentas operativas sembradas (`npm run seed` en `backend`).
3. Variables de correo en `backend/.env`: `MAIL_PROVIDER=console` (el envío se
   registra en la consola del backend) y `NOTIFICACION_POLL_MS=15000`.
4. Servicios levantados:
   ```bash
   cd backend && npm run dev     # http://localhost:3000/api
   cd frontend && npm run dev    # http://localhost:5173
   ```

## Actores y credenciales (solo desarrollo)

| Rol | Correo | Contraseña | Ruta inicial |
|-----|--------|------------|--------------|
| Administrador | `admin@itsh.edu.mx` | `admin123` | `/admin` |
| Cajero | `caja@itsh.edu.mx` | `caja123` | `/caja` |
| Cocinero | `cocina@itsh.edu.mx` | `cocina123` | `/cocina` |
| Cliente | (registrar en la demo) | — | `/menu` |

> Se recomienda abrir 4 ventanas/incógnitos para evitar cruzar sesiones.

## Guion paso a paso

### 1. Administrador publica el menú del día
1. Entrar como `admin@itsh.edu.mx` → `/admin/platillos`.
2. Crear 2–3 platillos (p. ej. «Torta de jamón», «Agua de horchata»).
3. Ir a `/admin/menu`, agregar los platillos al menú de **hoy** con precio.
4. Marcar uno como **especial** y dejar otro como **no disponible**.
   - **Esperado**: el platillo no disponible se verá identificado y no se podrá pedir.

### 2. Cliente hace un pedido anticipado y paga
1. Registrarse en `/register` y entrar a `/menu`.
2. Agregar platillos al carrito → `/carrito`, elegir hora de recolección
   (≥ 10 minutos) y confirmar.
3. En `/pago/:id`, pagar con el proveedor `mock` (token `tok_ok_*`).
   - **Esperado**: el pedido pasa a **Pagado** y aparece en cocina.
   - **Negativo**: un token `tok_fail_*` rechaza el pago (`402`); el pedido sigue **Pendiente**.

### 3. Cocina prepara el pedido
1. En `/cocina`, el pedido aparece en estado **Pagado**.
2. Pulsar **Iniciar preparación** → **En preparación**.
3. Pulsar **Marcar listo** → **Listo**.
   - **Esperado**: al pasar a `Listo` se crea la notificación del cliente
     (se ve el intento de correo en la consola del backend).

### 4. Cliente ve el seguimiento y el aviso
1. En `/mis-pedidos`, el pedido muestra estado **Listo** y su **timeline**
   (Pendiente → Pagado → En preparación → Listo).
2. La **campana de avisos** de la barra superior muestra el aviso
   «Tu pedido … está listo para recoger»; al abrirlo se marca como leído.
3. La lista se refresca sola cada 12 s (sin recargar la página).

### 5. Cajero confirma la entrega
1. En `/caja`, el panel **«Listos para entrega»** lista el pedido.
2. Pulsar **Confirmar entrega** → **Entregado**.
   - **Esperado**: el pedido desaparece del panel y pasa a `Entregado`.

### 6. Flujo de mostrador (sin cuenta)
1. Como cajero, en `/caja` armar un pedido con `cliente_nombre` y cobrar
   (efectivo o tarjeta).
2. El pedido entra a cocina; iniciar → marcar listo → confirmar entrega.
   - **Esperado**: un pedido de mostrador **no** genera notificación al cliente.

### 7. Verificaciones negativas
1. Intentar **Confirmar entrega** de un pedido que no está `Listo` → `409`.
2. Con dos cuentas de cliente distintas, abrir el detalle de un pedido ajeno
   → `403`.
3. Intentar `pagar`/`cancelar` el pedido de otro usuario → `404`.

## Criterios de aceptación (checklist)

- [ ] El 100 % de los pedidos que llegan a `Listo` genera el aviso al cliente.
- [ ] Flujo completo demostrable: menú → selección → pedido → pago → cocina →
      preparación → listo → notificación → recogida.
- [ ] El cliente ve el estado actualizado de su pedido (< 2 s tras refrescar).
- [ ] Un fallo de correo (`MAIL_PROVIDER=fail`) se registra como `fallida` con
      `intentos > 0` y se reintenta sin perderse.
- [ ] El cajero confirma la entrega → `Entregado` con historial.
- [ ] Sin acceso a pedidos/notificaciones ajenos (`403`).
- [ ] `npm test` y `npm run typecheck` en verde (backend y frontend).

## Verificación en base de datos

```sql
-- Notificaciones del cliente (estado de envío y reintentos)
SELECT id, pedido_id, tipo, mensaje, estado_envio, intentos, leida, fecha
FROM notificacion ORDER BY id DESC LIMIT 10;

-- Timeline de un pedido
SELECT h.fecha, e.nombre AS estado_nuevo
FROM pedido_estado_historial h
JOIN estado_pedido e ON e.id = h.estado_nuevo_id
WHERE h.pedido_id = ? ORDER BY h.fecha ASC;
```

Para probar el reintento: poner `MAIL_PROVIDER=fail` en `backend/.env`,
reiniciar el backend, provocar un pedido `Listo` y observar `estado_envio =
fallida`; luego volver a `console` y esperar el paso del worker
(`NOTIFICACION_POLL_MS`).

## Solución de problemas

| Situación | Causa probable | Acción |
|-----------|----------------|--------|
| No aparece el aviso | Worker desactivado (`NOTIFICACION_POLL_MS=0`) o backend sin reiniciar | Revisar `backend/.env` y reiniciar |
| El menú del cliente sale vacío | Platillos no agregados a la fecha de hoy | Revisar `/admin/menu` |
| `409` al crear pedido | Hora de recolección con menos de `MIN_LEAD_MINUTES` | Elegir una hora ≥ 10 min |
| El correo no se ve | `MAIL_PROVIDER=console` imprime en la consola del backend | Revisar la terminal del backend |
