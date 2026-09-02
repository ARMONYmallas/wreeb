-- ============================================================================
-- ARMONY · Pruebas de la lógica de disponibilidad
--
-- Cómo ejecutarlas:
--   psql "$DATABASE_URL" -f supabase/tests/disponibilidad.test.sql
--
-- Se ejecutan dentro de una transacción que se revierte al final: no dejan
-- datos en la base. Requieren el esquema (0001_init.sql) y el seed cargados.
-- ============================================================================

begin;
\set ON_ERROR_STOP on
\pset pager off

do $$
declare
  v_slot_manana uuid;
  v_slot_tarde  uuid;
  v_hoy         date := public.business_today();
  v_n           integer;
  v_id          uuid;
  v_fallos      integer := 0;

begin
  select id into v_slot_manana from public.time_slots where is_active order by sort_order limit 1;
  select id into v_slot_tarde  from public.time_slots where is_active order by sort_order desc limit 1;

  -- 1. Nunca se ofrecen fechas pasadas.
  select count(*) into v_n from public.public_availability(v_hoy - 30, v_hoy + 3) where day < v_hoy;
  if v_n <> 0 then raise warning 'FALLO 1: se ofrecen % bloques en el pasado', v_n; v_fallos := v_fallos + 1;
  else raise notice 'OK 1 · no se ofrecen fechas pasadas'; end if;

  -- 2. Los días sin horario habitual no aparecen.
  select count(*) into v_n
  from public.public_availability(v_hoy, v_hoy + 13) pa
  where not exists (
    select 1 from public.weekly_availability w
    where w.day_of_week = extract(dow from pa.day)::smallint
      and w.time_slot_id = pa.slot_id and w.is_active
  )
  and not exists (
    select 1 from public.availability_overrides o
    where o.date = pa.day and o.time_slot_id = pa.slot_id and o.is_available
  );
  if v_n <> 0 then raise warning 'FALLO 2: % bloques sin respaldo en el horario', v_n; v_fallos := v_fallos + 1;
  else raise notice 'OK 2 · sólo se ofrece lo habilitado'; end if;

  -- 3. Bloquear un día completo lo saca de la disponibilidad pública.
  insert into public.availability_overrides (date, time_slot_id, is_available, reason)
  values (v_hoy + 3, null, false, 'Prueba');
  select count(*) into v_n from public.public_availability(v_hoy + 3, v_hoy + 3);
  if v_n <> 0 then raise warning 'FALLO 3: el día bloqueado ofrece % bloques', v_n; v_fallos := v_fallos + 1;
  else raise notice 'OK 3 · el día bloqueado desaparece'; end if;

  -- 4. Personalizar un día no afecta al mismo día de otras semanas.
  insert into public.availability_overrides (date, time_slot_id, is_available)
  select v_hoy + 4, id, (id = v_slot_manana) from public.time_slots where is_active;

  select count(*) into v_n from public.public_availability(v_hoy + 4, v_hoy + 4);
  if v_n > 1 then raise warning 'FALLO 4a: el día personalizado ofrece % bloques', v_n; v_fallos := v_fallos + 1;
  else raise notice 'OK 4a · el día personalizado ofrece sólo lo elegido'; end if;

  select count(*) into v_n from public.availability_overrides where date = v_hoy + 11;
  if v_n <> 0 then raise warning 'FALLO 4b: se modificó otra semana'; v_fallos := v_fallos + 1;
  else raise notice 'OK 4b · no afecta al mismo día de otra semana'; end if;

  -- 5. Una solicitud consume un cupo del bloque.
  delete from public.availability_overrides where date in (v_hoy + 3, v_hoy + 4);
  select (public.create_appointment(
    'Prueba','56911112222','', 'CL-RM','Región Metropolitana de Santiago','Ñuñoa',
    'balcon','instalacion', v_hoy + 5, v_slot_tarde, '', 'test')).id into v_id;

  select count(*) into v_n from public.appointments where id = v_id;
  if v_n <> 1 then raise warning 'FALLO 5: no se creó la solicitud'; v_fallos := v_fallos + 1;
  else raise notice 'OK 5 · la solicitud se crea correctamente'; end if;

  -- 6. Un bloque lleno deja de ofrecerse.
  -- Se fija la capacidad en 1 dentro de la transacción para que la prueba no
  -- dependa de cómo tenga configurados los cupos cada instalación.
  update public.time_slots set default_capacity = 1 where id = v_slot_tarde;
  select count(*) into v_n
  from public.public_availability(v_hoy + 5, v_hoy + 5) where slot_id = v_slot_tarde;
  if v_n <> 0 then raise warning 'FALLO 6: el bloque lleno se sigue ofreciendo'; v_fallos := v_fallos + 1;
  else raise notice 'OK 6 · el bloque lleno deja de ofrecerse'; end if;

  -- 7. Cancelar libera el cupo.
  update public.appointments set status = 'cancelled' where id = v_id;
  select count(*) into v_n
  from public.public_availability(v_hoy + 5, v_hoy + 5) where slot_id = v_slot_tarde;
  if v_n = 0 then raise warning 'FALLO 7: cancelar no liberó el cupo'; v_fallos := v_fallos + 1;
  else raise notice 'OK 7 · cancelar libera el cupo'; end if;

  -- 8. No se puede reservar en el pasado.
  begin
    perform public.create_appointment(
      'Pasado','56911112222','', 'CL-RM','Región Metropolitana de Santiago','Ñuñoa',
      'balcon','revision', v_hoy - 1, v_slot_manana, '', 'test');
    raise warning 'FALLO 8: se permitió reservar en el pasado';
    v_fallos := v_fallos + 1;
  exception when others then
    raise notice 'OK 8 · reservar en el pasado se rechaza (%)', sqlerrm;
  end;

  -- 9. No se puede reservar un día bloqueado.
  insert into public.availability_overrides (date, time_slot_id, is_available)
  values (v_hoy + 6, null, false);
  begin
    perform public.create_appointment(
      'Bloqueado','56911112222','', 'CL-RM','Región Metropolitana de Santiago','Ñuñoa',
      'balcon','revision', v_hoy + 6, v_slot_manana, '', 'test');
    raise warning 'FALLO 9: se permitió reservar un día bloqueado';
    v_fallos := v_fallos + 1;
  exception when others then
    raise notice 'OK 9 · reservar un día bloqueado se rechaza (%)', sqlerrm;
  end;

  -- 10. block_date_range y restore_date_range.
  perform set_config('request.jwt.claims', json_build_object('sub', (select user_id from public.admins limit 1))::text, true);
  if exists (select 1 from public.admins) then
    perform public.block_date_range(v_hoy + 20, v_hoy + 25, 'Vacaciones');
    select count(*) into v_n from public.public_availability(v_hoy + 20, v_hoy + 25);
    if v_n <> 0 then raise warning 'FALLO 10a: el rango bloqueado ofrece % bloques', v_n; v_fallos := v_fallos + 1;
    else raise notice 'OK 10a · el rango bloqueado desaparece'; end if;

    perform public.restore_date_range(v_hoy + 20, v_hoy + 25);
    select count(*) into v_n from public.availability_overrides where date between v_hoy + 20 and v_hoy + 25;
    if v_n <> 0 then raise warning 'FALLO 10b: quedaron excepciones sin borrar'; v_fallos := v_fallos + 1;
    else raise notice 'OK 10b · restaurar deja el horario habitual'; end if;
  else
    raise notice 'OMITIDAS 10a/10b · no hay administradores dados de alta';
  end if;

  if v_fallos = 0 then
    raise notice '';
    raise notice '── TODAS LAS PRUEBAS PASARON ──';
  else
    raise exception '% prueba(s) fallaron', v_fallos;
  end if;
end $$;

rollback;

-- ----------------------------------------------------------------------------
-- Prueba de doble reserva simultánea
--
-- No puede ejecutarse en una sola sesión: hacen falta dos conexiones. Para
-- comprobarla manualmente, con un bloque de capacidad 1:
--
--   Sesión A: BEGIN;
--             SELECT create_appointment(... fecha X, bloque Y ...);
--             -- sin COMMIT todavía
--
--   Sesión B: BEGIN;
--             SELECT create_appointment(... la MISMA fecha X y bloque Y ...);
--             -- queda esperando el pg_advisory_xact_lock
--
--   Sesión A: COMMIT;
--   Sesión B: -> falla con SLOT_UNAVAILABLE
--
-- Resultado esperado: una sola solicitud sobrevive.
-- ----------------------------------------------------------------------------
