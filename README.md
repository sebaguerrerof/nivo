# Nivo — Fase 1

Fundación de una aplicación personal mobile-first construida con Ionic React, TypeScript estricto, Vite, Tailwind CSS y Supabase.

## Alcance actual

- Registro, inicio/cierre de sesión, magic link y recuperación de contraseña con Supabase Auth.
- Sesión persistente y rutas protegidas.
- Perfil privado: nombre, apellido, moneda, zona horaria y apariencia.
- Dashboard vacío con saludo, fecha y estado sin planificación.
- Navegación inferior en móvil y sidebar en escritorio. Las áreas posteriores se muestran como próximas, sin implementar rutas ni datos de Fase 2+.
- Design system base (botones, inputs, selects, alertas y tarjetas), tema claro/oscuro/sistema y shell PWA.
- TanStack Query preparado para estado remoto y Zustand limitado a la preferencia local de tema.

## Inicio local

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env.local` y completa los valores de tu proyecto Supabase.

3. Aplica la migración versionada. Con Supabase CLI enlazado al proyecto:

   ```bash
   supabase db push
   ```

   También puedes pegar el contenido de `supabase/migrations/20260912000100_create_profiles.sql` en el SQL Editor de Supabase, conservando la migración en Git como fuente de verdad.

4. En Supabase Auth configura:

   - `Site URL`: `http://localhost:5173` para desarrollo.
   - Redirect URLs: `http://localhost:5173/auth/callback` y `http://localhost:5173/auth/reset-password`.
   - Para producción, agrega `https://<tu-dominio>/auth/callback` y `https://<tu-dominio>/auth/reset-password`.

5. Ejecuta la app:

   ```bash
   npm run dev
   ```

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `VITE_SUPABASE_URL` | URL del proyecto en Supabase. |
| `VITE_SUPABASE_ANON_KEY` | Clave pública anónima/publishable del proyecto. |

Nunca uses `SUPABASE_SERVICE_ROLE_KEY` en el frontend ni la declares con prefijo `VITE_`.

## Base de datos y seguridad

La migración de Fase 1 crea `public.profiles`, un trigger que inicializa el perfil al crear un usuario de Auth y políticas RLS de `SELECT`, `INSERT`, `UPDATE` y `DELETE` limitadas a `auth.uid() = user_id`. El frontend encapsula el acceso en `src/services/profile.service.ts`; los componentes visuales no consultan Supabase directamente.

`supabase/seed.sql` no inserta usuarios: los perfiles solo se generan mediante Auth. Los catálogos de dominio se agregarán en sus fases correspondientes.

## Verificación

```bash
npm run typecheck
npm run lint
npm run build
```

## Deploy en Vercel

Importa el repositorio, configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en Production, Preview y Development. El archivo `vercel.json` mantiene las rutas de la SPA disponibles al recargar una URL protegida. Después del primer deploy, agrega también su dominio a las Redirect URLs de Supabase Auth.
