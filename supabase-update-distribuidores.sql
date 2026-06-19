-- Agregar columnas de período a rendiciones existentes
-- Ejecutar en Supabase → SQL Editor

ALTER TABLE rendiciones_distribuidores
  ADD COLUMN IF NOT EXISTS periodo_desde DATE,
  ADD COLUMN IF NOT EXISTS periodo_hasta DATE;
