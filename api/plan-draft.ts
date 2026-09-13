import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const requestSchema = z.object({
  prompt: z.string().trim().min(10).max(12_000),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timezone: z.string().trim().min(1).max(100),
})

const outputSchema = {
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
    goals: {
      type: 'array',
      maxItems: 3,
      items: { type: 'string' },
    },
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

function jsonResponse(body: { error: string } | { draft: unknown }, status = 200) {
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

async function readRequestBody(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return null
  }
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Método no permitido.' }), { status: 405, headers: { Allow: 'POST', 'Content-Type': 'application/json' } })
    }

    const values = requestSchema.safeParse(await readRequestBody(request))
    if (!values.success) {
      return jsonResponse({ error: 'Revisa el texto y la fecha antes de generar el borrador.' }, 400)
    }

    const accessToken = request.headers.get('Authorization')?.replace(/^Bearer\s+/, '').trim()
    const supabaseUrl = process.env.VITE_SUPABASE_URL
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

    if (!accessToken || !supabaseUrl || !supabaseAnonKey) {
      return jsonResponse({ error: 'Tu sesión no es válida. Inicia sesión nuevamente.' }, 401)
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data: userData, error: userError } = await supabase.auth.getUser(accessToken)

    if (userError || !userData.user) {
      return jsonResponse({ error: 'Tu sesión no es válida. Inicia sesión nuevamente.' }, 401)
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return jsonResponse({ error: 'La planificación asistida aún no está configurada. Agrega OPENAI_API_KEY en Vercel.' }, 503)
    }

    try {
      const completion = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
          store: false,
          instructions: [
            'Eres el asistente de planificación personal de Nivo. Convierte el texto del usuario en un borrador de su próximo día.',
            'Responde únicamente con los datos solicitados por el esquema. Usa español neutro y conserva información solo cuando está explícita en el texto.',
            'Si el texto contiene un reporte del día anterior junto con una planificación, extrae solo la planificación de las próximas 24 horas.',
            'No inventes horarios, fechas, actividades, metas, riesgos ni detalles. Si no existe información suficiente, usa null o arreglos vacíos.',
            'Devuelve como máximo tres objetivos principales. Para las actividades, usa HH:mm únicamente cuando el horario esté explícito; no infieras una hora de término.',
            'No hagas diagnósticos, recomendaciones terapéuticas, cálculos financieros ni comentarios adicionales.',
          ].join(' '),
          input: `Fecha objetivo: ${values.data.date}. Zona horaria: ${values.data.timezone}.\n\nTexto de la persona:\n${values.data.prompt}`,
          text: {
            format: {
              type: 'json_schema',
              name: 'daily_plan_draft',
              strict: true,
              schema: outputSchema,
            },
          },
        }),
      })
      const completionPayload: unknown = await completion.json().catch(() => null)

      if (!completion.ok) {
        return jsonResponse({ error: 'No pudimos preparar el borrador. Intenta nuevamente en unos instantes.' }, 502)
      }

      const outputText = getOutputText(completionPayload)
      if (!outputText) {
        return jsonResponse({ error: 'No pudimos preparar un borrador con este texto. Intenta nuevamente.' }, 502)
      }

      return jsonResponse({ draft: JSON.parse(outputText) as unknown })
    } catch {
      return jsonResponse({ error: 'No pudimos preparar el borrador. Intenta nuevamente en unos instantes.' }, 502)
    }
  },
}