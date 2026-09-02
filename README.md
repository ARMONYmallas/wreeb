# ARMONY · Mallas de Seguridad

Sitio web y sistema de agendamiento de ARMONY, empresa chilena especializada en
instalación, revisión y recambio de mallas de seguridad para ventanas, balcones
y terrazas.

> **17 años protegiendo lo que más importa.**

El proyecto tiene tres partes:

1. **Sitio público** — presenta a ARMONY y lleva a solicitar una visita.
2. **Agendamiento en 3 pasos** — el cliente pide una visita en menos de un minuto.
3. **Panel administrativo** — ARMONY gestiona solicitudes y su disponibilidad
   desde el celular, sin tocar código.

---

## Puesta en marcha

```bash
npm install
cp .env.example .env.local     # completar con los datos reales
npm run dev                    # http://localhost:3000
```

### 1. Base de datos (Supabase)

Ver [`supabase/README.md`](supabase/README.md) para el paso a paso. En resumen:

1. Crear un proyecto en [supabase.com](https://supabase.com).
2. Ejecutar `supabase/migrations/0001_init.sql` y luego `supabase/seed.sql`
   en el SQL Editor.
3. Crear el primer administrador (instrucciones en ese mismo archivo).

### 2. Variables de entorno

Todas están documentadas en `.env.example`. Las imprescindibles:

| Variable | Para qué sirve |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Conexión pública a Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | **Sólo servidor.** Crear solicitudes y firmar fotos |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp, formato `56912345678` |
| `RESEND_API_KEY` · `RESEND_FROM_EMAIL` · `ADMIN_NOTIFICATION_EMAIL` | Avisos por correo |
| `NEXT_PUBLIC_SITE_URL` | URL pública, para canonical y sitemap |

El sitio funciona aunque falten variables: los botones que no llevan a ninguna
parte simplemente no se muestran, y el calendario explica que no hay horarios
publicados en vez de romperse.

### 3. Despliegue (Vercel)

Importar el repositorio, cargar las variables de entorno y desplegar. No hace
falta configuración adicional.

---

## Qué se cambia y dónde

**Nada de la información comercial está escrita dentro de los componentes.**

| Qué quieres cambiar | Dónde |
|---|---|
| Teléfono, correo, Instagram, cobertura, garantía, ficha técnica | `src/config/business.ts` |
| Fotos de trabajos realizados | `src/config/gallery.ts` + `public/trabajos/` |
| Testimonios | `src/config/testimonials.ts` |
| Preguntas frecuentes | `src/config/faq.ts` |
| Servicios | `src/config/services.ts` |
| Recomendaciones de cuidado | `src/config/care.ts` |
| Menú de navegación | `src/config/navigation.ts` |
| Colores de marca | `src/app/globals.css` (bloque `@theme`) |
| **Días y horarios de visita** | **`/admin/disponibilidad`, desde el navegador** |

### Cómo se comporta lo que aún no está confirmado

El proyecto nunca inventa datos. Mientras ARMONY no entregue cierta información:

- La **galería** se oculta y en su lugar se enlaza el Instagram real.
- Los **testimonios** no se muestran en absoluto.
- Las **preguntas sin respuesta confirmada** muestran una respuesta neutra que
  deriva a WhatsApp, y quedan marcadas con `TODO_CONFIRM_WITH_ARMONY`.
- Las **especificaciones técnicas y la garantía** no se publican
  (`technicalSpecs.confirmed` y `guarantee.confirmed` en `false`).
- La **sección normativa** (por ejemplo la llamada "Ley Valentín") existe como
  componente pero está **deshabilitada**: no se publica ninguna afirmación legal
  sin verificarla antes en fuentes oficiales (BCN, Cámara, Senado, MINVU,
  Diario Oficial).
- En lugar de fotos de stock se dibuja una pieza gráfica propia. Al pasar `src`
  y `alt` a `PhotoSlot`, se reemplaza por la foto real.

---

## Cómo funciona la disponibilidad

```
Horario habitual  +  Excepciones por fecha  +  Cupos  −  Solicitudes activas
                    =  lo que ve el cliente
```

- **Horario habitual** (`/admin/disponibilidad` → Semana): la semana normal.
- **Excepciones por fecha** (→ Calendario): se toca un día y se elige entre
  *usar el horario habitual*, *personalizarlo* o *bloquearlo*. Sólo afecta a esa
  fecha.
- **Bloques horarios** (→ Bloques): se crean, editan, ordenan y eliminan desde
  la interfaz, con sus cupos. Nada está fijado en el código.

Todo se calcula en la base de datos. La web pública lo consulta sin caché, así
que **un cambio se ve en segundos, sin redeploy**.

Bloquear mañana toma **dos toques**: tocar el día → *Bloquear día completo*.

### Una solicitud no es una visita confirmada

Aunque un bloque aparezca disponible, la solicitud llega como **preferencia**.
ARMONY revisa y luego confirma o reprograma. El sitio nunca dice que una visita
está confirmada.

---

## Seguridad

- **RLS activo en todas las tablas.** El público (`anon`) no tiene ningún
  privilegio sobre ninguna tabla: consulta la disponibilidad por un RPC que
  devuelve sólo lo ofrecible, sin motivos de bloqueo ni datos internos.
- **Las solicitudes se crean con un RPC transaccional** que toma un
  `pg_advisory_xact_lock` sobre `fecha:bloque` y revalida el cupo dentro de la
  misma transacción. Dos personas no pueden tomar el último cupo.
- **El calendario del navegador no es fuente de verdad**: el servidor vuelve a
  validar todo, incluida la comuna contra su región.
- **Las fotos viven en un bucket privado.** El panel las ve con URLs firmadas de
  30 minutos. El tipo real se valida por firma binaria, no por la extensión ni
  por el `Content-Type` declarado.
- **Anti-spam**: campo trampa, tiempo mínimo de completado y límite de
  peticiones en dos niveles (uno amplio para ráfagas, otro estricto sobre
  solicitudes realmente creadas, para no castigar a quien se equivoca al
  escribir).
- **La `service_role key` sólo se usa en el servidor.** El panel opera con la
  sesión del administrador y RLS.
- **El alta de administradores es manual**: no hay registro público en `/admin`.
- Cabeceras de seguridad y `noindex` en `/admin` y `/agendar`.

---

## Pruebas

### Lógica de disponibilidad (portable, sobre cualquier Postgres)

```bash
psql "$DATABASE_URL" -f supabase/tests/disponibilidad.test.sql
```

Corre dentro de una transacción que se revierte: no deja datos. Cubre fechas
pasadas, días bloqueados, días personalizados, capacidad, cancelaciones y
bloqueo/restauración de rangos. La prueba de doble reserva simultánea, que
necesita dos conexiones, está documentada al final del archivo.

### Comprobaciones manuales recomendadas

```bash
npm run typecheck    # tipos
npm run lint         # estilo
npm run build        # compilación de producción
```

---

## Estructura

```
src/
  app/
    (site)/            Sitio público: home, servicios, trabajos, nosotros, FAQ, legales
    agendar/           Agendamiento en 3 pasos (sin navegación, para no distraer)
    admin/
      login/           Inicio de sesión (público)
      (panel)/         Panel protegido: inicio, solicitudes, agenda, disponibilidad
    api/
      availability/    Disponibilidad pública (sin caché)
      appointments/    Creación de solicitudes (validación + concurrencia)
  components/
    site/ home/ booking/ admin/ ui/
  config/              Toda la información del negocio
  data/chile.ts        16 regiones y 346 comunas
  lib/                 Fechas, validación, WhatsApp, correos, subidas, seguridad
supabase/
  migrations/          Esquema
  seed.sql             Bloques horarios y horario habitual de partida
  tests/               Pruebas de disponibilidad
```

---

## Lo que falta por confirmar con ARMONY

- Logotipo oficial y fotografías reales de trabajos.
- Número de WhatsApp, correo de contacto y correo de avisos internos.
- Testimonios reales autorizados.
- Ficha técnica (material, espesor, resistencia) y certificaciones, si existen.
- Garantía: plazo y condiciones.
- Si la visita tiene costo.
- Si se revisan mallas instaladas por otras empresas.
- Duración aproximada de una instalación.
- Razón social y RUT para la política de privacidad y los términos.
- Cobertura definitiva fuera de la Región Metropolitana.
