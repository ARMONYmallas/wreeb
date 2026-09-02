-- ============================================================================
-- ARMONY · Esquema inicial
-- Agendamiento de visitas + sistema de disponibilidad administrable.
--
-- Principios:
--  · RLS activo en todas las tablas. El público NO tiene acceso directo.
--  · El público consulta disponibilidad sólo por RPC (public_availability).
--  · Las solicitudes se crean sólo por RPC transaccional con bloqueo, para que
--    dos personas no puedan tomar el último cupo del mismo bloque.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Utilidades
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Fecha "hoy" según la zona horaria del negocio, no del servidor.
create or replace function public.business_today()
returns date language sql stable as $$
  select (now() at time zone 'America/Santiago')::date;
$$;

create or replace function public.business_now_time()
returns time language sql stable as $$
  select (now() at time zone 'America/Santiago')::time;
$$;

-- ---------------------------------------------------------------------------
-- Administradores
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  full_name  text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Bloques horarios (editables desde el panel, nunca hardcodeados)
-- ---------------------------------------------------------------------------
create table if not exists public.time_slots (
  id               uuid primary key default gen_random_uuid(),
  label            text,
  start_time       time not null,
  end_time         time not null,
  default_capacity integer not null default 1 check (default_capacity >= 0 and default_capacity <= 50),
  is_active        boolean not null default true,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint time_slots_range_valid check (end_time > start_time)
);
create index if not exists time_slots_sort_idx on public.time_slots (sort_order, start_time);

-- ---------------------------------------------------------------------------
-- Horario habitual de la semana (0 = domingo … 6 = sábado)
-- ---------------------------------------------------------------------------
create table if not exists public.weekly_availability (
  id                uuid primary key default gen_random_uuid(),
  day_of_week       smallint not null check (day_of_week between 0 and 6),
  time_slot_id      uuid not null references public.time_slots(id) on delete cascade,
  is_active         boolean not null default true,
  capacity_override integer check (capacity_override >= 0 and capacity_override <= 50),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (day_of_week, time_slot_id)
);

-- ---------------------------------------------------------------------------
-- Excepciones por fecha
--
-- Semántica:
--   · (fecha, time_slot_id = NULL, is_available = false) → día completo bloqueado.
--   · (fecha, time_slot_id = X)                          → ese bloque, ese día.
--   · sin filas para la fecha                            → usa el horario habitual.
-- ---------------------------------------------------------------------------
create table if not exists public.availability_overrides (
  id                uuid primary key default gen_random_uuid(),
  date              date not null,
  time_slot_id      uuid references public.time_slots(id) on delete cascade,
  is_available      boolean not null,
  capacity_override integer check (capacity_override >= 0 and capacity_override <= 50),
  reason            text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create unique index if not exists availability_overrides_day_uniq
  on public.availability_overrides (date) where time_slot_id is null;
create unique index if not exists availability_overrides_slot_uniq
  on public.availability_overrides (date, time_slot_id) where time_slot_id is not null;
create index if not exists availability_overrides_date_idx on public.availability_overrides (date);

-- ---------------------------------------------------------------------------
-- Solicitudes de visita
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.space_type as enum ('ventanas', 'balcon', 'terraza', 'varios');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.service_type as enum ('instalacion', 'recambio', 'revision', 'no_seguro');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.appointment_status as enum
    ('new', 'contacted', 'confirmed', 'reschedule', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

create sequence if not exists public.appointment_request_seq start 1;

create table if not exists public.appointments (
  id             uuid primary key default gen_random_uuid(),
  request_number text not null unique,

  -- Contacto (mínimo indispensable, ver principio de captación)
  name  text not null,
  phone text not null,
  email text,

  -- Zona
  region_code text not null,
  region_name text not null,
  commune     text not null,

  -- Necesidad
  space_type   public.space_type not null,
  service_type public.service_type not null,

  -- Preferencia de visita (preferencia, NO confirmación)
  preferred_date date not null,
  time_slot_id   uuid references public.time_slots(id) on delete set null,

  status public.appointment_status not null default 'new',

  -- Datos que ARMONY completa después, por WhatsApp o desde el panel
  address      text,
  apartment    text,
  floor        text,
  reference    text,
  window_count integer check (window_count >= 0 and window_count <= 200),
  details      text,

  customer_notes text,
  source         text not null default 'web',
  consent_at     timestamptz not null default now(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists appointments_date_slot_idx
  on public.appointments (preferred_date, time_slot_id, status);
create index if not exists appointments_status_idx on public.appointments (status, created_at desc);
create index if not exists appointments_created_idx on public.appointments (created_at desc);
create index if not exists appointments_commune_idx on public.appointments (commune);

-- ---------------------------------------------------------------------------
-- Fotos (Storage privado; el panel accede con signed URLs)
-- ---------------------------------------------------------------------------
create table if not exists public.appointment_photos (
  id             uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  storage_path   text not null,
  mime_type      text,
  size_bytes     integer,
  created_at     timestamptz not null default now()
);
create index if not exists appointment_photos_appointment_idx
  on public.appointment_photos (appointment_id);

-- ---------------------------------------------------------------------------
-- Notas internas
-- ---------------------------------------------------------------------------
create table if not exists public.admin_notes (
  id             uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  admin_id       uuid references auth.users(id) on delete set null,
  author_email   text,
  content        text not null check (char_length(content) between 1 and 2000),
  created_at     timestamptz not null default now()
);
create index if not exists admin_notes_appointment_idx
  on public.admin_notes (appointment_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Historial de la solicitud
-- ---------------------------------------------------------------------------
create table if not exists public.appointment_events (
  id             uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  admin_id       uuid references auth.users(id) on delete set null,
  author_email   text,
  type           text not null,
  from_status    public.appointment_status,
  to_status      public.appointment_status,
  meta           jsonb,
  created_at     timestamptz not null default now()
);
create index if not exists appointment_events_appointment_idx
  on public.appointment_events (appointment_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Límite de peticiones (anti-spam, persistente entre instancias serverless)
-- ---------------------------------------------------------------------------
create table if not exists public.rate_limits (
  key          text primary key,
  hits         integer not null default 0,
  window_start timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Triggers updated_at
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['time_slots','weekly_availability','availability_overrides','appointments']
  loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format(
      'create trigger %I_touch before update on public.%I for each row execute function public.touch_updated_at()',
      t, t);
  end loop;
end $$;

-- ============================================================================
-- LÓGICA DE DISPONIBILIDAD
-- ============================================================================

-- Cupos restantes de un bloque en una fecha.
-- Devuelve -1 si el bloque no está disponible ese día.
create or replace function public.slot_remaining(p_date date, p_slot_id uuid)
returns integer
language plpgsql stable security definer set search_path = public as $$
declare
  v_slot        public.time_slots%rowtype;
  v_day_blocked boolean;
  v_slot_ov     public.availability_overrides%rowtype;
  v_weekly      public.weekly_availability%rowtype;
  v_available   boolean;
  v_capacity    integer;
  v_booked      integer;
begin
  select * into v_slot from public.time_slots where id = p_slot_id;
  if not found or not v_slot.is_active then
    return -1;
  end if;

  -- Nunca ofrecer fechas pasadas ni bloques que ya comenzaron hoy.
  if p_date < public.business_today() then
    return -1;
  end if;
  if p_date = public.business_today() and v_slot.start_time <= public.business_now_time() then
    return -1;
  end if;

  select true into v_day_blocked
  from public.availability_overrides
  where date = p_date and time_slot_id is null and is_available = false
  limit 1;
  if coalesce(v_day_blocked, false) then
    return -1;
  end if;

  select * into v_slot_ov from public.availability_overrides
  where date = p_date and time_slot_id = p_slot_id limit 1;

  select * into v_weekly from public.weekly_availability
  where day_of_week = extract(dow from p_date)::smallint and time_slot_id = p_slot_id limit 1;

  if v_slot_ov.id is not null then
    v_available := v_slot_ov.is_available;
  else
    v_available := coalesce(v_weekly.is_active, false);
  end if;

  if not v_available then
    return -1;
  end if;

  v_capacity := coalesce(v_slot_ov.capacity_override, v_weekly.capacity_override, v_slot.default_capacity);

  select count(*) into v_booked
  from public.appointments
  where preferred_date = p_date
    and time_slot_id = p_slot_id
    and status in ('new', 'contacted', 'confirmed', 'reschedule');

  return greatest(v_capacity - v_booked, 0);
end;
$$;

-- Disponibilidad pública para un rango de fechas.
-- Sólo devuelve bloques realmente ofrecibles: no expone motivos de bloqueo,
-- capacidades totales ni ninguna otra información interna.
create or replace function public.public_availability(p_from date, p_to date)
returns table (
  day        date,
  slot_id    uuid,
  label      text,
  start_time time,
  end_time   time,
  remaining  integer
)
language sql stable security definer set search_path = public as $$
  with bounded as (
    select greatest(p_from, public.business_today())      as f,
           least(p_to, public.business_today() + 120)      as t
  ),
  days as (
    select d::date as day
    from bounded, generate_series(bounded.f, bounded.t, interval '1 day') as d
  ),
  computed as (
    select d.day,
           ts.id         as slot_id,
           ts.label,
           ts.start_time,
           ts.end_time,
           ts.sort_order,
           public.slot_remaining(d.day, ts.id) as remaining
    from days d
    cross join public.time_slots ts
    where ts.is_active
  )
  select c.day, c.slot_id, c.label, c.start_time, c.end_time, c.remaining
  from computed c
  where c.remaining > 0
  order by c.day, c.sort_order, c.start_time;
$$;

-- Vista administrativa: incluye bloques no disponibles y el motivo, para pintar
-- el calendario del panel.
create or replace function public.admin_availability(p_from date, p_to date)
returns table (
  day          date,
  slot_id      uuid,
  label        text,
  start_time   time,
  end_time     time,
  is_available boolean,
  capacity     integer,
  booked       integer,
  is_custom    boolean,
  day_blocked  boolean,
  reason       text
)
language sql stable set search_path = public as $$
  with days as (
    select d::date as day from generate_series(p_from, least(p_to, p_from + 400), interval '1 day') as d
  ),
  day_block as (
    select o.date, o.reason from public.availability_overrides o
    where o.time_slot_id is null and o.is_available = false
  )
  select
    d.day,
    ts.id,
    ts.label,
    ts.start_time,
    ts.end_time,
    case
      when db.date is not null then false
      when so.id is not null then so.is_available
      else coalesce(wa.is_active, false)
    end as is_available,
    coalesce(so.capacity_override, wa.capacity_override, ts.default_capacity) as capacity,
    (
      select count(*)::int from public.appointments a
      where a.preferred_date = d.day and a.time_slot_id = ts.id
        and a.status in ('new', 'contacted', 'confirmed', 'reschedule')
    ) as booked,
    (so.id is not null) as is_custom,
    (db.date is not null) as day_blocked,
    coalesce(db.reason, so.reason) as reason
  from days d
  cross join public.time_slots ts
  left join day_block db on db.date = d.day
  left join public.availability_overrides so
    on so.date = d.day and so.time_slot_id = ts.id
  left join public.weekly_availability wa
    on wa.day_of_week = extract(dow from d.day)::smallint and wa.time_slot_id = ts.id
  where ts.is_active
  order by d.day, ts.sort_order, ts.start_time;
$$;

-- ============================================================================
-- CREACIÓN DE SOLICITUDES (transaccional, a prueba de doble reserva)
-- ============================================================================
create or replace function public.create_appointment(
  p_name           text,
  p_phone          text,
  p_email          text,
  p_region_code    text,
  p_region_name    text,
  p_commune        text,
  p_space_type     public.space_type,
  p_service_type   public.service_type,
  p_preferred_date date,
  p_time_slot_id   uuid,
  p_customer_notes text default null,
  p_source         text default 'web'
)
returns table (id uuid, request_number text)
language plpgsql security definer set search_path = public as $$
declare
  v_remaining integer;
  v_number    text;
  v_id        uuid;
begin
  -- Serializa a todos los que intenten el mismo bloque en la misma fecha.
  perform pg_advisory_xact_lock(hashtext(p_preferred_date::text || ':' || p_time_slot_id::text));

  -- Revalidación en servidor: lo que mostró el calendario al abrir la página
  -- no es fuente de verdad.
  v_remaining := public.slot_remaining(p_preferred_date, p_time_slot_id);
  if v_remaining is null or v_remaining <= 0 then
    raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0001';
  end if;

  v_number := 'AR-' || to_char(now() at time zone 'America/Santiago', 'YYYY') || '-' ||
              lpad(nextval('public.appointment_request_seq')::text, 4, '0');

  insert into public.appointments (
    request_number, name, phone, email, region_code, region_name, commune,
    space_type, service_type, preferred_date, time_slot_id, customer_notes, source
  ) values (
    v_number, p_name, p_phone, nullif(p_email, ''), p_region_code, p_region_name, p_commune,
    p_space_type, p_service_type, p_preferred_date, p_time_slot_id,
    nullif(p_customer_notes, ''), p_source
  ) returning appointments.id into v_id;

  insert into public.appointment_events (appointment_id, type, to_status, meta)
  values (v_id, 'created', 'new', jsonb_build_object('source', p_source));

  return query select v_id, v_number;
end;
$$;

-- Reprograma una solicitud validando el nuevo bloque igual que una solicitud nueva.
create or replace function public.reschedule_appointment(
  p_appointment_id uuid,
  p_date           date,
  p_slot_id        uuid,
  p_author_email   text default null
)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_remaining integer;
  v_old       public.appointments%rowtype;
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  select * into v_old from public.appointments where id = p_appointment_id for update;
  if not found then
    raise exception 'NOT_FOUND' using errcode = 'P0002';
  end if;

  perform pg_advisory_xact_lock(hashtext(p_date::text || ':' || p_slot_id::text));

  -- Si la solicitud ya ocupaba ese mismo bloque, no vuelve a consumir cupo.
  if not (v_old.preferred_date = p_date and v_old.time_slot_id = p_slot_id) then
    v_remaining := public.slot_remaining(p_date, p_slot_id);
    if v_remaining is null or v_remaining <= 0 then
      raise exception 'SLOT_UNAVAILABLE' using errcode = 'P0001';
    end if;
  end if;

  update public.appointments
  set preferred_date = p_date, time_slot_id = p_slot_id
  where id = p_appointment_id;

  insert into public.appointment_events (appointment_id, admin_id, author_email, type, meta)
  values (
    p_appointment_id, auth.uid(), p_author_email, 'rescheduled',
    jsonb_build_object(
      'from_date', v_old.preferred_date, 'from_slot', v_old.time_slot_id,
      'to_date', p_date, 'to_slot', p_slot_id)
  );
end;
$$;

-- ============================================================================
-- BLOQUEO DE RANGOS (vacaciones, feriados, trabajos fuera de Santiago)
-- ============================================================================
create or replace function public.block_date_range(
  p_from   date,
  p_to     date,
  p_reason text default null
)
returns integer
language plpgsql security definer set search_path = public as $$
declare v_count integer := 0;
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  if p_to < p_from then
    raise exception 'INVALID_RANGE' using errcode = 'P0001';
  end if;
  if p_to - p_from > 365 then
    raise exception 'RANGE_TOO_LONG' using errcode = 'P0001';
  end if;

  -- Un día bloqueado no necesita excepciones por bloque.
  delete from public.availability_overrides
  where date between p_from and p_to and time_slot_id is not null;

  insert into public.availability_overrides (date, time_slot_id, is_available, reason)
  select d::date, null, false, nullif(p_reason, '')
  from generate_series(p_from, p_to, interval '1 day') d
  on conflict (date) where time_slot_id is null
  do update set is_available = false, reason = excluded.reason, updated_at = now();

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Vuelve a dejar un rango con el horario habitual.
create or replace function public.restore_date_range(p_from date, p_to date)
returns integer
language plpgsql security definer set search_path = public as $$
declare v_count integer := 0;
begin
  if not public.is_admin() then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  delete from public.availability_overrides where date between p_from and p_to;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- ============================================================================
-- LÍMITE DE PETICIONES
-- ============================================================================
create or replace function public.check_rate_limit(
  p_key             text,
  p_max             integer,
  p_window_seconds  integer
)
returns boolean
language plpgsql security definer set search_path = public as $$
declare v_count integer;
begin
  delete from public.rate_limits
  where window_start < now() - interval '1 day';

  insert into public.rate_limits (key, hits, window_start)
  values (p_key, 1, now())
  on conflict (key) do update
    set hits = case
          when rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
            then 1
          else rate_limits.hits + 1
        end,
        window_start = case
          when rate_limits.window_start < now() - make_interval(secs => p_window_seconds)
            then now()
          else rate_limits.window_start
        end
  returning rate_limits.hits into v_count;

  return v_count <= p_max;
end;
$$;

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.admins                enable row level security;
alter table public.time_slots            enable row level security;
alter table public.weekly_availability   enable row level security;
alter table public.availability_overrides enable row level security;
alter table public.appointments          enable row level security;
alter table public.appointment_photos    enable row level security;
alter table public.admin_notes           enable row level security;
alter table public.appointment_events    enable row level security;
alter table public.rate_limits           enable row level security;

do $$
declare
  t text;
  p text;
begin
  foreach t in array array[
    'admins','time_slots','weekly_availability','availability_overrides',
    'appointments','appointment_photos','admin_notes','appointment_events','rate_limits'
  ] loop
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', p, t);
    end loop;
  end loop;
end $$;

-- Un administrador puede verse a sí mismo; el alta de administradores se hace
-- desde el servidor (service role), nunca desde el navegador.
create policy admins_self_read on public.admins
  for select to authenticated using (user_id = auth.uid());

-- Disponibilidad: sólo administradores autenticados escriben y leen las tablas.
-- El público nunca toca estas tablas: consulta por RPC.
create policy time_slots_admin on public.time_slots
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy weekly_admin on public.weekly_availability
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy overrides_admin on public.availability_overrides
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Datos personales: sólo administradores.
create policy appointments_admin on public.appointments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy photos_admin on public.appointment_photos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy notes_admin on public.admin_notes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy events_admin on public.appointment_events
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- rate_limits queda sin políticas: sólo accesible por service role / RPC.

-- ---------------------------------------------------------------------------
-- Permisos de ejecución
-- ---------------------------------------------------------------------------
revoke all on function public.slot_remaining(date, uuid) from public, anon, authenticated;
revoke all on function public.public_availability(date, date) from public;
revoke all on function public.create_appointment(text, text, text, text, text, text,
  public.space_type, public.service_type, date, uuid, text, text) from public, anon, authenticated;
revoke all on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;
revoke all on function public.reschedule_appointment(uuid, date, uuid, text) from public, anon;
revoke all on function public.block_date_range(date, date, text) from public, anon;
revoke all on function public.restore_date_range(date, date) from public, anon;

-- El público sólo puede consultar disponibilidad ya calculada.
grant execute on function public.public_availability(date, date) to anon, authenticated, service_role;
grant execute on function public.create_appointment(text, text, text, text, text, text,
  public.space_type, public.service_type, date, uuid, text, text) to service_role;
grant execute on function public.check_rate_limit(text, integer, integer) to service_role;
grant execute on function public.slot_remaining(date, uuid) to service_role;
grant execute on function public.reschedule_appointment(uuid, date, uuid, text) to authenticated, service_role;
grant execute on function public.block_date_range(date, date, text) to authenticated, service_role;
grant execute on function public.restore_date_range(date, date) to authenticated, service_role;

-- ============================================================================
-- STORAGE PRIVADO PARA LAS FOTOS
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'appointment-photos', 'appointment-photos', false, 8388608,
  array['image/jpeg','image/png','image/webp','image/heic','image/heif']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "armony admins read photos" on storage.objects;
create policy "armony admins read photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'appointment-photos' and public.is_admin());
