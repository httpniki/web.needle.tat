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
   starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
   ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
   observations TEXT NOT NULL DEFAULT '',
   status session_status NOT NULL DEFAULT 'PENDING',
   price NUMERIC(10, 2) NOT NULL DEFAULT 0,
   booking_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
   currency currency_code NOT NULL DEFAULT 'ARS',
   created_at TIMESTAMPZ WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

   CONSTRAINT fk_session_project
      FOREIGN KEY (project_id)
      REFERENCES projects (id)
      ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_project_id ON sessions(project_id);

CREATE OR REPLACE FUNCTION sync_sessions_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
   UPDATE public.sessions
   SET status = CASE
      WHEN status = 'CANCELED'::session_status THEN status
      WHEN CURRENT_TIMESTAMP > COALESCE(ends_at, starts_at) THEN 'FINISHED'::session_status
      WHEN CURRENT_TIMESTAMP BETWEEN starts_at AND ends_at THEN 'IN_PROGRESS'::session_status
      ELSE status
   END
   WHERE 
      status IS DISTINCT FROM 'CANCELED'::session_status
      AND status IS DISTINCT FROM (
         CASE
            WHEN CURRENT_TIMESTAMP > COALESCE(ends_at, starts_at) THEN 'FINISHED'::session_status
            WHEN CURRENT_TIMESTAMP BETWEEN starts_at AND ends_at THEN 'IN_PROGRESS'::session_status
            ELSE status
         END
      );
END;
$$;

CREATE OR REPLACE FUNCTION get_sessions_by_project_id(p_id bigint)
RETURNS SETOF public.sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
   PERFORM sync_sessions_status();
      RETURN QUERY
      SELECT * FROM public.sessions WHERE project_id = p_id ORDER BY starts_at DESC;
   END
$$;

CREATE OR REPLACE FUNCTION get_session_by_id(s_id bigint)
RETURNS SETOF public.sessions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM sync_sessions_status();

   RETURN QUERY
      SELECT * FROM public.sessions WHERE id = s_id;
  END
$$;
