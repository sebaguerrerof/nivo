# Fase 9 — QA integral y estabilización

Fecha de inicio: 16 de septiembre de 2026
Base auditada: `8ecb7c0 feat: redesign daily execution and payments`

## Resumen inicial

| Prioridad | Cantidad | Estado |
| --- | ---: | --- |
| P0 — crítico | 0 | Sin hallazgos |
| P1 — importante | 1 | Resuelto |
| P2 — mejora de estabilidad/UX | 2 | Resuelto |
| P3 — deuda técnica o verificación externa | 3 | 1 resuelto / 1 aceptado / 1 pendiente externo |

## Hallazgos

### P1-01 — El CTA de presupuesto del onboarding llega a un estado ignorado

- **Pantalla:** Onboarding, paso “¿Quieres configurar tus finanzas?”.
- **Problema:** el CTA navega a `/finances?action=budget`, pero Finanzas únicamente interpreta `quick=expense` y `quick=income`.
- **Reproducción:** completar onboarding, elegir “Crear presupuesto” y llegar a Finanzas.
- **Impacto:** el usuario nuevo no entra al editor de presupuesto que el CTA promete; es un paso muerto en el flujo inicial.
- **Severidad:** P1.
- **Solución propuesta:** unificar la intención con `quick=budget`, interpretar el parámetro en Finanzas y abrir el editor del presupuesto una vez.
- **Estado:** RESUELTO. El onboarding usa una ruta tipada `quick=budget`; Finanzas la interpreta y abre el editor de presupuesto.

### P2-01 — El banner offline promete guardado diferido inexistente

- **Pantalla:** AppShell / modo offline.
- **Problema:** el texto actual afirma que “los cambios se guardarán cuando vuelvas a conectarte”, pero Nivo no implementa una cola offline.
- **Reproducción:** desconectar red y leer el banner.
- **Impacto:** expectativa incorrecta ante una operación que realmente fallará sin red.
- **Severidad:** P2.
- **Solución propuesta:** corregir el copy para indicar que se puede consultar contenido cargado, pero se necesita conexión para guardar cambios.
- **Estado:** RESUELTO. El banner ahora indica que se necesita recuperar conexión para guardar cambios.

### P2-02 — El Error Boundary no ofrece salida a inicio

- **Pantalla:** Error Boundary global.
- **Problema:** ante un error no controlado solo permite recargar la aplicación.
- **Reproducción:** forzar un error de render en una ruta protegida.
- **Impacto:** si la ruta concreta sigue fallando, la persona no tiene una alternativa de recuperación dentro de Nivo.
- **Severidad:** P2.
- **Solución propuesta:** incorporar “Volver al inicio” además de “Reintentar”, sin exponer errores técnicos.
- **Estado:** RESUELTO. El límite de errores ofrece reintento y una vuelta segura al inicio, sin detalles técnicos.

### P3-01 — Componentes visuales sin referencias activas tras Fase 8

- **Pantallas:** Planning, Payments, Finance, Gamification y Motion.
- **Problema:** `DailyScoreCard`, `GamificationOverview`, `ProgressCard`, `TherapyPaymentCard`, `UpcomingPaymentsCard`, `FinanceSummary` y `MotionReveal` no tienen referencias fuera de sus propios archivos.
- **Reproducción:** búsqueda estática de referencias en `src`.
- **Impacto:** deuda de mantenimiento y riesgo de confundir futuros cambios; no afecta el bundle mientras estén sin importar.
- **Severidad:** P3.
- **Solución propuesta:** eliminar solo los archivos confirmados sin referencias luego de completar los fixes funcionales.
- **Estado:** RESUELTO. Se eliminaron únicamente los siete archivos confirmados sin referencias externas.

### P3-02 — Dependencias con actualizaciones disponibles

- **Pantalla:** tooling / CI.
- **Problema:** `npm outdated` informa actualizaciones menores y majors disponibles.
- **Reproducción:** ejecutar `npm outdated`.
- **Impacto:** sin vulnerabilidades actuales; actualizar majors durante estabilización podría generar regresiones.
- **Severidad:** P3.
- **Solución propuesta:** no actualizar dependencias en Fase 9; reevaluar en una tarea aislada.
- **Estado:** ACEPTADO.

### P3-03 — Smoke test visual autenticado pendiente de dispositivo

- **Pantalla:** producción, PWA y layouts responsive.
- **Problema:** el runtime de automatización de navegador disponible se reinició antes de exponer una superficie utilizable para una sesión autenticada.
- **Reproducción:** inicializar la automatización del navegador en el entorno de trabajo.
- **Impacto:** la validación estática, tests y build están disponibles; queda pendiente una pasada manual con cuenta real en móvil/PWA.
- **Severidad:** P3.
- **Solución propuesta:** documentar el alcance y realizar smoke manual con sesión real antes de una apertura pública amplia.
- **Estado:** PENDIENTE.

## Privacy & Security

- **RLS:** las migrations revisadas habilitan RLS y políticas de propiedad por `auth.uid()` para perfiles, planificación, gamificación, finanzas, pagos y notificaciones. Los RPCs sensibles validan el actor autenticado.
- **Secrets:** no se encontraron claves reales versionadas. `.env.example` contiene marcadores seguros; `SUPABASE_SERVICE_ROLE_KEY` solo aparece en la función server-side de eliminación de cuenta y documentación.
- **IA:** el borrador de planificación envía únicamente el texto ingresado, fecha y zona horaria tras una acción explícita. El reporte se genera únicamente tras una acción explícita y no envía finanzas, pagos ni razones de no realización. Usa `store: false`.
- **Exportación y eliminación:** exportación consulta datos propios bajo RLS. La eliminación valida token, confirmación y usa service role exclusivamente en servidor para borrar al mismo usuario autenticado.
- **Aislamiento multiusuario:** las query keys incluyen `userId` y los servicios sensibles filtran por propietario; la protección final reside en RLS/RPCs revisados.

## Verificaciones realizadas

- Revisión de rutas protegidas, autenticación, onboarding, servicios críticos, query keys, PWA, CI, Vercel y migrations/RLS.
- `npm audit --omit=dev`: 0 vulnerabilidades.
- `npm outdated`: cambios documentados como P3; no se actualizarán en esta fase.
- CI ya ejecuta `npm ci`, typecheck, lint, tests y build.
- Vercel contiene rewrite SPA a `index.html`.
## Cierre de auditoría

- P0 abiertos: 0.
- P1 abiertos: 0.
- P2 abiertos: 0.
- Se añadió una prueba unitaria para las rutas rápidas de Finanzas, incluido `quick=budget`.
- Validación final ejecutada: `npm run lint`, `npm run typecheck`, `npm test -- --run` (24 archivos y 80 pruebas), `npm run build` y `git diff --check`.
- Permanece pendiente el smoke manual autenticado en móvil/PWA (P3-03), porque el runtime de automatización local no expuso un navegador utilizable. No impide el cierre técnico ni se presenta como verificado.

## Restricciones de Fase 9

- Sin migraciones ni cambios de RLS salvo aprobación explícita ante un bug que lo requiera.
- Sin funciones nuevas, integraciones ni cambios de reglas de XP.
