# Documentación del Diseño UI/UX: Cafetería ITSH

Este documento describe la arquitectura de información, el flujo de navegación, la paleta de colores y la organización de componentes de la interfaz de usuario (UI) para la aplicación móvil del sistema de ventas y pedidos de la **Cafetería ITSH**.

---

## 1. Identidad Visual y Estilo (Design System)

* **Paleta de Colores:**
  * **Verde Principal (Oscuro):** `#1E4632` — Utilizado en botones primarios, encabezados de tarjetas, estados seleccionados y barra de estado.
  * **Verde Secundario / Acento (Claro):** `#DCECE1` — Utilizado para fondos de contenedores destacables, elementos de navegación activos e insignias (badges).
  * **Fondo:** `#F7F9F7` — Tono crema/blanco hueso cálido para reducir la fatiga visual.
  * **Acentos Ilustrativos:** Motivos orgánicos (hojas, ondas) que refuerzan un ambiente amigable y relajante.
* **Tipografía y Legibilidad:**
  * Fuentes tipográficas sans-serif modernas con jerarquía clara (títulos en negrita, subtítulos medianos y textos primarios bien contrastados).
* **Componentes Recurrentes:**
  * Tarjetas con bordes redondeados (*rounded corners*).
  * Iconografía lineal minimalista.
  * Insignias de notificación en color verde para alertar contadores (ej. pedidos pendientes).

---

## 2. Estructura y Flujo de Pantallas

El diseño consta de 6 pantallas principales organizadas para facilitar la operación del personal de caja y entrega.

```
       [Menú Lateral]
             │
      ┌──────┴──────┐
      ▼             ▼
[ 1. Inicio ] ──► [ 2. Nuevo Pedido ] ──► [ 3. Cobro Rápid. ]
      │
      ├───────────► [ 4. Pedidos Listos ]
      │
      └───────────► [ 5. Cobrar Pedido (Detalle) ]
```

---

## 3. Descripción Detallada por Pantalla

### Pantalla 1: Inicio / Panel Principal
* **Encabezado:** Nombre de la cafetería ("Cafetería ITSH"), subtítulo del sistema, avatar de usuario y menú de opciones adicionales.
* **Acciones Rápidas:**
  * Botón destacado superior: **Capturar pedido** (Acceso directo al flujo de ventas).
  * Módulos secundarios: **Pedidos listos** (con contador en badge) e **Historial de ventas**.
* **Área Conceptual/Bienvenida:** Ilustración central de una taza de café con la leyenda *¡Buen día! Tu café, en buenas manos*, sobre un fondo con formas orgánicas.

### Pantalla 2: Nuevo Pedido (Catálogo y Carrito)
* **Encabezado:** Botón para regresar, título "Nuevo pedido" e icono del carrito de compras.
* **Filtros y Búsqueda:**
  * Campo para registrar el **Nombre del cliente (opcional)**.
  * Barra de búsqueda por texto (*Buscar producto...*).
  * Categorías mediante tarjetas horizontales con iconos: *Bebidas*, *Comida*, *Snacks*, *Postres*.
* **Listado de Productos:** Tarjetas con imagen del producto, nombre, precio unitario y control de cantidad de tipo stepper (`-`, `0`, `+`).
* **Barra Flotante Inferior (Checkout Bar):** Resumen persistente mostrando el total de productos seleccionados, monto acumulado y botón de acción principal **Ver cobro**.

### Pantalla 3: Resumen de Cobro
* **Encabezado:** Título de la sección "Cobro".
* **Desglose de Pedido:**
  * Tarjeta contenedora con la lista de ítems seleccionados, su imagen, cantidad e icono para eliminar de la lista.
* **Monto Total:** Despliegue en tamaño grande del total a pagar (`$55.00`).
* **Botón de Acción:** **Registrar y cobrar**.
* **Nota informativa:** Confirmación visual de procesamiento de pago y registro.

### Pantalla 4: Pedidos Listos (Módulo de Entrega)
* **Encabezado:** Título "Pedidos listos" con indicador del número de pedidos preparados.
* **Lista de Pedidos Atendidos:**
  * Organizada por folios (`#012`, `#013`), hora de registro y nombre del cliente.
  * Desglose de ítems preparados con etiquetas de estado (**Listo** en color verde).
  * Botón de acción por cada orden: **Marcar como entregado**.
* **Estado Vacío / Informativo:** Muestra una ilustración e indicativo cuando no hay más pendientes (*¡Todo está al día!*).
* **Navegación Inferior (Bottom Bar):** Selector rápido entre tres pestañas: *Caja*, *Entregas* y *Historial*.

### Pantalla 5: Cobrar Pedido (Detalle y Pago)
* **Encabezado de Orden:** Identificador del pedido (`#012`), hora de captura y cliente asociado.
* **Desglose Financiero:**
  * Cantidad x Producto y precio calculado.
  * Indicadores de **Subtotal**, **Descuento** y **Total** final destacado.
* **Métodos de Pago:**
  * Lista con radio-buttons para seleccionar la forma de cobro: *Efectivo*, *Tarjeta*, *Transferencia*.
* **Acción Final:** Botón ancho **Registrar venta**.

### Pantalla 6: Menú Lateral (Navigation Drawer)
* **Perfil:** Nombre del usuario en sesión (*Cajero*) con avatar.
* **Lista de Opciones Principal:**
  1. **Inicio** (pestaña activa resaltada en verde claro)
  2. **Capturar pedido**
  3. **Pedidos listos** (con contador activo)
  4. **Historial de ventas**
  5. **Configuración**
* **Pie del Menú:** Opcion para **Cerrar sesión**.
```

eof

He elaborado la documentación completa con el desglose del sistema de diseño, la jerarquía de las 6 pantallas y el flujo de la aplicación.