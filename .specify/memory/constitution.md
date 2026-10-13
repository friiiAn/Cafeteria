<!--
Sync Impact Report
==================
Version change: (sin versión — plantilla scaffold) → 1.0.0
Tipo de bump: MAJOR — ratificación inicial del constitution que reemplaza el scaffold genérico
por gobernanza concreta del proyecto (no existía versión previa ratificada).

Principios definidos:
  - I. TypeScript Estricto sobre Node.js LTS
  - II. Aplicación Web Única Organizada por Roles
  - III. API REST con Express
  - IV. Seguridad, Autenticación y Autorización (NON-NEGOTIABLE)
  - V. Integridad del Ciclo de Pedidos y Estados (NON-NEGOTIABLE)
  - VI. Validación y Manejo de Errores
  - VII. Simplicidad, Estructura y Dependencias
  - VIII. Pruebas con Vitest
  - IX. Rendimiento y Objetivos Operativos
  - X. Alcance y Restricciones del MVP

Secciones añadidas:
  - Restricciones Adicionales y Stack Tecnológico
  - Flujo de Desarrollo y Puertas de Calidad

Secciones eliminadas: ninguna

Plantillas dependientes: .specify/templates/* leen el constitution en tiempo de ejecución;
no requieren modificación en este paso.

Seguimiento (TODOs): ninguno
-->

# Constitución del Proyecto — Cafetería ITSH (Sistema de Pedidos Anticipados)

## Core Principles

### I. TypeScript Estricto sobre Node.js LTS
El proyecto MUST usar **TypeScript** como lenguaje principal en frontend y backend, manteniendo
el tipado estático estricto siempre que sea posible. El backend MUST ejecutarse sobre una versión
**LTS de Node.js**. La lógica principal del sistema MUST NOT implementarse en JavaScript sin tipar.
Rationale: el tipado estático detecta errores antes de la ejecución en un dominio sensible
(pedidos, pagos, permisos), y la versión LTS garantiza estabilidad y soporte a largo plazo.

### II. Aplicación Web Única Organizada por Roles
El frontend MUST ser **una sola aplicación web** construida con **React + TypeScript** y compilada
con **Vite**, organizada en rutas por rol: `/admin` (administrador), `/caja` (cajero), `/cocina`
(cocinero), `/menu` (cliente) y `/mis-pedidos` (seguimiento del cliente). Cada ruta MUST estar
protegida por **JWT y rol**: exige sesión activa y el rol correspondiente, y MUST denegar el acceso
a usuarios sin ese rol. Alumno y docente MUST compartir la misma vista de cliente, diferenciados
únicamente por su cuenta y rol. La interfaz MUST construirse con **Tailwind CSS + shadcn/ui**
(componentes copiados y personalizados con los tokens del proyecto); los tokens de `docs/DESIGN.md`
son una base de referencia y los diseños de Stitch no son obligatorios al 100 %. La interfaz MUST ser
responsiva (móvil y escritorio), simple, clara y rápida, priorizando la velocidad de uso en caja y
cocina durante los recesos.

### III. API REST con Express
El backend MUST implementarse con **Node.js + Express** y exponer una **API REST** que gestione
usuarios, roles, menú, platillos, pedidos, pagos, estados de pedidos y notificaciones. Los métodos
HTTP MUST usarse de acuerdo con su propósito (`GET` consultas, `POST` creación, `PUT`/`PATCH`
modificación, `DELETE` eliminación cuando corresponda) y las respuestas MUST usar códigos HTTP
apropiados. El código MUST organizarse de forma sencilla por funcionalidad (por ejemplo `routes/`,
`controllers/`, `services/`, `middlewares/`, `utils/`), evitando capas innecesarias.

### IV. Seguridad, Autenticación y Autorización (NON-NEGOTIABLE)
La autenticación MUST realizarse por correo electrónico y contraseña, y las sesiones MUST gestionarse
mediante **JSON Web Tokens (JWT)**. La autorización MUST basarse en roles: cada usuario accede
únicamente a las funciones de su rol. Las contraseñas NEVER MUST almacenarse en texto plano. Las
credenciales, tokens, claves API y secretos NEVER MUST incluirse en el código fuente; MUST
gestionarse mediante variables de entorno. El sistema MUST validar y sanitizar los datos recibidos y
MUST usar HTTPS en producción. La información sensible de tarjetas bancarias NEVER MUST almacenarse;
solo se registra la información necesaria para identificar y validar una transacción.

### V. Integridad del Ciclo de Pedidos y Estados (NON-NEGOTIABLE)
El sistema MUST permitir pedidos anticipados realizados con al menos **10 minutos de anticipación** y
MUST operar simultáneamente pedidos anticipados y de mostrador sin interrumpir el servicio
presencial. Todo pedido MUST mantener un estado que refleje su progreso, con los estados mínimos:
`Pendiente`, `Pagado`, `En preparación`, `Listo`, `Entregado`, `Cancelado`. El pago MUST formar parte
del flujo de realización del pedido. El sistema MUST reducir los errores derivados de la
interpretación verbal de los pedidos.

### VI. Validación y Manejo de Errores
Los datos MUST validarse tanto en el frontend como en el backend, y antes de almacenarse en la base
de datos; las validaciones del cliente MUST NOT considerarse suficientes. Datos inválidos o
incompletos NEVER MUST llegar a la lógica de negocio. El sistema NEVER MUST mostrar stack traces ni
información interna del servidor al usuario; MUST mostrar mensajes claros con códigos HTTP apropiados
y MUST registrar los errores necesarios para el mantenimiento sin exponer información sensible.

### VII. Simplicidad, Estructura y Dependencias
El proyecto MUST mantener una estructura sencilla y organizada por funcionalidad (`frontend/`,
`backend/`, `database/`, `tests/`). El frontend MUST organizarse en `pages/admin/`, `pages/caja/`,
`pages/cocina/`, `pages/clientes/`, `components/ui/` (shadcn/ui) y `lib/`. NO MUST implementarse
arquitecturas ni capas innecesarias para el tamaño del sistema, y MUST evitarse el código duplicado.
Las dependencias innecesarias están prohibidas: antes de incorporar una librería MUST verificarse si
la funcionalidad puede resolverse con las herramientas existentes, MUST evitarse librerías que
dupliquen funcionalidad ya disponible y MUST mantenerse compatibilidad con la versión LTS de Node.js.

### VIII. Pruebas con Vitest
La lógica de negocio importante MUST contar con pruebas escritas con **Vitest**. Como mínimo MUST
probarse: autenticación, autorización, gestión de usuarios, gestión del menú, creación de pedidos,
validación de pedidos, cálculo de totales, cambios de estado y control de permisos por rol. No se
establece una cobertura mínima obligatoria, pero las funcionalidades críticas MUST contar con
pruebas.

### IX. Rendimiento y Objetivos Operativos
El sistema MUST responder adecuadamente durante los horarios de mayor demanda, con consultas de menú
optimizadas y gestión de pedidos sin retrasos innecesarios, priorizando la reducción del tiempo de
espera en caja. El diseño MUST permitir alcanzar: reducir el tiempo de espera en caja en al menos
**50 % durante los recesos**, realizar el **100 % de los pedidos anticipados** con al menos 10 minutos
de anticipación, y reducir los errores derivados de la comunicación verbal de los pedidos.

### X. Alcance y Restricciones del MVP
El desarrollo MUST mantenerse dentro del alcance del MVP: gestión de usuarios y roles, gestión del
menú y de platillos, consulta del menú, pedidos anticipados, pedidos de mostrador, pago anticipado,
visualización de pedidos en cocina, actualización del estado de pedidos y notificaciones de pedido
listo. Funcionalidades fuera de alcance MUST requerir aprobación previa. El sistema MUST NOT
interrumpir el servicio actual de mostrador, MUST considerar la dependencia de la conectividad a
internet dentro del plantel, la disponibilidad limitada del personal para capacitación y el
presupuesto establecido para el MVP.

## Restricciones Adicionales y Stack Tecnológico

- **Base de datos**: MUST usarse **PostgreSQL**. MUST almacenar como mínimo usuarios, roles,
  platillos, menú, pedidos, detalles de pedidos, pagos y estados de pedidos. MUST usarse relaciones
  entre entidades para preservar la integridad de los datos. MUST NOT usarse ORMs innecesarios; el
  acceso a datos MUST realizarse mediante una librería de acceso a datos adecuada.
- **Roles del sistema**: MUST existir los roles **Administrador**, **Cajero**, **Cocinero** y
  **Alumno/Docente**, con las responsabilidades descritas en `docs/reglas.md` §6. Todos los roles
  operan sobre una sola aplicación web y acceden únicamente a su módulo.
- **Gestión del menú**: el administrador MUST poder crear y modificar el menú diario, gestionar
  platillos y especiales del día, y asignar y modificar precios. Los cambios MUST reflejarse para los
  usuarios finales y los platillos no disponibles NEVER MUST poder seleccionarse en nuevos pedidos.
- **Pagos**: MUST implementarse un servicio de pago en línea para los pedidos anticipados, sin
  almacenar directamente información sensible de tarjetas bancarias; solo se registra lo necesario
  para identificar y validar la transacción.
- **Notificaciones**: el sistema MUST notificar al alumno o docente cuando su pedido esté listo,
  manteniendo la funcionalidad separada de la lógica principal de pedidos; podrá apoyarse en un
  servicio externo cuando sea necesario.
- **Variables de entorno**: MUST contemplarse como mínimo `DATABASE_URL`, `JWT_SECRET`,
  `PAYMENT_API_KEY`, `NOTIFICATION_API_KEY`, `NODE_ENV` y `PORT`. Sus valores reales NEVER MUST
  incluirse directamente en el código fuente.
- **Despliegue**: el sistema MUST poder ejecutarse localmente durante el desarrollo y el MVP MUST
  poder desplegarse en servicios de hosting gratuitos o de bajo costo. Las configuraciones de
  desarrollo y producción MUST mantenerse separadas.
- **Estilo de código**: `camelCase` para variables y funciones; `PascalCase` para componentes, tipos
  e interfaces; nombres descriptivos; funciones pequeñas y reutilizables; responsabilidades claras
  entre módulos.
- **Interfaz de usuario**: las pantallas de caja y cocina MUST usar botones de alto contraste con
  área táctil de al menos **44 px** y MUST requerir la menor cantidad de pasos posible; la
  información de menú, pedidos y estados MUST presentarse con claridad y legibilidad durante los
  horarios de mayor demanda, evitando elementos visuales innecesarios.

## Flujo de Desarrollo y Puertas de Calidad

- **Control de versiones**: MUST usarse **Git** con repositorio remoto y commits pequeños y
  descriptivos. Los archivos `.env` y cualquier credencial o clave secreta NEVER MUST almacenarse en
  el repositorio.
- **Revisión de cumplimiento**: toda PR o revisión de cambios MUST verificar el cumplimiento de este
  constitution; la complejidad añadida MUST justificarse y cualquier violación MUST resolverse antes
  de integrar.
- **Puerta de pruebas**: las funcionalidades críticas MUST incluir pruebas (ver Principio VIII) antes
  de considerarse completas.
- **Criterio de aceptación**: el sistema MUST considerarse funcional cuando permita completar el flujo
  principal: consulta del menú → selección de productos → creación del pedido → pago → recepción en
  cocina → preparación → pedido listo → notificación al usuario → recogida / entrega. La aceptación
  final MUST estar sujeta a una demostración funcional y a la validación de la patrocinadora del
  proyecto.
- **Prioridades de decisión**: las decisiones de desarrollo MUST priorizar, en este orden:
  cumplimiento del alcance, seguridad de la información, facilidad de uso, mantenibilidad del código,
  rendimiento en horarios de mayor demanda, simplicidad de implementación y viabilidad económica del
  MVP.
- **Guía de desarrollo en tiempo de ejecución**: `docs/reglas.md` es la referencia de las reglas
  detalladas del proyecto y MUST consultarse junto con este constitution.

## Governance

Este constitution MUST prevalecer sobre cualquier otra práctica del proyecto, y toda decisión de
desarrollo MUST alinearse con él. Las enmiendas MUST documentarse, aprobarse por el equipo y la
patrocinadora del proyecto, y reflejarse actualizando la versión semántica y la fecha de última
enmienda.

Política de versionado: **MAJOR** cuando se elimina o redefine un principio de forma incompatible;
**MINOR** cuando se añade un principio o sección, o se expande materialmente la guía existente;
**PATCH** para aclaraciones, corrección de redacción o refinamientos no semánticos.

El cumplimiento MUST revisarse en cada revisión de cambios y en cada fase del flujo de Spec Kit
(spec, plan, tasks). Toda complejidad adicional MUST justificarse y la guía de desarrollo en tiempo
de ejecución se encuentra en `docs/reglas.md`.

**Version**: 1.0.0 | **Ratified**: 2026-10-13 | **Last Amended**: 2026-10-13
