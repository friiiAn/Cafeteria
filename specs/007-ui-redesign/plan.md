# Implementation Plan: Sprint 7 — Rediseño UI/UX por rol

**Branch**: `007-ui-redesign` | **Date**: 2026-10-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-ui-redesign/spec.md`

## Summary

Implementar los diseños de `design/` como shell de navegación (drawer lateral +
bottom bar por rol) y como rediseño de las pantallas de admin, caja, cocina y
cliente, sin agregar funcionalidad de negocio. Se reutilizan los endpoints
existentes salvo dos ajustes de solo lectura en el backend (cocina y entregas de
caja) y no se introducen dependencias nuevas (drawer, bottom bar, chips y sheets
se construyen con React Router + Tailwind sobre los primitivos `ui/`).

## Technical Context

**Language/Version**: TypeScript 5.x — React 19 + TypeScript + Vite (frontend);
Node.js LTS + Express (backend)

**Primary Dependencies**: React Router, Tailwind CSS, primitivos `components/ui/*`
(shadcn/ui copiados); `mysql2`, zod, Express; Vitest. **Sin dependencias nuevas.**

**Storage**: MySQL 8.0+ — sin migraciones nuevas (solo consultas extendidas).

**Testing**: Vitest + supertest (backend, campos nuevos y contratos); Vitest +
Testing Library (frontend, componentes y rutas).

**Target Platform**: Web responsiva (móvil y escritorio).

**Project Type**: Web app (frontend + backend).

**Performance Goals**: sondeo de cocina cada 4 s con feedback; catálogo filtrado en
vivo; SC-001 de 001 (respuesta fluida en receso).

**Constraints**: área táctil ≥ 44 px en cocina y caja; sin datos de tarjeta; sin
dependencias nuevas; sin migración de BD.

**Scale/Scope**: 3 entornos (admin+caja, cocina, cliente), ~10 pantallas y ~6
componentes nuevos.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. TypeScript estricto**: PASS — todo el código nuevo es TS con tipado
  estricto; componentes y tipos con `PascalCase`.
- **II. App única por roles**: PASS — se conservan las rutas por rol y se
  reorganiza la navegación con drawer/bottom bar; Tailwind + shadcn/ui; tokens de
  `docs/DESIGN.md` como referencia; responsiva.
- **III. API REST**: PASS — no se cambian rutas de negocio; solo se amplían dos
  respuestas de solo lectura.
- **IV. Seguridad**: PASS — las rutas siguen protegidas por JWT y rol; el pago NO
  captura ni muestra datos de tarjeta.
- **V. Integridad de estados**: PASS — la máquina de estados no cambia; cocina y
  caja solo consumen transiciones existentes.
- **VI. Validación/errores**: PASS — la regla de 10 min se valida en cliente y se
  mantiene la validación de servidor; se usan los mensajes de error existentes.
- **VII. Simplicidad/dependencias**: PASS — **sin librerías nuevas**; componentes
  construidos a mano.
- **VIII. Pruebas**: PASS — se añaden pruebas de los campos nuevos y de los
  componentes de UI críticos.
- **IX. Rendimiento**: PASS — sondeo ligero y filtrado en cliente.
- **X. Alcance**: PASS — se documenta la exclusión aprobada de las funcionalidades
  marcadas **[Fuera de alcance]**.

Sin violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/007-ui-redesign/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/api.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/src/
├── db/pedidoRepository.ts        # extendido: creado_en + cliente_nombre (cocina);
│                                 #             creado_en + partidas (entregas)
├── services/cocinaService.ts     # propaga campos nuevos
├── services/pedidoService.ts     # propaga campos nuevos en entregas
└── types/pedido.ts               # PedidoCocina / PedidoEntrega extendidos

backend/tests/integration/{cocina,entrega}.test.ts   # campos nuevos

frontend/src/
├── App.tsx                       # rutas /pedido/* + redirects
├── index.css                     # utilidades tipográficas (stat-lg) si faltan
├── components/
│   ├── ui/{drawer,bottom-bar,chip}.tsx        # NUEVOS
│   ├── Stepper.tsx                            # extraído de PlatilloCard/CarritoPage
│   ├── layouts/AppLayout.tsx                  # drawer + bottom bar por rol
│   ├── PedidoCard.tsx / EstadoTimeline.tsx / NotificacionBell.tsx
│   └── PlatilloCard.tsx
├── pages/
│   ├── admin/{AdminHome,UsuariosPage,PlatillosPage,MenuDiaPage}.tsx
│   ├── caja/{CajaHome,NuevoPedidoPage,EntregasPage,CobroPage}.tsx
│   ├── cocina/CocinaPage.tsx
│   └── clientes/{MenuPage,ConfirmarPage,PagoPage,ConfirmacionPage,MisPedidosHome}.tsx
└── lib/{carrito,notificaciones,utils}.ts
```

**Structure Decision**: se mantiene la estructura por funcionalidad existente.
Los componentes compartidos viven en `frontend/src/components/` y los primitivos
en `frontend/src/components/ui/`. La navegación se centraliza en `AppLayout` con
una definición de enlaces por rol (`ENLACES`) que alimenta drawer y bottom bar
(una sola fuente de verdad). No se crean layouts separados por rol.

## Complexity Tracking

> Sin violaciones al Constitution Check.

| Decisión | Justificación |
|----------|---------------|
| Sin layouts por rol (un solo `AppLayout` parametrizado) | Evita duplicación (§VII); el rol determina enlaces y bottom bar |
| Añadir campos a dos respuestas existentes | Requisito de las vistas de cocina y entregas (FR-020); no hay endpoints de listado con detalle |
| Redirects en vez de renombrar rutas de negocio | Conserva enlaces/atajos existentes y cumple FR-003 |
