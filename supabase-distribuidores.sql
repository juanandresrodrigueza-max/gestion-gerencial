-- ============================================================
-- MÓDULO DE DISTRIBUIDORES — con fecha libre
-- Ejecutar en Supabase → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS distribuidores (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre    TEXT NOT NULL,
  activo    BOOLEAN NOT NULL DEFAULT true,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO distribuidores (nombre)
SELECT v.nombre FROM (VALUES ('Horacio'), ('Julio')) AS v(nombre)
WHERE NOT EXISTS (SELECT 1 FROM distribuidores WHERE nombre = v.nombre);

CREATE TABLE IF NOT EXISTS rendiciones_distribuidores (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  distribuidor_id       UUID NOT NULL REFERENCES distribuidores(id),
  fecha                 DATE NOT NULL,
  clientes_nuevos       INTEGER NOT NULL DEFAULT 0,
  clientes_actualizados INTEGER NOT NULL DEFAULT 0,
  monto_total           NUMERIC(12,2) NOT NULL DEFAULT 0,
  observaciones         TEXT,
  cargado_por           UUID REFERENCES auth.users(id),
  creado_en             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rendiciones_dist  ON rendiciones_distribuidores(distribuidor_id);
CREATE INDEX IF NOT EXISTS idx_rendiciones_fecha ON rendiciones_distribuidores(fecha DESC);

ALTER TABLE distribuidores             ENABLE ROW LEVEL SECURITY;
ALTER TABLE rendiciones_distribuidores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_distribuidores" ON distribuidores
  FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "auth_rendiciones" ON rendiciones_distribuidores
  FOR ALL USING (auth.uid() IS NOT NULL);
