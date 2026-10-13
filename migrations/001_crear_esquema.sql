-- ============================================================
-- 001_crear_esquema.sql
-- Esquema de la base de datos para el Sistema de Pedidos
-- Anticipados — Cafetería ITSH (MySQL 8.0+)
-- Ejecutar en orden: 001_crear_esquema.sql, luego 002_seed_inicial.sql
-- ============================================================

-- ------------------------------------------------------------
-- Catálogo de roles
-- ------------------------------------------------------------
CREATE TABLE rol (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(30) NOT NULL UNIQUE,
  creado_en   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Usuarios del sistema
-- ------------------------------------------------------------
CREATE TABLE usuario (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  correo        VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  activo        TINYINT(1) NOT NULL DEFAULT 1,
  rol_id        INT NOT NULL,
  creado_en     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_id) REFERENCES rol(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Catálogo de platillos (historial permanente)
-- ------------------------------------------------------------
CREATE TABLE platillo (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  categoria   VARCHAR(50),
  descripcion TEXT,
  activo      TINYINT(1) NOT NULL DEFAULT 1,
  creado_en   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Menú del día: asocia platillos a una fecha con precio y
-- disponibilidad. El precio se congela al agregarlo al menú
-- para mantener historial. Un platillo solo puede aparecer
-- una vez por fecha.
-- ------------------------------------------------------------
CREATE TABLE menu_dia (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  fecha       DATE NOT NULL,
  platillo_id INT NOT NULL,
  precio      DECIMAL(10,2) NOT NULL,
  disponible  TINYINT(1) NOT NULL DEFAULT 1,
  especial    TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_menu_dia_fecha_platillo (fecha, platillo_id),
  CONSTRAINT chk_menu_dia_precio CHECK (precio >= 0),
  CONSTRAINT fk_menu_dia_platillo FOREIGN KEY (platillo_id) REFERENCES platillo(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Catálogo de estados de pedido
-- ------------------------------------------------------------
CREATE TABLE estado_pedido (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  nombre  VARCHAR(30) NOT NULL UNIQUE,
  orden   INT NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Transiciones válidas entre estados (validación por datos)
-- ------------------------------------------------------------
CREATE TABLE transicion_estado (
  desde_id INT NOT NULL,
  hacia_id INT NOT NULL,
  PRIMARY KEY (desde_id, hacia_id),
  CONSTRAINT chk_transicion_distinta CHECK (desde_id <> hacia_id),
  CONSTRAINT fk_transicion_desde FOREIGN KEY (desde_id) REFERENCES estado_pedido(id),
  CONSTRAINT fk_transicion_hacia FOREIGN KEY (hacia_id) REFERENCES estado_pedido(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Pedidos: anticipados (usuario + fecha de recolección) y
-- de mostrador (cliente nombre, opcional). El estado actual
-- siempre vive aquí; el historial queda en su tabla propia.
-- ------------------------------------------------------------
CREATE TABLE pedido (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  numero            VARCHAR(20) NOT NULL UNIQUE,
  tipo              VARCHAR(20) NOT NULL,
  estado_id         INT NOT NULL,
  usuario_id        INT NULL,
  cliente_nombre    VARCHAR(100) NULL,
  fecha_recoleccion DATETIME NULL,
  total             DECIMAL(10,2) NOT NULL DEFAULT 0,
  creado_por        INT NULL,
  creado_en         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_pedido_tipo CHECK (tipo IN ('anticipado', 'mostrador')),
  CONSTRAINT chk_pedido_total CHECK (total >= 0),
  CONSTRAINT chk_pedido_anticipado CHECK (
    (tipo = 'anticipado' AND usuario_id IS NOT NULL AND fecha_recoleccion IS NOT NULL)
    OR (tipo = 'mostrador')
  ),
  CONSTRAINT fk_pedido_estado FOREIGN KEY (estado_id) REFERENCES estado_pedido(id),
  CONSTRAINT fk_pedido_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id),
  CONSTRAINT fk_pedido_creado_por FOREIGN KEY (creado_por) REFERENCES usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Detalle de pedidos: platillo del menú, cantidad y precio
-- unitario congelado al momento de crear el pedido.
-- ------------------------------------------------------------
CREATE TABLE pedido_detalle (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id       INT NOT NULL,
  menu_dia_id     INT NOT NULL,
  cantidad        INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal        DECIMAL(10,2) NOT NULL,
  CONSTRAINT chk_detalle_cantidad CHECK (cantidad > 0),
  CONSTRAINT chk_detalle_precio CHECK (precio_unitario >= 0),
  CONSTRAINT chk_detalle_subtotal CHECK (subtotal >= 0),
  CONSTRAINT fk_detalle_pedido FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE CASCADE,
  CONSTRAINT fk_detalle_menu_dia FOREIGN KEY (menu_dia_id) REFERENCES menu_dia(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Historial de cambios de estado de cada pedido
-- ------------------------------------------------------------
CREATE TABLE pedido_estado_historial (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id         INT NOT NULL,
  estado_anterior_id INT NULL,
  estado_nuevo_id   INT NOT NULL,
  cambiado_por      INT NULL,
  fecha             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_historial_pedido FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE CASCADE,
  CONSTRAINT fk_historial_anterior FOREIGN KEY (estado_anterior_id) REFERENCES estado_pedido(id),
  CONSTRAINT fk_historial_nuevo FOREIGN KEY (estado_nuevo_id) REFERENCES estado_pedido(id),
  CONSTRAINT fk_historial_cambiado_por FOREIGN KEY (cambiado_por) REFERENCES usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Pagos: uno por pedido, monto completo. Sin datos de tarjeta.
-- referencia identifica la transacción en la pasarela externa.
-- ------------------------------------------------------------
CREATE TABLE pago (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id       INT NOT NULL UNIQUE,
  metodo          VARCHAR(20) NOT NULL,
  monto           DECIMAL(10,2) NOT NULL,
  referencia      VARCHAR(100) NULL,
  registrado_por  INT NULL,
  fecha           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_pago_metodo CHECK (metodo IN ('online', 'efectivo')),
  CONSTRAINT chk_pago_monto CHECK (monto > 0),
  CONSTRAINT fk_pago_pedido FOREIGN KEY (pedido_id) REFERENCES pedido(id),
  CONSTRAINT fk_pago_registrado_por FOREIGN KEY (registrado_por) REFERENCES usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Notificaciones de pedido listo (separadas de la lógica
-- principal de pedidos; soportan reintento y auditoría)
-- ------------------------------------------------------------
CREATE TABLE notificacion (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id     INT NOT NULL,
  tipo          VARCHAR(30) NOT NULL,
  canal         VARCHAR(20) NOT NULL,
  estado_envio  VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  fecha         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  detalle_error TEXT NULL,
  CONSTRAINT chk_notificacion_canal CHECK (canal IN ('correo', 'push', 'sms')),
  CONSTRAINT chk_notificacion_estado CHECK (estado_envio IN ('pendiente', 'enviada', 'fallida')),
  CONSTRAINT fk_notificacion_pedido FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Índices
-- ============================================================
CREATE INDEX idx_usuario_rol ON usuario(rol_id);
CREATE INDEX idx_menu_dia_fecha ON menu_dia(fecha);
CREATE INDEX idx_pedido_estado ON pedido(estado_id);
CREATE INDEX idx_pedido_fecha_recoleccion ON pedido(fecha_recoleccion);
CREATE INDEX idx_pedido_usuario ON pedido(usuario_id);
CREATE INDEX idx_pedido_tipo ON pedido(tipo);
CREATE INDEX idx_pedido_detalle_pedido ON pedido_detalle(pedido_id);
CREATE INDEX idx_historial_pedido ON pedido_estado_historial(pedido_id);
CREATE INDEX idx_pago_pedido ON pago(pedido_id);
CREATE INDEX idx_notificacion_estado ON notificacion(estado_envio);

-- ============================================================
-- Triggers: mantener actualizado_en al actualizar
-- (MySQL no soporta índices parciales; el índice de notificacion
--  cubre estado_envio sin filtro)
-- ============================================================
DROP TRIGGER IF EXISTS trg_usuario_actualizado;
CREATE TRIGGER trg_usuario_actualizado
  BEFORE UPDATE ON usuario
  FOR EACH ROW
  SET NEW.actualizado_en = CURRENT_TIMESTAMP;

DROP TRIGGER IF EXISTS trg_platillo_actualizado;
CREATE TRIGGER trg_platillo_actualizado
  BEFORE UPDATE ON platillo
  FOR EACH ROW
  SET NEW.actualizado_en = CURRENT_TIMESTAMP;

DROP TRIGGER IF EXISTS trg_pedido_actualizado;
CREATE TRIGGER trg_pedido_actualizado
  BEFORE UPDATE ON pedido
  FOR EACH ROW
  SET NEW.actualizado_en = CURRENT_TIMESTAMP;
