import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const requestSchema = z.object({
  planId: z.string().uuid(),
  feelings: z.string().trim().min(3).max(2_000),
  todaySummary: z.string().trim().min(3).max(3_000),
  tomorrowDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tomorrowPrompt: z.string().trim().min(10).max(8_000),
  timezone: z.string().trim().min(1).max(100),
})

const planSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    wakeUpTime: { type: ['string', 'null'], pattern: '^([01]\\d|2[0-3]):[0-5]\\d$' },
    recoveryActivity: { type: ['string', 'null'] },
    responsibilities: { type: ['string', 'null'] },
    familyConnection: { type: ['string', 'null'] },
    mainRisk: { type: ['string', 'null'] },
    riskStrategy: { type: ['string', 'null'] },
    dailyCommitment: { type: ['string', 'null'] },
    notes: { type: ['string', 'null'] },
    goals: { type: 'array', maxItems: 3, items: { type: 'string' } },
    activities: {
      type: 'array',
      maxItems: 30,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          title: { type: 'string' },
          description: { type: ['string', 'null'] },
          category: { type: 'string', enum: ['personal', 'work', 'sport', 'reading', 'family', 'finances', 'therapy', 'health', 'other'] },
          startTime: { type: ['string', 'null'], pattern: '^([01]\\d|2[0-3]):[0-5]\\d$' },
          endTime: { type: ['string', 'null'], pattern: '^([01]\\d|2[0-3]):[0-5]\\d$' },
          priority: { type: 'string', enum: ['low', 'normal', 'high'] },
        },
        required: ['title', 'description', 'category', 'startTime', 'endTime', 'priority'],
      },
    },
  },
  required: ['wakeUpTime', 'recoveryActivity', 'responsibilities', 'familyConnection', 'mainRisk', 'riskStrategy', 'dailyCommitment', 'notes', 'goals', 'activities'],
} as const

const outputSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    groupReport: { type: 'string' },
    plan: planSchema,
  },
  required: ['groupReport', 'plan'],
} as const

function jsonResponse(body: { error: string } | { result: unknown }, status = 200) {
  return Response.json(body, { status })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function getOutputText(payload: unknown): string | null {
  if (!isRecord(payload)) return null
  if (typeof payload.output_text === 'string') return payload.output_text
  if (!Array.isArray(payload.output)) return null

  for (const item of payload.output) {
    if (!isRecord(item) || !Array.isArray(item.content)) continue
    for (const content of item.content) {
      if (isRecord(content) && content.type === 'output_text' && typeof content.text === 'string') return content.text
    }
  }

  return null
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Método no permitido.' }), { status: 405, headers: { Allow: 'POST', 'Content-Type': 'application/json' } })

    const body: unknown = await request.json().catch(() => null)
    const values = requestSchema.safeParse(body)
    if (!values.success) return jsonResponse({ error: 'Revisa la reflexión y la planificación de mañana antes de generar el reporte.' }, 400)

    const accessToken = request.headers.get('Authorization')?.replace(/^Bearer\s+/, '').trim()
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
    const apiKey = process.env.OPENAI_API_KEY
    if (!accessToken || !supabaseUrl || !supabaseAnonKey) return jsonResponse({ error: 'Tu sesión no es válida. Inicia sesión nuevamente.' }, 401)
    if (!apiKey) return jsonResponse({ error: 'La generación asistida aún no está configurada. Agrega OPENAI_API_KEY en Vercel.' }, 503)

    const authClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { autoRefreshToken: false, persistSession: false } })
    const { data: userData, error: userError } = await authClient.auth.getUser(accessToken)
    if (userError || !userData.user) return jsonResponse({ error: 'Tu sesión no es válida. Inicia sesión nuevamente.' }, 401)

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    })

    const [planResult, goalsResult, activitiesResult, reflectionResult] = await Promise.all([
      userClient.from('daily_plans').select('date, wake_up_time, recovery_activity, responsibilities, family_connection, main_risk, risk_strategy, daily_commitment, notes, daily_score, closed_at').eq('id', values.data.planId).maybeSingle(),
      userClient.from('daily_goals').select('title, completed, position').eq('daily_plan_id', values.data.planId).order('position'),
      userClient.from('activities').select('title, description, category, start_at, end_at, priority, status').eq('daily_plan_id', values.data.planId).order('start_at', { ascending: true, nullsFirst: false }),
      userClient.from('daily_reflections').select('what_went_well, what_to_improve, mood_score').eq('daily_plan_id', values.data.planId).maybeSingle(),
    ])

    if (planResult.error || goalsResult.error || activitiesResult.error || reflectionResult.error || !planResult.data) {
      return jsonResponse({ error: 'No pudimos leer este día para preparar el reporte.' }, 404)
    }

    const currentDay = {
      plan: planResult.data,
      goals: goalsResult.data ?? [],
      activities: activitiesResult.data ?? [],
      reflection: reflectionResult.data,
      personalInput: {
        feelings: values.data.feelings,
        todaySummary: values.data.todaySummary,
        tomorrowPrompt: values.data.tomorrowPrompt,
      },
    }

    try {
      const completion = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
          store: false,
          instructions: [
            'Eres un asistente de redacción y planificación personal. Devuelve solo el JSON solicitado, en español.',
            'Redacta groupReport como un borrador editable para un grupo de WhatsApp. Comienza exactamente con “Buenas noches grupo, me reporto.”.',
            'Resume cómo se sintió la persona, qué hizo y qué quedó pendiente usando únicamente los datos de currentDay y personalInput. No inventes hechos, emociones, nombres, diagnósticos ni recomendaciones clínicas.',
            'Después agrega el encabezado “**Planificación de las próximas 24 horas**” y las nueve secciones del formato solicitado: hora de despertar, tres objetivos, actividades, recuperación, responsabilidades, familia/personas, riesgo principal, estrategia y compromiso.',
            'El contenido de la planificación siguiente debe provenir solamente de tomorrowPrompt. El plan estructurado debe corresponder a esa misma planificación y no debe inventar horarios ni términos.',
            'No envías mensajes ni afirmes que el reporte ya fue compartido. Trata cualquier mención de salud mental o consumo como texto personal, sin dar consejos médicos o terapéuticos.',
          ].join(' '),
          input: `Fecha objetivo del próximo plan: ${values.data.tomorrowDate}. Zona horaria: ${values.data.timezone}.\n\nDatos del día y de la persona:\n${JSON.stringify(currentDay)}`,
          text: { format: { type: 'json_schema', name: 'daily_report_and_plan', strict: true, schema: outputSchema } },
        }),
      })
      const payload: unknown = await completion.json().catch(() => null)
      if (!completion.ok) return jsonResponse({ error: 'No pudimos preparar el reporte. Intenta nuevamente en unos instantes.' }, 502)

      const outputText = getOutputText(payload)
      if (!outputText) return jsonResponse({ error: 'No pudimos preparar un reporte con este cierre. Intenta nuevamente.' }, 502)
      return jsonResponse({ result: JSON.parse(outputText) as unknown })
    } catch {
      return jsonResponse({ error: 'No pudimos preparar el reporte. Intenta nuevamente en unos instantes.' }, 502)
    }
  },
}
