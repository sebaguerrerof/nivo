# Nivo

Nivo es una PWA personal, mobile-first, para organizar el día, seguir el progreso y mantener las finanzas bajo control sin sobrecargar la experiencia.

## Funcionalidades actuales

- Autenticación con Supabase: registro, login, recuperación y cambio de contraseña.
- Onboarding breve para cuentas nuevas, con preferencias, intereses y accesos al primer plan o presupuesto.
- Planificación diaria, objetivos, actividades, resultados, cierre del día y reportes editables para WhatsApp.
- Planificación asistida mediante IA: la persona revisa y confirma siempre antes de guardar.
- XP, niveles, rachas, logros, puntaje del día y progreso personal.
- Ingresos, gastos, categorías, presupuestos, disponible para gastar y gráficos.
- Pagos recurrentes, terapia, historial y creación automática de gastos al marcar un pago.
- Notificaciones internas discretas, navegación móvil con acciones rápidas, temas claro/oscuro, PWA, modo sin conexión y aviso de actualización.
- Exportación JSON de datos propios y eliminación deliberada de la propia cuenta.

## Stack

Ionic React, TypeScript estricto, Vite, Tailwind CSS, TanStack Query, Zustand (solo tema), Supabase, Vercel, Zod, Framer Motion, Lucide y Recharts.

## Ejecutar localmente

```bash
npm install
Copy-Item .env.example .env.local
npx supabase db push --linked
npm run dev
```

Después abre `http://localhost:5173`.

## Variables de entorno

| Variable | Entorno | Uso |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | navegador y Vercel | URL pública del proyecto Supabase. |
| `VITE_SUPABASE_ANON_KEY` | navegador y Vercel | Clave publishable/anónima; RLS protege los datos. |
| `OPENAI_API_KEY` | solo servidor Vercel | Planificación asistida y reporte; nunca usar prefijo `VITE_`. |
| `OPENAI_MODEL` | solo servidor Vercel | Opcional; por defecto `gpt-5.6-luna`. |
| `SUPABASE_SERVICE_ROLE_KEY` | solo servidor Vercel | Necesaria únicamente para la eliminación segura de la propia cuenta desde `/api/delete-account`. |

Nunca subas `.env.local`, una service role key, tokens de usuario ni claves privadas a Git. No declares secretos con prefijo `VITE_`.

## Supabase

Las migraciones de `supabase/migrations` son la fuente de verdad y deben aplicarse con Supabase CLI. No realices cambios de esquema que queden solo en el dashboard.

RLS aísla los datos privados por `auth.uid() = user_id`. Las funciones `SECURITY DEFINER` validan `auth.uid()`, propiedad del recurso y usan `search_path` fijo. Las categorías de sistema y logros son los únicos catálogos compartidos de solo lectura.

En **Authentication → URL Configuration** configura:

- Site URL de producción: `https://nivo-lake.vercel.app`
- Desarrollo: `http://localhost:5173`
- Redirect URLs: `/auth/callback` y `/auth/reset-password` para ambos entornos.

### SMTP y correos

Supabase controla confirmación de email, recuperación y magic link. Para evitar límites del proveedor por defecto, configura un SMTP propio en **Authentication → SMTP Settings**:

1. Activa **Enable custom SMTP**.
2. Ingresa host, puerto, usuario, contraseña, remitente y nombre `Nivo` del proveedor elegido.
3. Conserva esos secretos exclusivamente en Supabase; no los copies a Vercel ni al repositorio.
4. Personaliza las plantillas con enlaces a `https://nivo-lake.vercel.app` y un tono simple. Prueba registro y recuperación tras guardar.

## IA y privacidad

Las rutas `/api/plan-draft` y `/api/daily-report` exigen un access token válido de Supabase. OpenAI recibe únicamente el texto y los datos personales necesarios cuando la persona pulsa generar; se usa `store: false`.

Nivo no envía automáticamente finanzas, pagos ni razones privadas de actividades no realizadas a la IA. Tampoco publica mensajes de WhatsApp: solo genera un borrador editable.

## PWA y producción

La PWA usa un shell offline y avisa cuando hay una versión nueva para evitar caché indefinida. Las operaciones que requieren servidor muestran error si no se guardan; no se simulan como completadas offline.

En Vercel configura las variables anteriores en **Production**, **Preview** y **Development** según corresponda. `OPENAI_API_KEY` y `SUPABASE_SERVICE_ROLE_KEY` deben quedar disponibles solo para funciones server-side.

## Calidad

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

El paquete de pruebas cubre esquemas, cálculos, consultas, gamificación, pagos y revisiones estáticas de RLS/RPC. La validación E2E completa requiere un proyecto Supabase de prueba con usuarios controlados; no debe ejecutarse contra producción.

## Estructura

```text
src/
  components/      # Design system, feedback y layout
  features/        # Auth, onboarding, planning, progreso, finanzas, pagos, perfil
  hooks/           # Perfil y tema
  lib/             # Supabase, Query Client y utilidades
  services/        # Acceso desacoplado a Supabase y APIs
  stores/          # Estado local mínimo
supabase/
  migrations/      # Esquema, RLS y RPC versionados
api/               # Funciones Vercel protegidas
```