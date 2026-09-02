# Base de datos ARMONY (Supabase)

## Puesta en marcha

1. Crear un proyecto en [supabase.com](https://supabase.com).
2. Copiar `URL`, `anon key` y `service_role key` a `.env.local`
   (ver `.env.example` en la raíz).
3. Abrir el **SQL Editor** del proyecto y ejecutar, en este orden:
   - `migrations/0001_init.sql`
   - `seed.sql`
4. Crear el primer usuario administrador (ver más abajo).

Con la CLI de Supabase:

```bash
supabase link --project-ref <ref>
supabase db push
psql "$DATABASE_URL" -f supabase/seed.sql
```

## Crear un administrador

El alta de administradores es deliberadamente manual: no existe registro
público en `/admin`.

1. **Authentication → Users → Add user** en el panel de Supabase.
   Crear el usuario con correo y contraseña (marcar el correo como confirmado).
2. En el **SQL Editor**, autorizarlo:

```sql
insert into public.admins (user_id, email, full_name)
select id, email, 'Nombre del administrador'
from auth.users
where email = 'correo@delAdministrador.cl'
on conflict (user_id) do nothing;
```

Para revocar el acceso basta con borrar su fila de `public.admins`.

## Cómo funciona la disponibilidad

```
Horario habitual (semana)  +  Excepciones por fecha  +  Cupos  −  Solicitudes activas
                     =  lo que ve el cliente en el calendario
```

- `time_slots` — los bloques horarios. Editables desde el panel.
- `weekly_availability` — qué bloques están activos en cada día de la semana.
- `availability_overrides` — excepciones para fechas puntuales:
  - fila con `time_slot_id = NULL` e `is_available = false` → **día completo bloqueado**;
  - fila con `time_slot_id` → ese bloque, sólo ese día;
  - **sin filas** para la fecha → se usa el horario habitual.

Todo esto se calcula en la base de datos con `public_availability(desde, hasta)`,
que es lo único que el sitio público puede consultar. No expone motivos de
bloqueo, capacidades totales ni datos personales.

## Seguridad

- RLS activo en todas las tablas.
- El público (`anon`) **no tiene acceso directo a ninguna tabla**.
- Las solicitudes se crean con `create_appointment(...)`, que toma un
  `pg_advisory_xact_lock` sobre `fecha:bloque` y revalida el cupo dentro de la
  misma transacción. Dos personas no pueden tomar el último cupo.
- Las fotos viven en un bucket **privado**; el panel las ve con signed URLs de
  corta duración.
- La `service_role key` sólo se usa en el servidor (route handlers).

## Mantenimiento

`public.rate_limits` se limpia sola en cada llamada (borra ventanas de más de
un día). No requiere cron.
