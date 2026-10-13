# Feature Specification: Sistema de Pedidos Anticipados — Cafetería ITSH

**Feature Branch**: `001-sistema-pedidos-anticipados`

**Created**: 2026-10-13

**Status**: Draft

**Input**: User description: "Sistema web de pedidos anticipados para que alumnos y docentes del Instituto Tecnológico Superior de Huauchinango consulten el menú, hagan pedidos y pagos por adelantado y reciban una notificación cuando su pedido esté listo, sin interrumpir el servicio actual de mostrador. Incluye roles administrador, cajero, cocinero y alumno/docente; una sola aplicación web por rutas de rol; gestión de menú y platillos; pedidos anticipados y de mostrador; pago en línea; pantalla de cocina; seguimiento de estados y notificaciones."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Autenticación y acceso por rol (Priority: P1)

Un usuario (administrador, cajero, cocinero, alumno o docente) inicia sesión con su correo
electrónico y contraseña y accede únicamente a las funciones y pantallas que corresponden a su rol.

**Why this priority**: Es la base de seguridad y acceso de todo el sistema; sin control de acceso por
rol ninguna de las demás funcionalidades puede operar de forma segura.

**Independent Test**: Se puede probar creando una cuenta por rol, iniciando sesión y verificando que
cada usuario solo ve y puede usar su módulo, y que un intento de entrar a un módulo ajeno es
rechazado.

**Acceptance Scenarios**:

1. **Given** un usuario registrado con su rol, **When** inicia sesión con credenciales válidas,
   **Then** accede a la pantalla principal de su rol y no a las de otros roles.
2. **Given** un usuario sin el rol requerido, **When** intenta abrir la ruta de otro rol, **Then** el
   acceso es denegado y se le informa que no tiene permiso.
3. **Given** credenciales inválidas, **When** el usuario intenta iniciar sesión, **Then** el sistema
   rechaza el acceso con un mensaje claro sin revelar si el correo existe.

---

### User Story 2 - Realizar un pedido anticipado con pago en línea (Priority: P1)

Un alumno o docente consulta el menú del día, selecciona platillos y cantidades, ve el total y realiza
el pago por adelantado para recoger su pedido en el receso.

**Why this priority**: Es la propuesta de valor central del proyecto y la que ataca directamente la
reducción del tiempo de espera en caja.

**Independent Test**: Se puede probar con un menú cargado, creando un pedido con al menos 10 minutos
de anticipación, completando el pago y verificando que el pedido queda en estado "Pagado".

**Acceptance Scenarios**:

1. **Given** un menú del día publicado con platillos disponibles, **When** el cliente selecciona
   platillos y cantidades, **Then** el sistema muestra el total antes de confirmar.
2. **Given** un pedido con al menos 10 minutos de anticipación, **When** el cliente confirma y paga,
   **Then** el pedido pasa a estado "Pagado".
3. **Given** un intento de pedido con menos de 10 minutos de anticipación, **When** el cliente
   confirma, **Then** el sistema no permite crear el pedido y explica el motivo.
4. **Given** un platillo marcado como no disponible, **When** el cliente intenta agregarlo, **Then** el
   sistema no permite seleccionarlo.
5. **Given** un pago no confirmado o rechazado, **When** finaliza el intento, **Then** el pedido no
   queda como "Pagado" y se informa al cliente.

---

### User Story 3 - Seguimiento del pedido y notificación de "listo" (Priority: P2)

Un alumno o docente consulta la lista y el detalle de sus pedidos con su estado actual y recibe una
notificación cuando su pedido está listo para recoger.

**Why this priority**: Cierra el ciclo de valor para el cliente y elimina la incertidumbre y la espera
presencial; depende de que existan pedidos (US2).

**Independent Test**: Se puede probar avanzando un pedido hasta "Listo" y verificando que el cliente ve
el estado actualizado y recibe una notificación.

**Acceptance Scenarios**:

1. **Given** un cliente con pedidos realizados, **When** entra a "mis pedidos", **Then** ve la lista con
   el estado actual y el detalle (platillos, cantidades, total) de cada uno.
2. **Given** un pedido que cambia a "Listo", **When** se produce el cambio, **Then** el cliente recibe
   una notificación de que puede recogerlo.
3. **Given** que el servicio de notificación externa no está disponible, **When** un pedido pasa a
   "Listo", **Then** el pedido igualmente queda en "Listo" y el estado es visible en la aplicación.

---

### User Story 4 - Pantalla de cocina (Priority: P2)

Un cocinero ve en una sola pantalla los pedidos entrantes (anticipados y de mostrador), los productos y
cantidades a preparar y el orden de preparación, y actualiza el estado de los pedidos.

**Why this priority**: Es indispensable para que los pedidos anticipados lleguen a preparación y para
la operación diaria, pero depende de que existan pedidos y estados.

**Independent Test**: Se puede probar generando pedidos y verificando que aparecen en cocina y que el
cocinero puede avanzarlos a "En preparación" y "Listo".

**Acceptance Scenarios**:

1. **Given** pedidos en estado "Pagado", **When** el cocinero abre la pantalla de cocina, **Then** ve
   los pedidos con sus productos y cantidades y distingue el orden de preparación.
2. **Given** un pedido visible en cocina, **When** el cocinero lo marca "En preparación" y luego
   "Listo", **Then** el estado se actualiza y se refleja en el seguimiento del cliente.
3. **Given** un pedido nuevo generado mientras la pantalla está abierta, **When** se crea, **Then**
   aparece en la lista sin que el cocinero tenga que recargar manualmente.

---

### User Story 5 - Operación de caja y pedidos de mostrador (Priority: P3)

Un cajero captura pedidos realizados presencialmente y registra y gestiona su cobro, en paralelo con la
operación de pedidos anticipados.

**Why this priority**: Mantiene el servicio de mostrador actual sin interrumpirlo y digitaliza su
captura para reducir errores verbales; aporta valor operativo aunque el foco del MVP sea el pedido
anticipado.

**Independent Test**: Se puede probar capturando un pedido de mostrador en pocos pasos, registrando su
cobro y verificando que se opera al mismo tiempo que los anticipados.

**Acceptance Scenarios**:

1. **Given** un cliente en el mostrador, **When** el cajero captura el pedido, **Then** el sistema lo
   registra con el mínimo de pasos.
2. **Given** un pedido de mostrador, **When** el cajero registra el cobro, **Then** el pedido queda
   registrado con su estado y monto correspondiente.
3. **Given** operación simultánea de pedidos anticipados y de mostrador, **When** ambos coexisten,
   **Then** el sistema los maneja sin interrumpir el servicio presencial.

---

### User Story 6 - Gestión del menú, platillos y precios (Priority: P3)

Un administrador crea y modifica el menú diario, gestiona los platillos y especiales del día, asigna
precios y marca platillos como no disponibles, y los cambios se reflejan para los usuarios.

**Why this priority**: Es necesaria para poblar el menú que consumen los clientes; se puede satisfacer
al principio con datos cargados, por lo que no bloquea el flujo principal.

**Independent Test**: Se puede probar creando y editando un platillo, cambiando su precio y su
disponibilidad, y verificando que el menú que ve el cliente refleja los cambios.

**Acceptance Scenarios**:

1. **Given** un administrador autenticado, **When** crea o edita un platillo o el menú del día,
   **Then** los cambios quedan guardados y visibles para los usuarios finales.
2. **Given** un platillo marcado como no disponible, **When** el cliente consulta el menú, **Then** el
   platillo aparece como no disponible y no puede seleccionarse en nuevos pedidos.
3. **Given** un cambio de precio, **When** se guarda, **Then** los nuevos pedidos usan el nuevo precio
   sin alterar pedidos ya creados.

---

### User Story 7 - Gestión de usuarios operativos (Priority: P4)

Un administrador crea, edita y gestiona las cuentas de los usuarios operativos (cajeros y cocineros).

**Why this priority**: Facilita la administración del personal, pero puede resolverse inicialmente con
cuentas predefinidas y no bloquea los flujos principales.

**Independent Test**: Se puede probar creando y editando una cuenta de cajero o cocinero y verificando
que puede iniciar sesión con su rol.

**Acceptance Scenarios**:

1. **Given** un administrador autenticado, **When** crea una cuenta de cajero o cocinero, **Then** la
   cuenta queda activa con su rol y permite iniciar sesión.
2. **Given** una cuenta operativa existente, **When** el administrador la edita o la desactiva,
   **Then** los cambios se aplican y una cuenta desactivada no puede iniciar sesión.

---

### Edge Cases

- **Pedido fuera de la ventana mínima**: crear un pedido con menos de 10 minutos de anticipación
  respecto a la hora de recogida debe rechazarse con un mensaje claro.
- **Platillo no disponible**: seleccionar un platillo no disponible (o que se vuelve no disponible
  durante la sesión) debe impedir la creación del pedido.
- **Menú vacío o sin platillos disponibles**: el cliente no debe poder crear pedidos y debe ver un
  mensaje informativo.
- **Salto de estados inválido**: una transición como "Pendiente" → "Listo" debe rechazarse.
- **Pedido finalizado**: intentar cambiar el estado de un pedido "Entregado" o "Cancelado" debe
  rechazarse.
- **Cancelación**: un pedido puede pasar a "Cancelado" antes de ser entregado; un pedido cancelado no
  puede reactivarse.
- **Pago no confirmado**: si el pago se cancela o falla, el pedido no debe quedar como "Pagado".
- **Precios tras cambio de menú**: los pedidos ya creados conservan los precios con los que se
  generaron aunque el administrador cambie el menú después.
- **Acceso no autorizado**: un usuario que intenta acceder a la ruta de otro rol es rechazado; una
  sesión inexistente o expirada redirige al inicio de sesión.
- **Alta demanda / concurrencia**: pedidos anticipados y de mostrador creados simultáneamente en horas
  de receso deben procesarse sin bloquearse ni degradar la operación de caja.
- **Conectividad limitada**: ante una conexión intermitente dentro del plantel, la operación debe
  degradarse de forma segura sin perder pedidos ya confirmados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir el registro y el inicio de sesión con correo electrónico y
  contraseña.
- **FR-002**: El sistema MUST asignar a cada usuario exactamente un rol: administrador, cajero,
  cocinero o alumno/docente.
- **FR-003**: El sistema MUST restringir el acceso a cada módulo y función según el rol del usuario;
  un usuario MUST NOT acceder a funciones fuera de su rol.
- **FR-004**: El sistema MUST proteger todas las rutas de la aplicación exigiendo una sesión
  autenticada válida y el rol correspondiente.
- **FR-005**: El sistema MUST almacenar las contraseñas de forma no reversible; NEVER MUST
  almacenarlas en texto plano.
- **FR-006**: El administrador MUST poder crear, editar y desactivar las cuentas de usuarios
  operativos (cajeros y cocineros).
- **FR-007**: El sistema MUST permitir a los alumnos/docentes registrarse como clientes con su cuenta
  y rol.
- **FR-008**: El administrador MUST poder crear y modificar el menú diario.
- **FR-009**: El administrador MUST poder crear, editar y gestionar platillos y especiales del día.
- **FR-010**: El administrador MUST poder asignar y modificar precios de platillos.
- **FR-011**: El administrador MUST poder marcar platillos como no disponibles.
- **FR-012**: Un platillo no disponible NEVER MUST poder seleccionarse en nuevos pedidos.
- **FR-013**: Los cambios del menú, precios y disponibilidad MUST reflejarse para los usuarios finales.
- **FR-014**: Los clientes MUST poder consultar el menú del día con platillos, precios y
  disponibilidad, y ver los especiales del día.
- **FR-015**: Los clientes MUST poder seleccionar uno o más platillos y sus cantidades para un pedido
  anticipado.
- **FR-016**: El sistema MUST calcular y mostrar el total del pedido antes de confirmarlo.
- **FR-017**: El sistema MUST exigir al menos 10 minutos de anticipación para crear un pedido
  anticipado y MUST NOT permitir pedidos por debajo de ese margen.
- **FR-018**: El sistema MUST negar la creación de pedidos que incluyan platillos no disponibles.
- **FR-019**: El sistema MUST integrar un servicio de pago en línea para los pedidos anticipados como
  parte del flujo de realización del pedido.
- **FR-020**: El sistema MUST NOT almacenar datos sensibles de tarjetas bancarias; solo MUST registrar
  la información necesaria para identificar y validar la transacción.
- **FR-021**: El sistema MUST cambiar un pedido anticipado a "Pagado" cuando el pago se confirme.
- **FR-022**: El sistema MUST mantener cada pedido en todo momento en uno de los estados válidos:
  Pendiente, Pagado, En preparación, Listo, Entregado o Cancelado.
- **FR-023**: El sistema MUST aplicar las transiciones válidas del flujo principal: Pendiente →
  Pagado → En preparación → Listo → Entregado.
- **FR-024**: El sistema MUST permitir pasar un pedido a "Cancelado" antes de ser entregado y MUST NOT
  permitir cambiar el estado de un pedido "Entregado" o "Cancelado".
- **FR-025**: El sistema MUST rechazar transiciones que se salten estados del flujo principal.
- **FR-026**: Los clientes MUST poder consultar la lista de sus pedidos y el detalle de cada uno
  (platillos, cantidades, total) con su estado actual.
- **FR-027**: El sistema MUST notificar al alumno/docente cuando su pedido pase a "Listo".
- **FR-028**: La funcionalidad de notificaciones MUST permanecer separada de la lógica principal de
  pedidos y MUST NOT impedir que el pedido alcance el estado "Listo" si el servicio de notificación
  falla.
- **FR-029**: El cajero MUST poder capturar pedidos realizados presencialmente en el mostrador.
- **FR-030**: El cajero MUST poder registrar y gestionar el cobro de los pedidos de mostrador.
- **FR-031**: El sistema MUST operar simultáneamente pedidos anticipados y de mostrador sin
  interrumpir el servicio presencial.
- **FR-032**: El cocinero MUST poder ver los pedidos entrantes (anticipados y de mostrador) con los
  productos y cantidades a preparar.
- **FR-033**: El sistema MUST facilitar al cocinero la identificación del orden de preparación de los
  pedidos.
- **FR-034**: El cocinero MUST poder cambiar el estado del pedido a "En preparación" y a "Listo".
- **FR-035**: La pantalla de cocina MUST actualizarse para reflejar los pedidos entrantes y los cambios
  de estado sin requerir recarga manual.
- **FR-036**: El sistema MUST validar los datos antes de procesarlos y almacenarlos, tanto en el
  cliente como en el servidor.
- **FR-037**: El sistema MUST mostrar mensajes de error claros y comprensibles y NEVER MUST exponer
  stack traces ni información interna del servidor al usuario.
- **FR-038**: El sistema MUST registrar los errores necesarios para mantenimiento sin exponer
  información sensible.
- **FR-039**: El sistema MUST mantener las credenciales, tokens y claves secretas fuera del código
  fuente, gestionándolas mediante configuración del entorno.
- **FR-040**: El sistema MUST NOT permitir operaciones fuera del alcance del MVP sin aprobación previa.
- **FR-041**: El sistema MUST funcionar en dispositivos móviles y de escritorio mediante una interfaz
  responsiva.
- **FR-042**: El sistema MUST presentar la información de menú, pedidos y estados de forma clara y
  legible durante los horarios de mayor demanda.

### Key Entities *(include if feature involves data)*

- **Usuario**: persona que usa el sistema; correo electrónico, credenciales de acceso (almacenadas de
  forma no reversible), rol asignado y estado (activo/inactivo). Un usuario tiene un solo rol.
- **Rol**: perfil de acceso del usuario (administrador, cajero, cocinero, alumno/docente) que determina
  sus permisos.
- **Platillo**: producto de la cafetería; nombre, precio, disponibilidad e información descriptiva.
  Puede marcarse como no disponible.
- **Especial del día**: platillo destacado dentro del menú de una fecha.
- **Menú del día**: conjunto de platillos y especiales publicados para una fecha, con sus precios y
  disponibilidad.
- **Pedido**: solicitud de uno o más platillos; tipo (anticipado o mostrador), cliente o cajero que lo
  registra, estado, total, antigüedad/anticipación y hora de recogida objetivo. Siempre tiene un estado.
- **Detalle de pedido**: cada platillo dentro de un pedido con su cantidad y precio unitario al momento
  de la creación.
- **Pago**: registro de la transacción de un pedido; monto, estado de la transacción, referencia o
  identificador de la transacción y fecha. No contiene datos sensibles de tarjeta.
- **Estado de pedido**: catálogo de estados válidos (Pendiente, Pagado, En preparación, Listo,
  Entregado, Cancelado) y las transiciones permitidas entre ellos.
- **Notificación**: aviso dirigido a un cliente cuando su pedido está listo; destinatario, pedido
  asociado, canal/medio, estado de entrega y fecha.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los pedidos anticipados puede completarse con al menos 10 minutos de
  anticipación.
- **SC-002**: El tiempo de espera en caja durante los recesos se reduce en al menos 50 %.
- **SC-003**: Un cliente completa consultar el menú, seleccionar productos y pagar un pedido anticipado
  en menos de 3 minutos.
- **SC-004**: Se eliminan los errores de pedido derivados de la comunicación verbal para los pedidos
  capturados en el sistema (0 errores de interpretación verbal).
- **SC-005**: Un cliente ve el menú del día en menos de 2 segundos en horarios de receso.
- **SC-006**: Un cocinero ve un pedido nuevo en la pantalla de cocina en menos de 5 segundos después de
  su creación, sin recargar manualmente.
- **SC-007**: Al menos el 90 % de los usuarios completa el flujo principal (consulta → pedido → pago)
  en su primer intento sin ayuda.
- **SC-008**: El cliente recibe la notificación de "pedido listo" en menos de 1 minuto desde que el
  pedido pasa a "Listo".
- **SC-009**: El 100 % de los intentos de acceso a funciones fuera del rol del usuario son bloqueados.
- **SC-010**: El 0 % de datos sensibles de tarjetas bancarias queda almacenado en el sistema.
- **SC-011**: Un cajero captura un pedido de mostrador en el sistema en menos de 1 minuto.
- **SC-012**: El sistema procesa pedidos anticipados y de mostrador de forma simultánea en horarios de
  receso sin interrumpir la operación de caja.

## Assumptions

- Dentro del plantel se cuenta con conectividad a internet razonablemente estable; ante fallas, la
  operación se degrada de forma segura sin perder pedidos ya confirmados.
- El pedido anticipado se asocia a una hora de recogida objetivo y la regla de 10 minutos se mide
  respecto a esa hora.
- Los alumnos y docentes pueden registrarse por sí mismos; las cuentas operativas (cajeros y
  cocineros) las crea el administrador.
- Existe al menos una cuenta de administrador inicial para configurar el sistema.
- El menú es gestionado por el administrador; hasta que exista menú publicado, los clientes no pueden
  crear pedidos.
- Los precios de un pedido quedan fijados al momento de su creación y no cambian si el menú se
  actualiza después.
- Los pedidos de mostrador no están sujetos a la regla de 10 minutos y su cobro se realiza en caja;
  los pedidos anticipados se pagan en línea.
- Los datos sensibles de pago son gestionados por el proveedor externo; el sistema solo conserva el
  identificador y estado de la transacción.
- Las notificaciones se entregan a través de la propia aplicación y opcionalmente mediante un servicio
  externo; la notificación no es requisito para que el pedido llegue a "Listo".
- La entrega es presencial en la cafetería; no hay envío ni reparto.
- Los diseños de Stitch son una base de referencia y pueden modificarse durante el desarrollo.
- Es una sola aplicación web responsiva; no se contempla una aplicación móvil nativa.
- El alcance se limita al MVP descrito; cualquier funcionalidad adicional (reseñas, puntos,
  inventario, proveedores, etc.) requiere aprobación previa.
