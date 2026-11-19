import {
  NormalizedProfile,
  Decision,
  DiagnosticLabel,
  SimulationResult,
} from '../core/types/index';
import {
  buildDecisionPrompt,
  processAiDecisionsResponse,
} from '../core/ai/decisions';
import { getFallbackDecisions, generateTemplateExplanation } from '../core/ai/fallbacks';

const STORAGE_KEY = 'nexora_openai_api_key';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321').replace(/\/$/, '');
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

function getEdgeHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (SUPABASE_ANON_KEY) {
    headers['apikey'] = SUPABASE_ANON_KEY;
    headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
  }
  return headers;
}

export function getStoredApiKey(): string {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local && local.trim()) return local.trim();
  }
  const envKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim()) {
    return envKey.trim();
  }
  return '';
}

export function setStoredApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem(STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}

export interface DecisionGenerationContext {
  step?: number;
  maxSteps?: number;
  previousDecisions?: Decision[];
}

/**
 * Genera decisiones estratégicas llamando al backend de Nexora.
 * El backend es el único que maneja la OPENAI_API_KEY desde su archivo .env.
 * Si el backend aún no tiene la clave configurada, se generan decisiones heurísticas adaptadas.
 */
export async function generateAiDecisions(
  profile: NormalizedProfile,
  diagnosis: DiagnosticLabel[],
  context?: DecisionGenerationContext
): Promise<{
  decisions: Decision[];
  source: 'openai' | 'fallback';
  warning?: string;
}> {
  const currentStep = context?.step || 1;
  const previousDecisions = context?.previousDecisions || [];

  // 1. Llamar al backend de Edge Functions (donde está configurada la clave en .env)
  try {
    const backendRes = await fetch(`${SUPABASE_URL}/functions/v1/ai-decisions`, {
      method: 'POST',
      headers: getEdgeHeaders(),
      body: JSON.stringify({
        profile,
        diagnosis,
        step: currentStep,
        previousDecisions: previousDecisions.map((d) => ({
          id: d.id,
          name: d.name,
          category: d.category,
          description: d.description,
        })),
      }),
    });

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (data.success && data.content) {
        const { decisions } = processAiDecisionsResponse(data.content, profile);
        if (decisions && decisions.length >= 1) {
          // Exactamente 4 decisiones para la ronda
          return { decisions: decisions.slice(0, 4), source: 'openai' };
        }
      }
    } else {
      const errJson = await backendRes.json().catch(() => null);
      if (errJson?.needApiKey) {
        console.info('Backend: OPENAI_API_KEY pendiente en Nexora-api/.env');
      }
    }
  } catch (err) {
    console.warn('Backend Edge Function en espera o no disponible, usando simulador local:', err);
  }

  // 2. Fallback inteligente mientras se agrega la key al backend
  return {
    decisions: getCustomizedFallbackDecisions(profile, currentStep, previousDecisions).slice(0, 4),
    source: 'fallback',
    warning:
      'Backend en espera de OPENAI_API_KEY en Nexora-api/.env. Se cargaron 4 decisiones cuantitativas calculadas para esta etapa.',
  };
}

/**
 * Genera 4 decisiones heurísticas personalizadas según la ronda y la decisión previa tomada.
 */
function getCustomizedFallbackDecisions(
  profile: NormalizedProfile,
  step = 1,
  previousDecisions: Decision[] = []
): Decision[] {
  const lastDecision = previousDecisions[previousDecisions.length - 1];
  const caja = profile.cajaDisponible;
  const ticket = profile.ticketPromedio;
  const probDesc = profile.problemaPrincipal?.descripcion || profile.descripcionLibre || '';

  // Ronda 2: Decisiones derivadas de la primera elección
  if (step === 2 && lastDecision) {
    const isMarketing = lastDecision.category === 'marketing';
    const isPrice = lastDecision.category === 'precio' || lastDecision.category === 'producto';
    const isPersonal = lastDecision.category === 'personal' || lastDecision.category === 'operaciones';

    return [
      {
        id: `dec_r2_fideliz_${Date.now()}`,
        name: 'Programa de Retención y Club VIP',
        category: 'fidelizacion',
        description: `Consolidar los nuevos clientes captados tras "${lastDecision.name}" con membresías y recompensas.`,
        oneTimeCost: Math.min(800, Math.round(caja * 0.15)),
        fixedDelta: 200,
        marketingDelta: 150,
        priceChangePct: 3,
        varCostDeltaPct: 0,
        capacityChangePct: 0,
        demandLift: { start: 6, end: 15, curve: 'linear', lagMonths: 0 },
        satisfactionPerMonth: 2.0,
        pros: ['Frecuencia de compra garantizada', 'Mayor lealtad de la base de clientes'],
        cons: ['Costo mensual de recompensas'],
        risks: ['Baja adopción si el proceso de registro es complejo'],
        assumptions: [{ text: 'Clientes valoran beneficios de recurrencia', confidence: 'alta' }],
        requiresFinancing: false,
      },
      {
        id: `dec_r2_opt_${Date.now()}`,
        name: isMarketing ? 'Aumento de Capacidad Operativa' : 'Optimización de Costos y Proveedores',
        category: isMarketing ? 'operaciones' : 'costos',
        description: isMarketing
          ? 'Ampliar turnos y capacidad física para evitar saturación ante la nueva demanda.'
          : 'Renegociar insumos críticos para defender el margen bruto del negocio.',
        oneTimeCost: Math.min(1200, Math.round(caja * 0.2)),
        fixedDelta: isMarketing ? 600 : -400,
        marketingDelta: 0,
        priceChangePct: 0,
        varCostDeltaPct: isMarketing ? 0 : -4,
        capacityChangePct: isMarketing ? 25 : 0,
        demandLift: { start: isMarketing ? 8 : 2, end: isMarketing ? 16 : 4, curve: 'linear', lagMonths: 1 },
        satisfactionPerMonth: 1.2,
        pros: isMarketing ? ['Atención sin demoras', 'Mayor volumen'] : ['Mejora de margen unitario', 'Mayor flujo de caja'],
        cons: isMarketing ? ['Incremento en costos fijos'] : ['Exige tiempo de negociación'],
        risks: ['Variación imprevista en demanda'],
        assumptions: [{ text: 'Operación flexible', confidence: 'media' }],
        requiresFinancing: false,
      },
      {
        id: `dec_r2_precio_${Date.now()}`,
        name: isPrice ? 'Paquetes Premium de Mayor Ticket' : 'Ajuste de Precios por Valor Agregado',
        category: 'precio',
        description: `Aumentar el ticket promedio (${profile.moneda} ${ticket}) con opciones exclusivas o bundles de mayor margen.`,
        oneTimeCost: Math.min(300, Math.round(caja * 0.05)),
        fixedDelta: 0,
        marketingDelta: 100,
        priceChangePct: 8,
        varCostDeltaPct: 1,
        capacityChangePct: 0,
        demandLift: { start: -2, end: 6, curve: 'linear', lagMonths: 0 },
        satisfactionPerMonth: 0.8,
        pros: ['Incremento directo en ingresos por cliente', 'Defensa contra la inflación'],
        cons: ['Posible fricción inicial en clientes sensibles al precio'],
        risks: ['Resistencia inicial si no se comunica el valor añadido'],
        assumptions: [{ text: 'Segmento dispuesto a pagar por calidad superior', confidence: 'alta' }],
        requiresFinancing: false,
      },
      {
        id: `dec_r2_inversion_${Date.now()}`,
        name: 'Digitalización y Canal Online',
        category: 'producto',
        description: 'Lanzar canal de pedidos directos y reservas digitales sin comisiones excesivas.',
        oneTimeCost: Math.min(1800, Math.round(caja * 0.25)),
        fixedDelta: 350,
        marketingDelta: 300,
        priceChangePct: 0,
        varCostDeltaPct: -2,
        capacityChangePct: 15,
        demandLift: { start: 10, end: 22, curve: 'linear', lagMonths: 1 },
        satisfactionPerMonth: 1.5,
        pros: ['Acceso a clientes fuera del radio peatonal', 'Control total de la data'],
        cons: ['Inversión inicial en software e integración'],
        risks: ['Retrasos en la curva de adopción tecnológica'],
        assumptions: [{ text: 'Demanda interesada en conveniencia digital', confidence: 'alta' }],
        requiresFinancing: false,
      },
    ];
  }

  // Ronda 3: Decisiones de consolidación final y escalamiento
  if (step === 3) {
    return [
      {
        id: `dec_r3_auto_${Date.now()}`,
        name: 'Automatización y Eficiencia de Procesos',
        category: 'operaciones',
        description: 'Sistematizar inventario, cobros y operaciones para reducir mermas y tiempos de ciclo.',
        oneTimeCost: Math.min(1500, Math.round(caja * 0.2)),
        fixedDelta: -300,
        marketingDelta: 0,
        priceChangePct: 0,
        varCostDeltaPct: -3,
        capacityChangePct: 10,
        demandLift: { start: 4, end: 10, curve: 'linear', lagMonths: 0 },
        satisfactionPerMonth: 2.0,
        pros: ['Menor merma operativa', 'Tiempos de respuesta inmediatos'],
        cons: ['Curva de aprendizaje del equipo'],
        risks: ['Fallas de adaptación en software'],
        assumptions: [{ text: 'Procesos estandarizables', confidence: 'alta' }],
        requiresFinancing: false,
      },
      {
        id: `dec_r3_alianza_${Date.now()}`,
        name: 'Alianzas Estratégicas B2B y Corporativas',
        category: 'marketing',
        description: 'Cerrar acuerdos con empresas o comercios vecinos para asegurar volumen recurrente contratado.',
        oneTimeCost: Math.min(600, Math.round(caja * 0.1)),
        fixedDelta: 100,
        marketingDelta: 200,
        priceChangePct: -4,
        varCostDeltaPct: 0,
        capacityChangePct: 10,
        demandLift: { start: 12, end: 24, curve: 'linear', lagMonths: 1 },
        satisfactionPerMonth: 1.0,
        pros: ['Flujo de caja garantizado por contrato', 'Diversificación del riesgo'],
        cons: ['Menor margen unitario por volumen'],
        risks: ['Dependencia de pocos clientes grandes'],
        assumptions: [{ text: 'Mercado corporativo interesado', confidence: 'alta' }],
        requiresFinancing: false,
      },
      {
        id: `dec_r3_franquicia_${Date.now()}`,
        name: 'Fondo de Expansión o Segunda Sucursal',
        category: 'inversion',
        description: 'Reinvertir excedentes en preparar el modelo para replicabilidad o apertura de nuevo punto.',
        oneTimeCost: Math.min(3000, Math.round(caja * 0.35)),
        fixedDelta: 800,
        marketingDelta: 500,
        priceChangePct: 0,
        varCostDeltaPct: -2,
        capacityChangePct: 40,
        demandLift: { start: 5, end: 30, curve: 'linear', lagMonths: 2 },
        satisfactionPerMonth: 1.5,
        pros: ['Salto cuántico en ingresos', 'Economías de escala'],
        cons: ['Mayor desembolso y riesgo de ejecución'],
        risks: ['Sobrecarga de gestión'],
        assumptions: [{ text: 'Marca validada en el mercado', confidence: 'media' }],
        requiresFinancing: caja < 3000,
      },
      {
        id: `dec_r3_reserva_${Date.now()}`,
        name: 'Blindaje Financiero y Reserva de Tesorería',
        category: 'costos',
        description: 'Asegurar un colchón de liquidez de 3 meses para imprevistos y reducir endeudamiento.',
        oneTimeCost: 0,
        fixedDelta: -250,
        marketingDelta: -100,
        priceChangePct: 0,
        varCostDeltaPct: 0,
        capacityChangePct: 0,
        demandLift: { start: 0, end: 2, curve: 'linear', lagMonths: 0 },
        satisfactionPerMonth: 0.5,
        pros: ['Runway financiero máximo', 'Cero riesgo de quiebra'],
        cons: ['Crecimiento más conservador a corto plazo'],
        risks: ['Costo de oportunidad de no invertir'],
        assumptions: [{ text: 'Estabilidad de demanda', confidence: 'alta' }],
        requiresFinancing: false,
      },
    ];
  }

  // Ronda 1: 4 decisiones iniciales bien diferenciadas
  const base = getFallbackDecisions(profile.rubro);
  return base.slice(0, 4).map((dec, idx) => {
    let customDesc = dec.description;
    if (idx === 0 && probDesc) {
      customDesc = `${dec.description}. Directamente enfocado en: "${probDesc.slice(0, 80)}".`;
    }
    return {
      ...dec,
      description: customDesc,
      oneTimeCost: Math.min(dec.oneTimeCost, Math.max(100, Math.round(profile.cajaDisponible * 0.3))),
    };
  });
}

// Cache en memoria para respuestas del Analista IA (evita llamadas redundantes a OpenAI)
const aiExplainCache = new Map<string, string>();
const aiExplainInFlight = new Map<string, Promise<string>>();

/**
 * Consulta al Analista IA para explicaciones o preguntas sobre el escenario.
 * El backend es el único que consume la OPENAI_API_KEY.
 * Incluye caché en memoria y deduplicación de peticiones concurrentes.
 */
export async function askAiAnalyst(
  profile: NormalizedProfile,
  decision: Decision | null,
  simResult: SimulationResult | null,
  question?: string
): Promise<string> {
  const cacheKey = `${profile.rubro}_${decision?.id || 'nodec'}_${question?.trim() || 'default'}`;

  // 1. Retornar inmediatamente si ya está en caché de la sesión
  if (aiExplainCache.has(cacheKey)) {
    return aiExplainCache.get(cacheKey)!;
  }

  // 2. Si ya hay una consulta idéntica en vuelo, reutilizar la misma promesa
  if (aiExplainInFlight.has(cacheKey)) {
    return aiExplainInFlight.get(cacheKey)!;
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-explain`, {
        method: 'POST',
        headers: getEdgeHeaders(),
        body: JSON.stringify({ profile, decision, simResult, question }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.answer) {
          aiExplainCache.set(cacheKey, data.answer);
          return data.answer;
        }
      }
    } catch {
      // fallback
    } finally {
      aiExplainInFlight.delete(cacheKey);
    }

    // Fallback si el backend está en espera
    if (simResult) {
      const expl = generateTemplateExplanation(simResult, profile);
      const fallbackText = `${expl.cadenaCausal} Recomendación: ${expl.recomendacion}`;
      aiExplainCache.set(cacheKey, fallbackText);
      return fallbackText;
    }
    return 'Inicia una simulación para que el analista genere un diagnóstico completo.';
  })();

  aiExplainInFlight.set(cacheKey, fetchPromise);
  return fetchPromise;
}
