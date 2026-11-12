-- Esquema Vero → Neon Postgres (alineado con formularios y server/index.js)
-- Ejecutar: npm run db:setup

CREATE TABLE IF NOT EXISTS pagos (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha       DATE,
  concepto    TEXT NOT NULL,
  monto       NUMERIC(14, 2)
);

CREATE TABLE IF NOT EXISTS visa (
  id                BIGSERIAL PRIMARY KEY,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_cierre      DATE,
  fecha_vencimiento DATE,
  saldo_pesos       NUMERIC(14, 2),
  saldo_dolares     NUMERIC(14, 2),
  pago_minimo       NUMERIC(14, 2),
  observaciones     TEXT
);

CREATE TABLE IF NOT EXISTS vencimientos (
  id                BIGSERIAL PRIMARY KEY,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  servicio          TEXT NOT NULL,
  fecha_vencimiento DATE,
  notas             TEXT
);

CREATE TABLE IF NOT EXISTS limpieza (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  tarea       TEXT NOT NULL,
  completada  BOOLEAN NOT NULL DEFAULT false,
  notas       TEXT
);

CREATE TABLE IF NOT EXISTS salud (
  id            BIGSERIAL PRIMARY KEY,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha         DATE,
  especialidad  TEXT,
  profesional   TEXT,
  notas         TEXT
);

CREATE TABLE IF NOT EXISTS ideas (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  titulo      TEXT NOT NULL,
  enlaces     TEXT,
  notas       TEXT
);

CREATE TABLE IF NOT EXISTS contrasenas (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  web_app     TEXT NOT NULL,
  email       TEXT,
  usuario     TEXT,
  contrasena  TEXT
);

CREATE TABLE IF NOT EXISTS habitos (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha       DATE,
  habito      TEXT NOT NULL,
  completado  BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS compras (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  categoria   TEXT,
  articulo    TEXT NOT NULL,
  cantidad    TEXT
);

CREATE TABLE IF NOT EXISTS hobbies (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha       DATE,
  actividad   TEXT NOT NULL,
  notas       TEXT
);

CREATE TABLE IF NOT EXISTS actividad_fisica (
  id           BIGSERIAL PRIMARY KEY,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha        DATE NOT NULL,
  actividades  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_vencimientos_fecha ON vencimientos (fecha_vencimiento DESC);
CREATE INDEX IF NOT EXISTS idx_habitos_fecha ON habitos (fecha DESC);
CREATE INDEX IF NOT EXISTS idx_actividad_fisica_fecha ON actividad_fisica (fecha DESC);
