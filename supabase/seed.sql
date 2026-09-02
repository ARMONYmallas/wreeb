-- ============================================================================
-- ARMONY · Datos iniciales
-- Bloques horarios y horario habitual de partida.
-- ARMONY puede cambiar todo esto después desde /admin/disponibilidad,
-- sin tocar código ni la base de datos.
-- ============================================================================

insert into public.time_slots (label, start_time, end_time, default_capacity, is_active, sort_order)
select * from (values
  ('Mañana',   '09:00'::time, '12:00'::time, 2, true, 1),
  ('Mediodía', '12:00'::time, '15:00'::time, 2, true, 2),
  ('Tarde',    '15:00'::time, '18:00'::time, 1, true, 3)
) as v(label, start_time, end_time, default_capacity, is_active, sort_order)
where not exists (select 1 from public.time_slots);

-- Horario habitual de partida: lunes a sábado activo, domingo no disponible.
insert into public.weekly_availability (day_of_week, time_slot_id, is_active)
select d.dow, ts.id, d.dow between 1 and 6
from generate_series(0, 6) as d(dow)
cross join public.time_slots ts
on conflict (day_of_week, time_slot_id) do nothing;
