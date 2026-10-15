# DiseÃ±o UI/UX â€” Pantalla de Cocina (KDS)

Documento de diseÃ±o (propuesta, sin implementaciÃ³n) para la pantalla
`/cocina`. Es una de las tres piezas de la divisiÃ³n de diseÃ±os por rol:

- `docs/diseÃ±o-operativo.md` â€” administraciÃ³n y caja
- **`docs/diseÃ±o-cocina.md`** (este) â€” tablero de cocina (KDS)
- `docs/diseÃ±o-cliente.md` â€” app del cliente (menÃº, pedido, mis pedidos)

El sistema de diseÃ±o canÃ³nico es **`docs/DESIGN.md`**. Este documento no
redefine paleta ni tipografÃ­a; usa sus tokens (`status-*`, `font-heading`,
regla de 8px) y sus componentes descritos: *Kitchen/Cashier panels*.

> **Nota de alcance:** implementar este diseÃ±o requiere una spec nueva
> (p. ej. `specs/007-ui-redesign`) con aprobaciÃ³n previa (constituciÃ³n Â§I).

---

## 1. Reglas aplicables a esta pantalla

| Regla | Fuente | ImplicaciÃ³n de diseÃ±o |
|---|---|---|
| Una sola pantalla de cocina | FR-017 | Sin sub-vistas ni filtros que obliguen a navegar |
| Ãrea tÃ¡ctil â‰¥ 44 px, alto contraste | FR-020, Â§19 | CTA por tarjeta de 48 px, filas altas |
| MÃ­nimos pasos | Â§19 | Un toque = un avance de estado (Pagado â†’ En preparaciÃ³n â†’ Listo) |
| ActualizaciÃ³n sin recarga manual | FR-017, SC-S4-03 | Sondeo cada 4 s con feedback visible |
| Rapidez en horario de receso | Â§2, Â§19 | Orden por llegada, folio y cantidades legibles de un vistazo |

---

## 2. NavegaciÃ³n propuesta

Hoy: `RoleHeader` + un solo tab "Pedidos". Con una Ãºnica vista, la bottom bar
no aporta; se propone **header con menÃº hamburguesa + drawer** (mismo patrÃ³n
que admin/caja):

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ â˜°  Cocina        â— 5 pedidos  Â·  act. hace 2 s   â”‚  header sticky
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                    â”‚ hamburguesa
                    â–¼
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ‘¤  Cocinero Juan PÃ©rez    â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚  Pedidos      â† activo     â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚  Cerrar sesiÃ³n             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- En escritorio el listado del drawer queda como panel lateral fijo
  (DESIGN.md: "paneles laterales para caja y cocina").
- El contador "N pedidos" y "act. hace X s" provienen del mismo sondeo
  existente (`GET /api/cocina/pedidos`, cada 4 s): el estado local ya sabe
  cuÃ¡ndo se actualizÃ³ por Ãºltima vez.

---

## 3. Pantalla: Tablero de cocina

### 3.1 Estructura general

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Encabezado: tÃ­tulo + contadores + "act. hace 2 s"           â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚  Grid de tarjetas de pedido (1 col mÃ³vil / 2 sm / 3 lg)      â”‚
â”‚  ordenadas por llegada (orden del servidor)                  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

- Se conserva el **grid responsivo actual** (mÃ³vil 1 columna, `sm` 2, `lg`
  3) y el orden por llegada de ambos orÃ­genes (anticipado y mostrador) en
  una sola vista (FR-017).
- **[Opcional escritorio]** Agrupar en dos columnas por estado: *Por
  preparar (Pagado)* y *En preparaciÃ³n*, manteniendo el orden de llegada
  dentro de cada columna. En mÃ³vil, una sola lista con badges de estado.

### 3.2 Tarjeta de pedido (panel KDS)

DiseÃ±o por defecto de DESIGN.md: *"folio grande, tiempo transcurrido y CTA
de acciÃ³n claro"*.

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ #47                      [ En preparaciÃ³n ]  â† badge pill status-*
â”‚ A-1024                    â— Anticipado       â† chip de origen
â”‚ Marta LÃ³pez Â· 11:05 Â· recoge 11:30           â† hora y recolecciÃ³n
â”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚
â”‚  2Ã—  CafÃ© americano                      â”‚  cantidades en
â”‚  1Ã—  Concha verde                        â”‚  â‰¥20 px peso 800
â”‚â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”‚
â”‚  [      Iniciar preparaciÃ³n / Marcar listo     ]  â† CTA 48 px
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

Detalle:

- **Folio de orden** (`#47`) en `font-heading` peso 800, verde primario;
  **nÃºmero de pedido** (`A-1024`) en `font-mono` 20 px+.
- **Badge de estado** pill con color `status-*` y texto blanco:
  `Pagado` (verde #1E7A46), `En preparaciÃ³n` (#B45309), `Listo` (#0369A1).
- **Chip de origen:** "Anticipado" / "Mostrador" en `secondary-container`.
- **Hora de registro** y, si existe, **"recoge HH:MM"** destacada en peso
  700 (es la hora comprometida con el cliente).
- **Tiempo transcurrido** calculado en cliente desde `creado_en` (sin cambio
  de backend): texto `caption` con hora; si la hora de recolecciÃ³n ya pasÃ³,
  cambia a color `error` con texto "Â¡Retrasado!".
- **Partidas:** `NÃ—` en peso 800 â‰¥ 20 px + nombre; mÃ¡ximo contraste.
- **CTA Ãºnico por tarjeta** (Ã¡rea tÃ¡ctil 48 px, ancho completo):
  - `Pagado` â†’ **Iniciar preparaciÃ³n** (primario verde)
  - `En preparaciÃ³n` â†’ **Marcar listo** (primario verde)
  - `Listo` â†’ sin CTA: badge "Listo â€” en espera de caja" en texto
    secundario (el siguiente paso es de caja, no de cocina)
- El CTA se deshabilita mientras se procesa la tarjeta
  (`ocupado === pedido.id`) manteniendo el feedback actual.

### 3.3 Estados de la pantalla

- **Cargando:** "Cargando pedidosâ€¦" (texto `caption`, sin spinner pesado).
- **VacÃ­o:** tarjeta centrada con ilustraciÃ³n ligera y texto
  *"Â¡Todo estÃ¡ al dÃ­a! No hay pedidos en cocina. Los pedidos pagados
  aparecen aquÃ­ solos."*
- **Error:** mensaje + botÃ³n `Reintentar`; el sondeo continÃºa.
- **Conflicto** (otro operador ya avanzÃ³ o el pedido se cancelÃ³): aviso
  `role="alert"` arriba con el mensaje del servidor y recarga automÃ¡tica
  (comportamiento actual del `catch` â†’ `recargar`).
- **Feedback de sondeo:** indicador "act. hace X s" en el header; si fallan
  2 sondeos consecutivos, cambia a "Sin conexiÃ³n â€” reintentandoâ€¦" en color
  `error` sin bloquear la vista.

---

## 4. Fuera de alcance en cocina

- **Filtros avanzados** (por tipo, hora o platillo) y **bÃºsqueda**: el
  principio de "una sola pantalla y mÃ­nimos pasos" (FR-017, Â§19) los
  desaconseja; ademÃ¡s agregarlos cambiarÃ­a el alcance aprobado.
- **Sonido/vibraciÃ³n** al entrar un pedido: requerirÃ­a permisos de
  navegador y spec aparte.
- **ImpresiÃ³n de tickets:** no existe infraestructura ni endpoint.
- **Historial de pedidos terminados** en cocina: no aplica (la fuente es
  `/api/cocina/pedidos`, solo activos).

---

## 5. Checklist de cumplimiento

- [ ] Una sola pantalla, sin navegaciÃ³n para ver pedidos (FR-017).
- [ ] CTA â‰¥ 44 px (48 px propuestos) y alto contraste (FR-020).
- [ ] Un toque por avance de estado; sin formularios intermedios (Â§19).
- [ ] Folio, cantidades y horas legibles de un vistazo a â‰¥1 metro
      (tipografÃ­a â‰¥ 20 px peso 700/800 en cifras).
- [ ] Estados vacÃ­os/carga/error/conflicto definidos.
- [ ] Sondeo cada 4 s con feedback visible y sin recarga manual.
