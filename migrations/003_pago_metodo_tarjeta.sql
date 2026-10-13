-- ============================================================
-- 003 - Sprint 4 (005-counter-kitchen)
-- Amplía el CHECK de pago.metodo para permitir 'tarjeta' en el
-- cobro presencial en caja (efectivo | tarjeta), además de
-- 'online' que usa la pasarela en el Sprint 3.
-- Requiere MySQL 8.0.16+ (soporta ALTER TABLE ... DROP CHECK).
-- ============================================================

ALTER TABLE pago DROP CHECK chk_pago_metodo;

ALTER TABLE pago
  ADD CONSTRAINT chk_pago_metodo
  CHECK (metodo IN ('online', 'efectivo', 'tarjeta'));
