-- ============================================================
-- 002_seed_inicial.sql
-- Datos base: roles, estados de pedido, transiciones válidas
-- y un menú de ejemplo para hoy. (MySQL 8.0+)
-- Ejecutar DESPUÉS de 001_crear_esquema.sql
-- ============================================================

-- ------------------------------------------------------------
-- Roles
-- ------------------------------------------------------------
INSERT INTO rol (nombre) VALUES
  ('administrador'),
  ('cajero'),
  ('cocinero'),
  ('usuario')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- ------------------------------------------------------------
-- Estados de pedido (orden = prioridad de avance)
-- ------------------------------------------------------------
INSERT INTO estado_pedido (nombre, orden) VALUES
  ('Pendiente',       1),
  ('Pagado',          2),
  ('En preparación',  3),
  ('Listo',           4),
  ('Entregado',       5),
  ('Cancelado',       0)
ON DUPLICATE KEY UPDATE orden = VALUES(orden);

-- ------------------------------------------------------------
-- Transiciones válidas del flujo principal + cancelaciones
--   Pendiente → Pagado → En preparación → Listo → Entregado
--   Cualquier estado pre-entrega puede ir a Cancelado
--   (excepto Entregado y Cancelado mismos)
-- ------------------------------------------------------------
INSERT IGNORE INTO transicion_estado (desde_id, hacia_id)
SELECT d.id, h.id
FROM estado_pedido d
JOIN estado_pedido h
WHERE (d.nombre, h.nombre) IN (
  ('Pendiente',      'Pagado'),
  ('Pagado',         'En preparación'),
  ('En preparación', 'Listo'),
  ('Listo',          'Entregado'),
  ('Pendiente',      'Cancelado'),
  ('Pagado',         'Cancelado'),
  ('En preparación', 'Cancelado'),
  ('Listo',          'Cancelado')
);

-- ------------------------------------------------------------
-- Platillos de ejemplo (catálogo). Idempotente: solo inserta
-- los que aún no existen por nombre.
-- ------------------------------------------------------------
INSERT INTO platillo (nombre, categoria, descripcion)
SELECT t.nombre, t.categoria, t.descripcion
FROM (
  SELECT 'Gordita de chicharrón' AS nombre, 'Comida' AS categoria, 'Gordita de maíz con chicharrón prensado' AS descripcion UNION ALL
  SELECT 'Gordita de frijol',      'Comida', 'Gordita de maíz con frijoles refritos' UNION ALL
  SELECT 'Quesadilla de queso',    'Comida', 'Tortilla de maíz con queso Oaxaca' UNION ALL
  SELECT 'Torta de jamón',         'Comida', 'Torta con jamón, queso y aguacate' UNION ALL
  SELECT 'Café de olla',           'Bebida', 'Café de olla con piloncillo y canela' UNION ALL
  SELECT 'Jugo de naranja',        'Bebida', 'Jugo de naranja natural 500 ml' UNION ALL
  SELECT 'Agua de horchata',       'Bebida', 'Agua fresca de horchata 500 ml' UNION ALL
  SELECT 'Pan con huevo',          'Comida', 'Pan dulce con huevo revuelto'
) AS t
WHERE NOT EXISTS (
  SELECT 1 FROM platillo p WHERE p.nombre = t.nombre
);

-- ------------------------------------------------------------
-- Menú de hoy (ejemplo) — precios congelados al agregarlo
-- ------------------------------------------------------------
INSERT IGNORE INTO menu_dia (fecha, platillo_id, precio, disponible, especial)
SELECT
  CURRENT_DATE,
  p.id,
  CASE p.nombre
    WHEN 'Gordita de chicharrón' THEN 35.00
    WHEN 'Gordita de frijol'     THEN 30.00
    WHEN 'Quesadilla de queso'   THEN 25.00
    WHEN 'Torta de jamón'        THEN 45.00
    WHEN 'Café de olla'          THEN 20.00
    WHEN 'Jugo de naranja'       THEN 25.00
    WHEN 'Agua de horchata'      THEN 15.00
    WHEN 'Pan con huevo'         THEN 28.00
  END,
  1,
  CASE WHEN p.nombre IN ('Gordita de chicharrón', 'Café de olla') THEN 1 ELSE 0 END
FROM platillo p
WHERE p.nombre IN (
  'Gordita de chicharrón',
  'Gordita de frijol',
  'Quesadilla de queso',
  'Torta de jamón',
  'Café de olla',
  'Jugo de naranja',
  'Agua de horchata',
  'Pan con huevo'
);
