-- Los artistas se identifican con app_metadata.role = 'artist'.

create or replace function public.is_artist()
returns boolean
language sql
stable
as $$
   select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'artist', false)
$$;

revoke all on function public.is_artist() from public;
revoke all on function public.is_artist() from anon;
grant execute on function public.is_artist() to authenticated;

alter table public.customers enable row level security;
alter table public.projects enable row level security;
alter table public.sessions enable row level security;
alter table public.attributes enable row level security;
alter table public.products enable row level security;
alter table public.product_type enable row level security;
alter table public.product_attributes enable row level security;

drop policy if exists "artists_manage_customers" on public.customers;
create policy "artists_manage_customers"
on public.customers
for all
to authenticated
using (public.is_artist())
with check (public.is_artist());

drop policy if exists "artists_manage_projects" on public.projects;
create policy "artists_manage_projects"
on public.projects
for all
to authenticated
using (public.is_artist())
with check (public.is_artist());

drop policy if exists "artists_manage_sessions" on public.sessions;
create policy "artists_manage_sessions"
on public.sessions
for all
to authenticated
using (public.is_artist())
with check (public.is_artist());

drop policy if exists "artists_manage_attributes" on public.attributes;
create policy "artists_manage_attributes"
on public.attributes
for all
to authenticated
using (public.is_artist())
with check (public.is_artist());

drop policy if exists "artists_manage_products" on public.products;
create policy "artists_manage_products"
on public.products
for all
to authenticated
using (public.is_artist())
with check (public.is_artist());

drop policy if exists "artists_manage_product_type" on public.product_type;
create policy "artists_manage_product_type"
on public.product_type
for all
to authenticated
using (public.is_artist())
with check (public.is_artist());

drop policy if exists "artists_manage_product_attributes" on public.product_attributes;
create policy "artists_manage_product_attributes"
on public.product_attributes
for all
to authenticated
using (public.is_artist())
with check (public.is_artist());

revoke all on table public.customers from anon;
revoke all on table public.projects from anon;
revoke all on table public.sessions from anon;
revoke all on table public.attributes from anon;
revoke all on table public.products from anon;
revoke all on table public.product_type from anon;
revoke all on table public.product_attributes from anon;

grant select, insert, update, delete on table public.customers to authenticated;
grant select, insert, update, delete on table public.projects to authenticated;
grant select, insert, update, delete on table public.sessions to authenticated;
grant select, insert, update, delete on table public.attributes to authenticated;
grant select, insert, update, delete on table public.products to authenticated;
grant select, insert, update, delete on table public.product_type to authenticated;
grant select, insert, update, delete on table public.product_attributes to authenticated;

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

   update public.sessions
   set status = case
      when status = 'CANCELED'::session_status then status
      when current_timestamp > coalesce(ends_at, starts_at) then 'FINISHED'::session_status
      when current_timestamp between starts_at and ends_at then 'IN_PROGRESS'::session_status
      else status
   end
   where
      status is distinct from 'CANCELED'::session_status
      and status is distinct from (
         case
            when current_timestamp > coalesce(ends_at, starts_at) then 'FINISHED'::session_status
            when current_timestamp between starts_at and ends_at then 'IN_PROGRESS'::session_status
            else status
         end
      );
end;
$$;

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

   perform public.sync_sessions_status();

   return query
      select * from public.sessions where project_id = p_id order by starts_at desc;
end;
$$;

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

   perform public.sync_sessions_status();

   return query
      select * from public.sessions where id = s_id;
end;
$$;

revoke all on function public.sync_sessions_status() from public;
revoke all on function public.get_sessions_by_project_id(bigint) from public;
revoke all on function public.get_session_by_id(bigint) from public;

revoke all on function public.sync_sessions_status() from anon;
revoke all on function public.get_sessions_by_project_id(bigint) from anon;
revoke all on function public.get_session_by_id(bigint) from anon;

grant execute on function public.sync_sessions_status() to authenticated;
grant execute on function public.get_sessions_by_project_id(bigint) to authenticated;
grant execute on function public.get_session_by_id(bigint) to authenticated;
