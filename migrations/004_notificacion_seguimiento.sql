-- ============================================================
-- 004 - Sprint 5 (006-order-tracking-notifications)
-- Adapta la tabla `notificacion` al modelo de seguimiento:
--   * usuario_id  -> dueño de la notificación (NULL si no hay cuenta)
--   * mensaje     -> texto mostrado al cliente
--   * intentos    -> contador de reintentos de envío
--   * leida       -> marca de lectura en la app
--   * canal por defecto 'correo'
--   * unicidad (pedido_id, tipo) para no duplicar avisos
--   * índice por usuario para la consulta del cliente
-- Requiere MySQL 8.0+.
-- ============================================================

ALTER TABLE notificacion
  MODIFY COLUMN canal VARCHAR(20) NOT NULL DEFAULT 'correo',
  ADD COLUMN usuario_id INT NULL AFTER pedido_id,
  ADD COLUMN mensaje VARCHAR(255) NULL AFTER tipo,
  ADD COLUMN intentos INT NOT NULL DEFAULT 0 AFTER estado_envio,
  ADD COLUMN leida TINYINT(1) NOT NULL DEFAULT 0 AFTER intentos,
  ADD CONSTRAINT fk_notificacion_usuario
      FOREIGN KEY (usuario_id) REFERENCES usuario (id) ON DELETE CASCADE,
  ADD UNIQUE KEY uq_notificacion_pedido_tipo (pedido_id, tipo),
  ADD KEY idx_notificacion_usuario (usuario_id);
