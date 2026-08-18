CREATE TYPE session_status AS ENUM (
   'PENDING',
   'IN_PROGRESS',
   'FINISHED',
   'CANCELED'
);

CREATE TYPE currency_code AS ENUM (
   'ARS',
   'USD',
   'EUR'
);

CREATE TABLE IF NOT EXISTS sessions (
   id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
   project_id BIGINT NOT NULL,
   "date" DATE NOT NULL,
   time INT NOT NULL,
   observations TEXT,
   status session_status NOT NULL DEFAULT 'PENDING',
   price NUMERIC(10, 2) NOT NULL DEFAULT 0,
   currency currency_code NOT NULL DEFAULT 'ARS',
   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

   CONSTRAINT fk_session_project
      FOREIGN KEY (project_id)
      REFERENCES projects (id)
      ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_project_id ON sessions(project_id);

INSERT INTO sessions (project_id, "date", time, observations, status, price, currency) VALUES
    (1, '2026-06-10', 180, 'Sesión de líneas principales realizada sin problemas.', 'FINISHED', 150000.00, 'ARS'),
    (1, '2026-07-15', 240, 'Sesión de sombras y negros intensos.', 'IN_PROGRESS', 180000.00, 'ARS'),
    (1, '2026-08-25', 120, 'Sesión final de color y detalles.', 'PENDING', 120000.00, 'ARS'),
    (2, '2026-05-02', 90, 'Cover-up finalizado con éxito.', 'FINISHED', 85000.00, 'ARS'),
    (3, '2026-07-01', 120, 'Líneas del acuarela listas.', 'FINISHED', 95000.00, 'ARS'),
    (3, '2026-07-20', 150, 'El cliente canceló por motivos de salud.', 'CANCELED', 0.00, 'ARS'),
    (4, '2026-09-01', 60, NULL, 'PENDING', 50000.00, 'ARS'),
    (5, '2026-08-10', 30, 'Evaluación de zona y prueba de titanio.', 'FINISHED', 0.00, 'ARS'),
    (6, '2026-04-10', 300, 'Sombra del fondo y nubes.', 'FINISHED', 250.00, 'USD'),
    (6, '2026-05-12', 300, 'Cuerpo del dragón y escamas.', 'FINISHED', 250.00, 'USD'),
    (6, '2026-08-30', 240, 'Próxima sesión: detalles de flores y cabeza del dragón.', 'PENDING', 200.00, 'USD'),
    (7, '2026-06-18', 180, 'Sesión única de microrealismo.', 'FINISHED', 180.00, 'EUR'),
    (7, '2026-09-10', 45, 'Retoque gratuito de cicatrización.', 'PENDING', 0.00, 'EUR'),
    (8, '2026-03-15', 60, 'Cancelado previo a la seña.', 'CANCELED', 40000.00, 'ARS'),
    (9, '2026-08-01', 240, 'Relleno de bloque negro en gemelo.', 'IN_PROGRESS', 130000.00, 'ARS'),
    (9, '2026-08-28', 180, 'Segunda etapa de relleno.', 'PENDING', 110000.00, 'ARS');
