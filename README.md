# Nivo — Fundación, planificación, progreso y finanzas

Aplicación personal mobile-first construida con Ionic React, TypeScript estricto, Vite, Tailwind CSS, Supabase y Vercel.

## Alcance actual

- Registro, inicio/cierre de sesión y recuperación de contraseña con Supabase Auth.
- Sesión persistente y rutas protegidas.
- Perfil privado: nombre, apellido, moneda, zona horaria y apariencia.
- Dashboard con resumen del día y acceso a la planificación diaria.
- Planificación privada: plan, hasta tres objetivos, actividades, timeline, progreso derivado y cierre del día.
- Planificación asistida: pegar texto o describir el próximo día, revisar un borrador editable y confirmarlo antes de guardarlo.
- Design system base (botones, inputs, selects, alertas y tarjetas), tema claro/oscuro/sistema y shell PWA.
- TanStack Query para estado remoto y Zustand limitado a la preferencia local de tema.
- Gamificación, Daily Score, XP, rachas, logros y progreso con gráficos personales.
- Finanzas personales: ingresos, gastos, categorías base y personales, presupuesto mensual y por categoría, Safe to Spend y gráficos privados.

No se han implementado todavía pagos recurrentes, terapia, recordatorios financieros, conexión bancaria ni automatizaciones de IA que modifiquen datos sin confirmación.

## Inicio local

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` a `.env.local` y completa los valores de tu proyecto Supabase. Para probar la planificación asistida en local, agrega también tus variables de OpenAI solo en ese archivo local.

3. Aplica las migraciones versionadas. Con Supabase CLI enlazado al proyecto:

   ```bash
   supabase db push
   ```

   Las migraciones versionadas son la fuente de verdad; no apliques cambios manuales que queden fuera de Git.

4. En Supabase Auth configura:

   - `Site URL`: `http://localhost:5173` para desarrollo.
   - Redirect URLs: `http://localhost:5173/auth/callback` y `http://localhost:5173/auth/reset-password`.
   - Para producción, agrega `https://<tu-dominio>/auth/callback` y `https://<tu-dominio>/auth/reset-password`.

5. Ejecuta la app:

   ```bash
   npm run dev
   ```

## Variables de entorno

| Variable | Dónde se usa | Descripción |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Navegador y función de Vercel | URL del proyecto Supabase. |
| `VITE_SUPABASE_ANON_KEY` | Navegador y función de Vercel | Clave pública anónima/publishable de Supabase. |
| `OPENAI_API_KEY` | Solo función de Vercel | Clave de OpenAI para generar borradores; nunca debe llevar prefijo `VITE_`. |
| `OPENAI_MODEL` | Solo función de Vercel | Opcional. Por defecto: `gpt-5.6-luna`. |

Nunca uses `SUPABASE_SERVICE_ROLE_KEY` en el frontend ni la declares con prefijo `VITE_`.

## Planificación asistida y privacidad

`api/plan-draft.ts` es una función de Vercel que exige una sesión de Supabase válida antes de solicitar el borrador a OpenAI. Usa salida JSON estricta y `store: false`.

El texto de origen se envía únicamente cuando la persona pulsa **Generar borrador** y no se guarda en Nivo. Solo después de revisar y pulsar **Guardar este plan** se persisten los campos confirmados, objetivos y actividades. La migración `20260912000300_add_guided_daily_planning.sql` los inserta en una única transacción mediante una función `SECURITY INVOKER`, por lo que se aplican las políticas RLS existentes.

## Base de datos y seguridad

La migración de Fase 1 crea `public.profiles`, un trigger que inicializa el perfil al crear un usuario de Auth y políticas RLS de `SELECT`, `INSERT`, `UPDATE` y `DELETE` limitadas a `auth.uid() = user_id`.

La Fase 2 crea `daily_plans`, `daily_goals`, `activities` y `daily_reflections`, con RLS por fila y comprobación de propiedad del plan padre en escrituras de entidades hijas. La migración guiada agrega recuperación, responsabilidades, familia, riesgo y estrategia sin alterar dichas políticas.

`supabase/seed.sql` no inserta usuarios: los perfiles solo se generan mediante Auth. Los catálogos de dominio se agregarán en sus fases correspondientes.

La Fase 5 agrega inancial_categories, inancial_transactions, monthly_budgets y category_budgets. Las categorías de sistema son solo de lectura; las personales, transacciones y presupuestos se aíslan mediante RLS. Triggers en SQL validan que ninguna transacción o presupuesto pueda referenciar una categoría o presupuesto de otra persona, aunque se conozca su UUID.

## Verificación

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

## Deploy en Vercel

Configura en **Production**, **Preview** y **Development**:

1. `VITE_SUPABASE_URL`
2. `VITE_SUPABASE_ANON_KEY`
3. `OPENAI_API_KEY` (solo si deseas habilitar la planificación asistida)
4. `OPENAI_MODEL` (opcional)

El archivo `vercel.json` da prioridad al sistema de archivos para que `/api/plan-draft` se ejecute como función y conserva el fallback de la SPA para rutas del cliente. Después del deploy, agrega el dominio de producción a las Redirect URLs de Supabase Auth.