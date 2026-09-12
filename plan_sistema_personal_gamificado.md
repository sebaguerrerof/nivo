# Sistema Personal Gamificado — Plan Diario + Finanzas + Pagos

## 1. Objetivo general

Construir una aplicación web/mobile-first para organizar la vida diaria de forma simple, visual y gamificada.

La plataforma debe permitir que cada usuario pueda:

- Crear su planificación diaria.
- Marcar tareas y actividades como completadas.
- Ganar puntos, experiencia, rachas y logros.
- Visualizar gráficos de cumplimiento y progreso.
- Llevar control de ingresos y gastos.
- Crear presupuestos mensuales por categoría.
- Saber cuánto dinero puede gastar según sus compromisos.
- Registrar gastos recurrentes.
- Controlar pagos importantes, incluyendo terapia.
- Recibir alertas cuando un pago esté próximo, pendiente o vencido.
- Tener una cuenta privada individual.
- Permitir varios usuarios independientes dentro de la misma plataforma.
- Mantener la arquitectura preparada para funciones de grupo en el futuro.

La aplicación debe sentirse entretenida y motivante, pero no infantil.

---

# 2. Stack tecnológico

## Frontend

- Ionic
- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui cuando sea compatible
- Lucide Icons
- Framer Motion para microanimaciones
- Recharts para gráficos

## Backend

- Supabase
  - PostgreSQL
  - Authentication
  - Row Level Security
  - Storage
  - Edge Functions cuando sea necesario
  - Realtime solamente donde aporte valor

## Deploy

- Vercel

## Arquitectura

Aplicar:

- SOLID
- Clean Architecture simplificada
- separación de lógica y UI
- servicios reutilizables
- hooks personalizados
- componentes desacoplados
- design system centralizado

---

# 3. Nombre temporal

Nombre interno:

`LevelUp`

El nombre debe quedar desacoplado del código para poder cambiarlo posteriormente.

---

# 4. Principios de producto

La aplicación debe ser:

1. Simple.
2. Rápida.
3. Mobile-first.
4. Visual.
5. Motivante.
6. Privada.
7. Fácil de usar todos los días.
8. Con la menor fricción posible para registrar información.

Evitar pantallas sobrecargadas.

La pantalla principal debe permitir entender el estado del día en pocos segundos.

---

# 5. Tipos de usuario

## Usuario normal

Cada persona debe tener:

- su propia cuenta
- sus propios planes
- sus propias tareas
- sus propios gastos
- sus propios ingresos
- sus propios presupuestos
- sus propios pagos
- sus propias estadísticas
- sus propios logros

Los usuarios NO deben poder visualizar la información privada de otros usuarios.

Implementar Row Level Security desde el inicio.

## Futuro: grupos

Dejar preparada la arquitectura para incorporar posteriormente:

- grupos privados
- invitaciones
- objetivos compartidos
- desafíos grupales
- rankings opcionales
- estadísticas grupales anónimas
- acompañamiento entre compañeros

NO implementar esto dentro del MVP salvo que la estructura técnica lo requiera.

---

# 6. Autenticación

Implementar con Supabase Auth.

Métodos iniciales:

- email + contraseña
- magic link

Preparar arquitectura para agregar posteriormente:

- Google Login
- Apple Login

Datos iniciales del perfil:

- nombre
- apellido opcional
- avatar opcional
- moneda
- zona horaria
- fecha de creación
- configuración de notificaciones

Moneda por defecto:

`CLP`

Zona horaria por defecto:

`America/Santiago`

---

# 7. Onboarding

Al registrarse por primera vez mostrar onboarding corto.

## Paso 1

Nombre.

## Paso 2

Preguntar:

¿Qué quieres organizar?

Opciones:

- Rutina
- Trabajo
- Ejercicio
- Finanzas
- Lectura
- Terapia
- Hábitos
- Otro

Permitir seleccionar varios.

## Paso 3

Preguntar si desea configurar un presupuesto mensual.

## Paso 4

Preguntar si tiene pagos recurrentes.

Ejemplo:

- terapia
- arriendo
- gimnasio
- teléfono
- suscripciones
- créditos
- otros

## Paso 5

Crear automáticamente el dashboard inicial.

---

# 8. Dashboard principal

Ruta:

`/dashboard`

Debe ser la pantalla principal.

La idea es que el usuario pueda mirar la aplicación durante 5 segundos y saber:

- cómo va su día
- qué le falta
- cuánto dinero lleva gastado
- qué pagos vienen
- cómo va su racha

---

# 9. Header del dashboard

Mostrar:

- saludo
- nombre
- fecha
- nivel actual
- puntos / XP
- racha actual

Ejemplo:

> Buen día, Seba  
> Jueves 10 de septiembre  
> Nivel 7 · 1.240 XP  
> 🔥 12 días de racha

No abusar de emojis.

---

# 10. Score diario

Crear un indicador principal:

`Daily Score`

Escala:

`0 - 100`

Ejemplo:

`82 / 100`

Debe calcularse dinámicamente.

Propuesta inicial:

- tareas completadas: 50%
- hábitos: 20%
- actividad física: 10%
- planificación completada: 10%
- control financiero: 10%

Los pesos deben quedar configurables posteriormente.

Mostrar:

- score actual
- porcentaje
- comparación con promedio semanal

---

# 11. Planificación diaria

Ruta:

`/plan`

Cada usuario debe poder crear su día.

Campos:

- fecha
- hora de despertar
- objetivos principales
- actividades con horarios
- actividad física
- responsabilidades
- tiempo personal
- tiempo familiar
- riesgo/dificultad del día
- estrategia para enfrentar el riesgo
- compromiso del día
- notas

La aplicación NO debe obligar a llenar todos los campos.

---

# 12. Actividades

Cada actividad debe incluir:

- título
- descripción opcional
- categoría
- hora inicio
- hora término
- prioridad
- estado
- puntos
- recurrente
- recordatorio opcional

Estados:

- pendiente
- completada
- parcialmente completada
- omitida
- reprogramada

Categorías iniciales:

- Personal
- Trabajo
- Deporte
- Lectura
- Familia
- Finanzas
- Terapia
- Salud
- Otro

---

# 13. Vista timeline

Crear una visualización del día tipo timeline.

Ejemplo:

07:30 — Levantarse  
07:40 — Lectura  
08:00 — Desayuno  
09:00 — Trabajo  
11:30 — Gym  
14:00 — Almuerzo  
18:10 — Salida terapia  
19:00 — Terapia  
21:30 — Fin terapia

Cada elemento se puede marcar desde la misma pantalla.

---

# 14. Check-in

Al marcar una actividad como completada:

- animación corta
- sumar XP
- actualizar score
- actualizar progreso diario

No usar animaciones excesivas.

Ejemplo:

`+20 XP`

---

# 15. Planificación recurrente

Permitir crear rutinas recurrentes.

Opciones:

- diariamente
- días específicos
- semanalmente
- mensualmente
- personalizado

Ejemplos:

- gimnasio lunes, miércoles y viernes
- terapia lunes, miércoles y viernes
- leer todos los días
- revisar finanzas domingo
- pagar terapia una vez al mes

---

# 16. Gamificación

La gamificación debe motivar constancia, no competitividad excesiva.

## XP

Cada acción entrega experiencia.

Ejemplo inicial:

| Acción | XP |
|---|---:|
| Completar tarea normal | 10 |
| Completar prioridad alta | 20 |
| Completar todos los objetivos diarios | 30 |
| Registrar gastos del día | 5 |
| Completar rutina deportiva | 20 |
| Completar planificación diaria | 15 |
| Hacer cierre del día | 15 |

Valores configurables.

---

# 17. Niveles

Crear sistema progresivo de niveles.

Ejemplo:

- Nivel 1: 0 XP
- Nivel 2: 100 XP
- Nivel 3: 250 XP
- Nivel 4: 450 XP
- Nivel 5: 700 XP

No guardar únicamente el nivel.

Guardar XP total y calcular nivel mediante función centralizada.

---

# 18. Rachas

Crear streaks.

Tipos:

- días con planificación
- días con Daily Score >= 70
- actividad física
- lectura
- registro financiero

Mostrar:

- racha actual
- mejor racha
- calendario visual

No castigar exageradamente cuando se pierde una racha.

Registrar historial.

---

# 19. Logros

Ejemplos:

### Primer paso
Completar el primer día.

### Semana completa
Planificar siete días.

### Constancia
Mantener siete días con score >= 70.

### Disciplina
Completar 50 actividades.

### Mes ordenado
Registrar gastos durante 30 días.

### Finanzas bajo control
Mantenerse dentro del presupuesto mensual.

### Todo al día
No tener pagos vencidos.

Los achievements deben definirse en tabla/configuración y no hardcodearse completamente.

---

# 20. Dashboard de progreso

Ruta:

`/progress`

Mostrar gráficos:

## Cumplimiento diario

Gráfico últimos:

- 7 días
- 30 días
- 90 días

## Score promedio

## Tareas completadas

## Hábitos

## Actividad física

## Rachas

## XP obtenido

## Categorías

Ejemplo:

- Deporte: 92%
- Trabajo: 80%
- Lectura: 65%
- Finanzas: 95%

---

# 21. Heatmap

Crear calendario tipo GitHub.

Cada día debe tener intensidad basada en el Daily Score.

Debe permitir visualizar rápidamente la constancia mensual/anual.

---

# 22. Cierre del día

Agregar función:

`Cerrar día`

Preguntas rápidas:

- ¿Cómo estuvo tu día?
- ¿Qué salió bien?
- ¿Qué podrías mejorar?
- ¿Completaste tus objetivos?
- ¿Cómo estuvo tu ánimo?

Opcional:

Escala de ánimo:

`1 - 10`

Guardar historial para gráficos personales.

No hacer diagnósticos.

No dar recomendaciones clínicas automáticas.

---

# 23. Finanzas

Ruta:

`/finances`

Debe funcionar como un gestor financiero personal simple.

No intentar convertirse inicialmente en un sistema contable.

---

# 24. Dashboard financiero

Mostrar:

- saldo disponible
- ingresos del mes
- gastos del mes
- presupuesto mensual
- dinero restante
- próximos pagos
- gastos por categoría

Ejemplo:

Ingresos  
$1.200.000

Gastado  
$650.000

Disponible  
$550.000

Presupuesto utilizado  
54%

---

# 25. Ingresos

Tabla:

`financial_transactions`

Tipos:

- income
- expense

Campos principales:

- id
- user_id
- type
- amount
- category_id
- description
- transaction_date
- payment_method
- notes
- recurring_transaction_id
- created_at
- updated_at

---

# 26. Categorías financieras

Crear categorías configurables.

Iniciales:

## Gastos

- Alimentación
- Transporte
- Salud
- Terapia
- Deporte
- Vivienda
- Tecnología
- Entretenimiento
- Suscripciones
- Compras
- Educación
- Otros

## Ingresos

- Sueldo
- Clases
- Freelance
- Empresa
- Venta
- Otro

Cada usuario puede crear nuevas categorías.

---

# 27. Registro rápido de gasto

Agregar botón flotante:

`+ Gasto`

El flujo debe ser extremadamente rápido.

Campos:

- monto
- categoría
- descripción
- fecha

Opcionales:

- método de pago
- notas

Objetivo:

Registrar un gasto en menos de 10 segundos.

---

# 28. Presupuesto mensual

Cada usuario puede definir:

`monthly_budget`

Ejemplo:

$700.000

La aplicación calcula:

- presupuesto
- gastado
- restante
- porcentaje usado
- gasto diario recomendado

---

# 29. Presupuesto por categorías

Ejemplo:

| Categoría | Presupuesto |
|---|---:|
| Alimentación | $200.000 |
| Transporte | $100.000 |
| Deporte | $80.000 |
| Entretenimiento | $70.000 |
| Terapia | $150.000 |
| Otros | $100.000 |

Mostrar barra de progreso.

---

# 30. Dinero disponible real

Implementar cálculo:

`dinero disponible = ingresos - gastos - compromisos pendientes`

Separar:

- saldo actual
- dinero comprometido
- dinero realmente disponible

Esto es importante para evitar creer que existe dinero libre cuando hay pagos próximos.

---

# 31. Safe to spend

Crear indicador:

`Disponible para gastar`

Debe calcular cuánto puede gastar el usuario hasta fin de mes.

Propuesta:

```text
safe_to_spend =
ingresos_disponibles
- gastos_realizados
- pagos_pendientes
- ahorro_objetivo
```

Luego:

```text
safe_to_spend_per_day =
safe_to_spend / días_restantes_mes
```

Mostrar:

> Puedes gastar aproximadamente $18.500 al día y mantener tu planificación financiera.

Esto es orientativo.

---

# 32. Pagos recurrentes

Ruta:

`/payments`

Crear sistema de obligaciones financieras.

Ejemplos:

- terapia
- arriendo
- teléfono
- gimnasio
- Netflix
- seguros
- créditos

Campos:

- nombre
- monto
- categoría
- frecuencia
- día de pago
- fecha próxima
- automático/manual
- estado
- recordatorios
- notas

---

# 33. Pago de terapia

Este módulo es requisito prioritario.

El usuario debe poder configurar:

### Nombre

Terapia

### Frecuencia

Opciones:

- semanal
- quincenal
- mensual
- personalizada

### Día de cobro

Ejemplo:

`5 de cada mes`

### Monto

Configurable.

### Estados

- próximo
- pendiente
- pagado
- vencido

---

# 34. Tarjeta de terapia en dashboard

Mostrar una tarjeta especial cuando exista una obligación de terapia activa.

Ejemplo:

### Terapia

Próximo pago  
5 de octubre

Monto  
$XXX.XXX

Estado  
✅ Pagado

O:

### Terapia

Pago pendiente  
10 de septiembre

Monto  
$XXX.XXX

Estado  
⚠️ Pendiente

---

# 35. Confirmación de pago

El usuario podrá pulsar:

`Marcar como pagado`

Guardar:

- fecha real de pago
- monto pagado
- método de pago
- comprobante opcional
- nota opcional

Al marcarlo como pagado:

1. cambiar estado
2. generar siguiente fecha
3. registrar gasto financiero automáticamente
4. actualizar presupuesto
5. actualizar dashboard

Evitar registrar gasto duplicado.

---

# 36. Recordatorios de pago

Estados visuales:

## Verde

Pagado.

## Amarillo

Próximo dentro de 5 días.

## Naranja

Vence hoy.

## Rojo

Vencido.

Permitir configuración de recordatorios:

- 7 días antes
- 3 días antes
- 1 día antes
- día del vencimiento

---

# 37. Gastos recurrentes

Separar:

- obligación
- transacción

Una obligación genera una ocurrencia.

La ocurrencia puede posteriormente convertirse en transacción al pagarse.

Nunca crear múltiples gastos repetidos por error.

---

# 38. Calendario

Ruta:

`/calendar`

Mostrar en una sola vista:

- tareas
- entrenamientos
- terapia
- pagos
- fechas importantes

Filtros:

- actividades
- finanzas
- pagos
- terapia

---

# 39. Vista semanal

Mostrar:

Lunes → Domingo.

Cada día:

- score
- número de actividades
- porcentaje completado
- gastos
- icono si existe pago

---

# 40. Notificaciones

Primera versión:

- notificaciones dentro de la aplicación

Después:

- push notifications
- email
- calendario externo

Eventos:

- actividad próxima
- día sin planificación
- cierre del día
- pago próximo
- pago vencido
- presupuesto cerca del límite
- logro desbloqueado

Evitar spam.

---

# 41. Base de datos

Crear las siguientes tablas.

---

## profiles

```text
id uuid PK
user_id uuid FK auth.users UNIQUE
first_name text
last_name text nullable
avatar_url text nullable
currency text default CLP
timezone text default America/Santiago
created_at timestamptz
updated_at timestamptz
```

---

## daily_plans

```text
id uuid PK
user_id uuid FK
date date
wake_up_time time nullable
main_risk text nullable
risk_strategy text nullable
daily_commitment text nullable
notes text nullable
daily_score integer
mood_score integer nullable
closed_at timestamptz nullable
created_at timestamptz
updated_at timestamptz
```

Unique:

```text
(user_id, date)
```

---

## daily_goals

```text
id uuid PK
daily_plan_id uuid FK
user_id uuid FK
title text
position integer
completed boolean
completed_at timestamptz nullable
created_at timestamptz
```

---

## activities

```text
id uuid PK
user_id uuid FK
daily_plan_id uuid FK nullable
title text
description text nullable
category text
start_at timestamptz nullable
end_at timestamptz nullable
priority text
status text
xp_reward integer
recurrence_rule text nullable
created_at timestamptz
updated_at timestamptz
```

---

## habits

```text
id uuid PK
user_id uuid FK
name text
category text
xp_reward integer
active boolean
created_at timestamptz
```

---

## habit_logs

```text
id uuid PK
habit_id uuid FK
user_id uuid FK
date date
completed boolean
created_at timestamptz
```

Unique:

```text
(habit_id, date)
```

---

## xp_events

```text
id uuid PK
user_id uuid FK
event_type text
source_type text
source_id uuid nullable
xp integer
description text
created_at timestamptz
```

---

## achievements

```text
id uuid PK
code text UNIQUE
name text
description text
icon text nullable
condition_type text
condition_value jsonb
xp_bonus integer
active boolean
```

---

## user_achievements

```text
id uuid PK
user_id uuid FK
achievement_id uuid FK
unlocked_at timestamptz
```

Unique:

```text
(user_id, achievement_id)
```

---

## financial_categories

```text
id uuid PK
user_id uuid nullable
name text
type text
icon text nullable
is_system boolean
created_at timestamptz
```

---

## financial_transactions

```text
id uuid PK
user_id uuid FK
type text
amount numeric
category_id uuid FK nullable
description text
transaction_date date
payment_method text nullable
notes text nullable
recurring_payment_occurrence_id uuid nullable
created_at timestamptz
updated_at timestamptz
```

---

## monthly_budgets

```text
id uuid PK
user_id uuid FK
year integer
month integer
amount numeric
savings_target numeric default 0
created_at timestamptz
updated_at timestamptz
```

Unique:

```text
(user_id, year, month)
```

---

## category_budgets

```text
id uuid PK
user_id uuid FK
monthly_budget_id uuid FK
category_id uuid FK
amount numeric
created_at timestamptz
updated_at timestamptz
```

---

## recurring_payments

```text
id uuid PK
user_id uuid FK
name text
category_id uuid FK nullable
amount numeric
frequency text
billing_day integer nullable
start_date date
next_due_date date
reminder_days jsonb
auto_create_transaction boolean default false
active boolean
notes text nullable
created_at timestamptz
updated_at timestamptz
```

---

## payment_occurrences

```text
id uuid PK
user_id uuid FK
recurring_payment_id uuid FK
due_date date
amount numeric
status text
paid_at timestamptz nullable
payment_method text nullable
transaction_id uuid nullable
receipt_url text nullable
notes text nullable
created_at timestamptz
updated_at timestamptz
```

Estados:

```text
upcoming
pending
paid
overdue
skipped
```

---

## daily_reflections

```text
id uuid PK
user_id uuid FK
daily_plan_id uuid FK
what_went_well text nullable
what_to_improve text nullable
mood_score integer nullable
notes text nullable
created_at timestamptz
```

---

# 42. Row Level Security

OBLIGATORIO.

Cada tabla privada debe validar:

```sql
auth.uid() = user_id
```

Nunca confiar solamente en filtros de frontend.

Crear policies:

- SELECT own
- INSERT own
- UPDATE own
- DELETE own

Las tablas globales como achievements pueden ser lectura pública autenticada.

---

# 43. Servicios frontend

Crear:

```text
src/
  components/
  features/
  hooks/
  lib/
  pages/
  services/
  stores/
  types/
  utils/
```

Features:

```text
features/
  auth/
  dashboard/
  planning/
  activities/
  habits/
  gamification/
  finances/
  budgets/
  payments/
  progress/
  calendar/
  profile/
```

---

# 44. Servicios

Ejemplo:

```text
services/
  auth.service.ts
  planning.service.ts
  activity.service.ts
  habits.service.ts
  gamification.service.ts
  finance.service.ts
  budget.service.ts
  payment.service.ts
  analytics.service.ts
```

No ejecutar consultas Supabase directamente dentro de componentes visuales.

---

# 45. Estado global

Usar estado global solamente donde sea necesario.

Recomendación:

- Zustand

Para server state considerar:

- TanStack Query

No almacenar toda la aplicación en un único store global.

---

# 46. Design system

Crear tokens centrales:

- spacing
- radius
- typography
- shadows
- transitions

Diseño:

- moderno
- limpio
- tarjetas simples
- alto contraste
- responsive
- dark mode
- light mode

No usar demasiados colores.

Estados deben tener jerarquía clara.

---

# 47. Navegación móvil

Bottom navigation:

1. Hoy
2. Plan
3. +
4. Finanzas
5. Progreso

El botón central `+` abre quick actions:

- agregar actividad
- agregar gasto
- agregar ingreso
- agregar pago

---

# 48. Navegación escritorio

Sidebar:

- Dashboard
- Mi día
- Calendario
- Hábitos
- Progreso
- Finanzas
- Pagos
- Configuración

---

# 49. Responsive

La plataforma debe funcionar correctamente en:

- móvil
- tablet
- desktop

Prioridad:

móvil.

Pensar inicialmente como una PWA.

---

# 50. PWA

Agregar:

- manifest
- iconos
- installable
- splash
- offline shell básico

Posteriormente evaluar Capacitor para aplicaciones nativas.

---

# 51. Analytics internos

Crear métricas personales:

- días planificados
- días completados
- score promedio
- tasa de cumplimiento
- gastos registrados
- presupuesto usado
- pagos vencidos
- racha
- XP mensual

Nunca mostrar información de otro usuario sin autorización.

---

# 52. Gráficos

Usar Recharts.

Gráficos iniciales:

### Línea

Daily Score últimos 30 días.

### Barras

Actividades completadas por categoría.

### Dona

Gastos por categoría.

### Barras

Presupuesto vs gasto.

### Línea

Gastos acumulados durante el mes.

---

# 53. Insights automáticos

Primera etapa:

reglas simples.

Ejemplos:

> Completaste 83% de tus actividades esta semana.

> Tu mejor día suele ser el martes.

> Gastaste 18% más en alimentación que el mes pasado.

> Si mantienes este ritmo superarás tu presupuesto en $72.000.

No utilizar IA para cálculos que pueden resolverse de manera determinística.

---

# 54. IA — fase posterior

Agregar un asistente dentro de la aplicación.

Funciones:

- ayudar a organizar el día
- transformar texto en planificación
- reorganizar actividades
- resumir semana
- analizar hábitos
- explicar gastos
- generar sugerencias de presupuesto

Ejemplo:

Usuario:

```text
Mañana me levanto a las 7:30, quiero leer, trabajar, ir al gym a las 11:30, almorzar a las 14 y salir a terapia a las 18:10.
```

IA:

genera actividades estructuradas.

La IA propone.

El usuario confirma.

Nunca debe modificar silenciosamente datos financieros ni borrar información.

---

# 55. Chat / entrada natural

Agregar posteriormente una caja tipo:

`Planifica con IA`

Ejemplo:

> Mañana quiero levantarme a las 7:30, trabajar en la mañana, gym 11:30 y terapia en la tarde.

Transformar en JSON estructurado.

Schema esperado:

```json
{
  "date": "YYYY-MM-DD",
  "activities": [
    {
      "title": "",
      "start_time": "",
      "end_time": "",
      "category": ""
    }
  ]
}
```

Validar antes de insertar.

---

# 56. Seguridad en información sensible

La aplicación puede contener información personal.

Implementar:

- RLS
- validación backend
- HTTPS
- evitar secrets en frontend
- variables de entorno
- logs sin información sensible
- eliminación de cuenta
- exportación de datos

No registrar notas personales completas en herramientas externas de analytics.

---

# 57. Privacidad entre compañeros

Aunque la plataforma pueda utilizarse entre compañeros de grupo:

NO mostrar por defecto:

- finanzas
- notas personales
- reflexiones
- información de terapia
- gastos
- ingresos
- datos privados

En una futura función social, cada dato debe ser explícitamente compartido.

---

# 58. Reglas de pagos

Crear lógica centralizada.

Funciones:

```text
calculateNextDueDate()
getPaymentStatus()
markPaymentAsPaid()
createPaymentOccurrence()
createTransactionFromPayment()
```

No replicar esta lógica en diferentes componentes.

---

# 59. Estados automáticos

Ejemplo:

```text
if paid_at != null
  status = paid

else if today > due_date
  status = overdue

else if today == due_date
  status = pending

else
  status = upcoming
```

---

# 60. Pagos mensuales

Considerar meses con distinta cantidad de días.

Si billing_day es:

`31`

y el mes no tiene 31:

usar último día disponible del mes.

Implementar helper centralizado.

---

# 61. Registro de auditoría

Para operaciones importantes considerar:

`audit_events`

Ejemplo:

```text
id
user_id
event
entity_type
entity_id
metadata
created_at
```

Eventos:

- payment_marked_paid
- transaction_deleted
- budget_changed

No guardar información innecesariamente sensible.

---

# 62. UX importante

Acciones comunes deben tomar pocos taps.

## Completar actividad

1 tap.

## Registrar gasto

máximo 3-4 pasos.

## Marcar terapia pagada

1-2 taps.

## Ver progreso

1 tap.

---

# 63. Empty states

Crear estados vacíos bien diseñados.

Ejemplo:

> Todavía no tienes un plan para hoy.

Botón:

`Crear mi día`

---

# 64. Error states

Nunca mostrar errores técnicos crudos.

Ejemplo:

Incorrecto:

```text
PostgrestException...
```

Correcto:

> No pudimos guardar el gasto. Intenta nuevamente.

Registrar detalles técnicos solamente en logs internos.

---

# 65. Loading states

Utilizar:

- skeletons
- optimistic updates cuando sea seguro
- loaders cortos

Al marcar una actividad:

usar optimistic UI.

---

# 66. Componentes principales

Crear:

```text
DailyScoreCard
DailyTimeline
ActivityCard
GoalCard
StreakCard
XPProgress
AchievementCard
FinanceSummary
BudgetProgress
ExpenseCategoryChart
UpcomingPayments
TherapyPaymentCard
QuickExpenseModal
QuickActionButton
WeeklyProgressChart
MonthlyHeatmap
```

---

# 67. Dashboard móvil sugerido

Orden:

1. Header
2. Daily Score
3. Objetivos
4. Timeline
5. Próximos pagos
6. Finanzas
7. Racha
8. Progreso semanal

---

# 68. TherapyPaymentCard

Este componente debe detectar automáticamente si existe una obligación financiera categorizada como terapia.

Mostrar:

- nombre
- monto
- próxima fecha
- estado
- botón pagar
- historial

Botones:

- Marcar pagado
- Ver historial

---

# 69. Historial de terapia

Mostrar:

| Fecha | Monto | Estado |
|---|---:|---|
| 10 Ago | $X | Pagado |
| 10 Sep | $X | Pendiente |
| 10 Oct | $X | Próximo |

Esto permite saber rápidamente si el pago del mes está realizado.

---

# 70. Home inteligente

Si existe algo urgente mostrarlo arriba.

Prioridad:

1. pago vencido
2. pago hoy
3. actividad atrasada
4. actividad próxima
5. presupuesto crítico
6. contenido normal

---

# 71. Modo foco

Agregar posteriormente:

`Modo foco`

Seleccionar una actividad.

Mostrar:

- actividad
- duración
- temporizador
- botón completar
- minimizar distracciones

---

# 72. Sistema de prioridades

Prioridades:

- baja
- normal
- alta

No usar más niveles inicialmente.

---

# 73. Tareas atrasadas

Al terminar el día preguntar:

> Tienes 2 actividades pendientes.

Opciones:

- mover a mañana
- marcar omitida
- eliminar

No mover automáticamente tareas sin confirmación.

---

# 74. Cálculo Daily Score

Crear servicio:

```text
daily-score.service.ts
```

Nunca calcularlo directamente en componentes.

Ejemplo inicial:

```text
taskCompletion = completedTasks / totalTasks
goalCompletion = completedGoals / totalGoals
habitCompletion = completedHabits / totalHabits

score =
taskCompletion * 50 +
goalCompletion * 25 +
habitCompletion * 15 +
dailyCloseCompleted * 10
```

Si una categoría no existe ese día, redistribuir pesos para evitar penalización.

---

# 75. Gamification service

Crear:

```text
gamification.service.ts
```

Funciones:

```text
awardXP()
removeXP()
calculateLevel()
calculateStreak()
checkAchievements()
```

XP debe generarse desde eventos idempotentes.

Evitar duplicados si el usuario marca/desmarca repetidamente.

---

# 76. Idempotencia

Muy importante.

Ejemplo:

Una actividad completada puede entregar XP una sola vez.

Crear referencia:

```text
source_type = activity
source_id = activity_id
event_type = activity_completed
```

Agregar constraint lógico o índice único.

---

# 77. Índices SQL

Agregar índices para:

```text
activities(user_id, start_at)
daily_plans(user_id, date)
financial_transactions(user_id, transaction_date)
payment_occurrences(user_id, due_date)
habit_logs(user_id, date)
xp_events(user_id, created_at)
```

---

# 78. Supabase migrations

No crear tablas manualmente solamente desde dashboard.

Mantener migrations versionadas.

Carpeta:

```text
supabase/
  migrations/
  seed.sql
```

---

# 79. Seed

Crear seed de:

- categorías financieras
- achievements
- configuración base XP

Evitar insertar datos específicos de usuarios.

---

# 80. Tests

Agregar como mínimo:

## Unit tests

- cálculo Daily Score
- cálculo niveles
- cálculo rachas
- presupuesto
- safe to spend
- próxima fecha de pago
- estado de pago

## Integration

- marcar pago pagado
- generar transacción
- XP idempotente

---

# 81. Validaciones

Usar:

- Zod

Schemas:

```text
activitySchema
dailyPlanSchema
transactionSchema
monthlyBudgetSchema
recurringPaymentSchema
paymentOccurrenceSchema
```

---

# 82. Formato monetario

Usar:

```ts
Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP"
})
```

No construir formato CLP manualmente.

---

# 83. Fechas

Usar:

- date-fns

Zona horaria:

`America/Santiago`

Tener especial cuidado con fechas de pagos.

No guardar solamente strings de fecha sin definir intención.

---

# 84. MVP

El MVP debe incluir:

### Auth
- registro
- login
- recuperación

### Planificación
- crear plan
- actividades
- objetivos
- completar actividades

### Gamificación
- XP
- niveles
- Daily Score
- rachas

### Progreso
- gráficos básicos
- últimos 7/30 días

### Finanzas
- ingresos
- gastos
- categorías
- presupuesto mensual

### Pagos
- recurrentes
- terapia
- próximo pago
- marcar pagado
- vencimientos

### Perfil
- preferencias
- moneda
- zona horaria

---

# 85. NO incluir inicialmente

No desarrollar en MVP:

- red social
- chat entre usuarios
- transferencias bancarias
- conexión directa con bancos
- inversiones
- contabilidad
- administración clínica
- información médica
- diagnóstico
- rankings públicos
- marketplace
- sistema de pagos online

Esto evita ampliar innecesariamente el alcance.

---

# 86. Roadmap

## Fase 1 — Fundación

- inicializar proyecto
- configurar stack
- Supabase
- auth
- RLS
- layout
- design system
- navegación

## Fase 2 — Plan diario

- daily_plans
- goals
- activities
- timeline
- marcar completado

## Fase 3 — Gamificación

- XP
- niveles
- Daily Score
- streak
- achievements

## Fase 4 — Progreso

- analytics
- gráficos
- heatmap
- estadísticas

## Fase 5 — Finanzas

- ingresos
- gastos
- categorías
- presupuesto
- dashboard financiero

## Fase 6 — Pagos

- recurring payments
- payment occurrences
- terapia
- recordatorios
- pagos vencidos

## Fase 7 — Refinamiento

- PWA
- responsive
- accesibilidad
- performance
- QA
- tests

## Fase 8 — IA

- planificación mediante lenguaje natural
- análisis semanal
- organización inteligente

---

# 87. Orden recomendado para Codex

Codex NO debe intentar construir toda la aplicación simultáneamente.

Trabajar por etapas.

---

## Prompt etapa 1

```text
Lee completamente este documento antes de programar.

Implementa solamente la Fase 1.

Antes de escribir código:
1. revisa la estructura actual del repositorio;
2. crea un plan técnico;
3. identifica qué paquetes ya existen;
4. evita duplicar dependencias;
5. respeta TypeScript estricto;
6. mantén SOLID y componentes desacoplados;
7. configura Supabase con variables de entorno;
8. implementa autenticación y RLS correctamente;
9. deja el proyecto ejecutando sin errores;
10. documenta los cambios al finalizar.

No avances a la Fase 2 hasta que la Fase 1 esté funcionando correctamente.
```

---

# 88. Prompt etapa 2

```text
Implementa la Fase 2 del documento.

Primero revisa lo que ya existe.

No rompas funcionalidades anteriores.

Implementa:
- daily plans
- goals
- activities
- timeline
- crear/editar/eliminar
- completar actividad
- estados
- validación Zod
- servicios desacoplados
- tests básicos

Verifica RLS y aislamiento entre usuarios.

Finaliza dejando build, lint y tests funcionando.
```

---

# 89. Prompt etapa 3

```text
Implementa la gamificación definida en la Fase 3.

Prioridades:
- XP
- eventos idempotentes
- niveles
- Daily Score
- streaks
- achievements

La lógica debe estar fuera de componentes React.

Agregar unit tests.

No permitir duplicación de XP.
```

---

# 90. Prompt etapa 4

```text
Implementa progreso y estadísticas.

Usar Recharts.

Crear:
- score 7/30 días
- cumplimiento
- distribución por categoría
- rachas
- XP
- heatmap mensual

Optimizar queries y evitar descargar datos innecesarios.
```

---

# 91. Prompt etapa 5

```text
Implementa el módulo financiero.

Agregar:
- ingresos
- gastos
- categorías
- presupuesto mensual
- presupuesto por categoría
- dashboard
- safe to spend
- gráficos

Toda la información debe quedar aislada por user_id mediante RLS.

Agregar tests para cálculos financieros.
```

---

# 92. Prompt etapa 6

```text
Implementa el sistema de pagos recurrentes.

Prioridad especial:
Terapia.

Agregar:
- recurring_payments
- payment_occurrences
- estados
- próxima fecha
- vencidos
- marcar como pagado
- historial
- TherapyPaymentCard

Cuando un pago se marque como pagado:
- generar transacción financiera
- evitar duplicados
- calcular siguiente vencimiento
- actualizar dashboard

Agregar tests de fechas e idempotencia.
```

---

# 93. Criterios de aceptación MVP

El MVP estará listo cuando un nuevo usuario pueda:

1. registrarse;
2. iniciar sesión;
3. crear su plan para hoy;
4. crear actividades;
5. marcarlas como completadas;
6. recibir XP;
7. ver su nivel;
8. ver su Daily Score;
9. mantener una racha;
10. revisar gráficos;
11. registrar un ingreso;
12. registrar un gasto;
13. establecer un presupuesto;
14. ver cuánto dinero le queda;
15. crear un pago recurrente de terapia;
16. ver cuándo debe pagarlo;
17. marcarlo como pagado;
18. verlo reflejado automáticamente como gasto;
19. consultar historial;
20. cerrar sesión;
21. entrar con otro usuario sin ver ningún dato del usuario anterior.

---

# 94. Consideraciones futuras

Preparar arquitectura para posteriormente agregar:

- Google Calendar
- calendar sync
- Open Banking
- importación de cartola bancaria
- lectura automática de gastos
- reconocimiento de comprobantes
- IA financiera
- planificación semanal con IA
- desafíos grupales
- compartir objetivos
- sistema de accountability
- notificaciones push
- Capacitor
- app Android
- app iOS

---

# 95. Posible integración con calendario

En una fase posterior cada actividad podrá sincronizarse con:

- Google Calendar
- Apple Calendar
- Outlook

La base debe contener identificadores externos opcionales.

Ejemplo futuro:

```text
external_calendar_provider
external_calendar_event_id
```

No implementar todavía en el MVP.

---

# 96. Principio final

La aplicación debe ayudar al usuario a responder tres preguntas todos los días:

### 1.

¿Qué tengo que hacer hoy?

### 2.

¿Cómo voy con mis objetivos?

### 3.

¿Cómo voy con mi plata?

Y una cuarta pregunta cuando corresponda:

### 4.

¿Qué tengo que pagar y ya lo pagué?

Todo el diseño y la arquitectura deben mantenerse alineados con estas cuatro preguntas.
