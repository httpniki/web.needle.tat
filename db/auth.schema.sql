-- Los artistas y propietarios se identifican con app_metadata.role = 'artist' | 'owner'.

-- Comprueba si el usuario autenticado tiene el rol 'artist' u 'owner'.
-- Si el claim no existe o el rol no coincide, devuelve false.
create or replace function public.is_artist()
returns boolean
language sql
stable
as $$
   select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') in ('artist', 'owner'), false)
$$;

-- Elimina el acceso público y anónimo a is_artist(); solo authenticated puede ejecutarla.
revoke all on function public.is_artist() from public;
revoke all on function public.is_artist() from anon;
grant execute on function public.is_artist() to authenticated;

-- Comprueba si el usuario autenticado es el propietario.
create or replace function public.is_owner()
returns boolean
language sql
stable
as $$
   select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'owner', false)
$$;

-- El propietario está incluido en is_artist(); las políticas de proyectos y sesiones
-- limitan la lectura a las sesiones asociadas al usuario autenticado.
revoke all on function public.is_owner() from public;
revoke all on function public.is_owner() from anon;
grant execute on function public.is_owner() to authenticated;

-- El alta de artistas se realiza desde el Server Action con la service role key,
-- guardando app_metadata.role = 'artist' en auth.users.

-- Activa Row Level Security en las tablas del dominio para que las políticas controlen el acceso.
alter table public.customers enable row level security;
alter table public.projects enable row level security;
alter table public.sessions enable row level security;
alter table public.attributes enable row level security;
alter table public.products enable row level security;
alter table public.product_type enable row level security;
alter table public.product_attributes enable row level security;

-- Recrea la política de clientes: solo artistas/propietarios pueden leer y modificarlos.
drop policy if exists "artists_manage_customers" on public.customers;
create policy "artists_manage_customers"
on public.customers
for all
to authenticated
using (public.is_artist())
with check (public.is_artist());

-- Recrea la política de proyectos: solo se ven si tienen una sesión asociada al usuario.
drop policy if exists "artists_manage_projects" on public.projects;
drop policy if exists "artists_read_own_projects" on public.projects;
drop policy if exists "artists_insert_projects" on public.projects;
drop policy if exists "artists_update_own_projects" on public.projects;
drop policy if exists "artists_delete_own_projects" on public.projects;

create policy "artists_read_own_projects"
on public.projects
for select
to authenticated
using (
   exists (
      select 1
      from public.sessions s
      where s.project_id = projects.id
        and s.artist_id = auth.uid()
   )
);

create policy "artists_insert_projects"
on public.projects
for insert
to authenticated
with check (public.is_artist());

create policy "artists_update_own_projects"
on public.projects
for update
to authenticated
using (
   exists (
      select 1
      from public.sessions s
      where s.project_id = projects.id
        and s.artist_id = auth.uid()
   )
)
with check (public.is_artist());

create policy "artists_delete_own_projects"
on public.projects
for delete
to authenticated
using (
   exists (
      select 1
      from public.sessions s
      where s.project_id = projects.id
        and s.artist_id = auth.uid()
   )
);

-- La aplicación lee las sesiones con funciones que filtran por auth.uid().
-- El propietario conserva acceso de lectura/escritura a nivel de tabla para
-- poder insertar o reasignar sesiones a otros artistas, pero la interfaz solo
-- le muestra las suyas.
drop policy if exists "artists_manage_sessions" on public.sessions;
drop policy if exists "artists_read_own_sessions" on public.sessions;
drop policy if exists "artists_insert_sessions" on public.sessions;
drop policy if exists "artists_update_sessions" on public.sessions;
drop policy if exists "artists_delete_sessions" on public.sessions;

create policy "artists_read_own_sessions"
on public.sessions
for select
to authenticated
using (public.is_owner() or artist_id = auth.uid());

create policy "artists_insert_sessions"
on public.sessions
for insert
to authenticated
with check (public.is_owner() or artist_id = auth.uid());

create policy "artists_update_sessions"
on public.sessions
for update
to authenticated
using (public.is_owner() or artist_id = auth.uid())
with check (public.is_owner() or artist_id = auth.uid());

create policy "artists_delete_sessions"
on public.sessions
for delete
to authenticated
using (public.is_owner() or artist_id = auth.uid());

-- Recrea la política de atributos: solo artistas/propietarios pueden gestionarlos.
drop policy if exists "artists_manage_attributes" on public.attributes;
create policy "artists_manage_attributes"
on public.attributes
for all
to authenticated
using (public.is_artist())
with check (public.is_artist());

-- Recrea la política de productos: solo artistas/propietarios pueden gestionarlos.
drop policy if exists "artists_manage_products" on public.products;
create policy "artists_manage_products"
on public.products
for all
to authenticated
using (public.is_artist())
with check (public.is_artist());

-- Recrea la política de tipos de producto: solo artistas/propietarios pueden gestionarlos.
drop policy if exists "artists_manage_product_type" on public.product_type;
create policy "artists_manage_product_type"
on public.product_type
for all
to authenticated
using (public.is_artist())
with check (public.is_artist());

-- Recrea la política de atributos de producto: solo artistas/propietarios pueden gestionarlos.
drop policy if exists "artists_manage_product_attributes" on public.product_attributes;
create policy "artists_manage_product_attributes"
on public.product_attributes
for all
to authenticated
using (public.is_artist())
with check (public.is_artist());

-- Concede CRUD a usuarios autenticados; las políticas RLS siguen limitando el acceso real.
grant select, insert, update, delete on table public.customers to authenticated;
grant select, insert, update, delete on table public.projects to authenticated;
grant select, insert, update, delete on table public.sessions to authenticated;
grant select, insert, update, delete on table public.attributes to authenticated;
grant select, insert, update, delete on table public.products to authenticated;
grant select, insert, update, delete on table public.product_type to authenticated;
grant select, insert, update, delete on table public.product_attributes to authenticated;

-- Recalcula el estado de las sesiones según la hora actual.
-- Se ejecuta con privilegios del owner para poder actualizar sessions sin depender de RLS.
create or replace function public.sync_sessions_status()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
   if not public.is_artist() then
      raise exception 'No autorizado' using errcode = '42501';
   end if;

   -- Actualiza solo las sesiones no canceladas cuyo estado calculado sea distinto al actual.
   update public.sessions
   set status = case
      -- Las sesiones canceladas conservan ese estado.
      when status = 'CANCELED'::session_status then status
      -- Si la hora de fin ya pasó (o no hay fin y ya pasó el inicio), la sesión terminó.
      when current_timestamp > coalesce(ends_at, starts_at) then 'FINISHED'::session_status
      -- Si la hora actual está dentro del rango, la sesión está en curso.
      when current_timestamp between starts_at and ends_at then 'IN_PROGRESS'::session_status
      -- Las sesiones futuras conservan su estado actual.
      else status
   end
   where
      status is distinct from 'CANCELED'::session_status
      -- Evita escribir filas cuyo estado calculado ya coincide con el actual.
      and status is distinct from (
         case
            when current_timestamp > coalesce(ends_at, starts_at) then 'FINISHED'::session_status
            when current_timestamp between starts_at and ends_at then 'IN_PROGRESS'::session_status
            else status
         end
      );
end;
$$;

-- Devuelve las sesiones de un proyecto, ordenadas desde la más reciente.
create or replace function public.get_sessions_by_project_id(p_id bigint)
returns setof public.sessions
language plpgsql
security definer
set search_path = public
as $$
begin
   if not public.is_artist() then
      raise exception 'No autorizado' using errcode = '42501';
   end if;

   -- Sincroniza los estados antes de devolver los datos.
   perform public.sync_sessions_status();

   return query
      select * from public.sessions
      where project_id = p_id
        and artist_id = auth.uid()
      order by starts_at desc;
end;
$$;

-- Devuelve una sesión puntual por su ID.
create or replace function public.get_session_by_id(s_id bigint)
returns setof public.sessions
language plpgsql
security definer
set search_path = public
as $$
begin
   if not public.is_artist() then
      raise exception 'No autorizado' using errcode = '42501';
   end if;

   -- Sincroniza los estados antes de devolver los datos.
   perform public.sync_sessions_status();

   return query
      select * from public.sessions
      where id = s_id
        and artist_id = auth.uid();
end;
$$;

-- Permite ejecutar las funciones solo a usuarios autenticados.
grant execute on function public.sync_sessions_status() to authenticated;
grant execute on function public.get_sessions_by_project_id(bigint) to authenticated;
grant execute on function public.get_session_by_id(bigint) to authenticated;
