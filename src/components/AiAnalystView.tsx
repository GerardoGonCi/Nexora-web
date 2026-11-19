import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Lightbulb,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Send,
  MessageSquare
} from 'lucide-react';
import {
  NormalizedProfile,
  Decision,
  SimulationResult,
} from '../core/types/index';
import { generateTemplateExplanation } from '../core/ai/fallbacks';
import { verifyExplanationNumbers } from '../core/ai/explain';

interface AiAnalystViewProps {
  profile: NormalizedProfile;
  selectedDecision: Decision | null;
  simResult: SimulationResult | null;
}

export const AiAnalystView: React.FC<AiAnalystViewProps> = ({
  profile,
  selectedDecision,
  simResult,
}) => {
  const [userQuery, setUserQuery] = useState('');
  const [conversation, setConversation] = useState<
    { sender: 'user' | 'ia'; text: string; verified: boolean }[]
  >([]);

  // Generar explicación basada estrictamente en los datos del motor
  const explanation = simResult
    ? generateTemplateExplanation(simResult, profile)
    : null;

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || !simResult) return;

    const query = userQuery.trim().toLowerCase();
    const b = simResult.base.summary;
    let answer = '';

    if (query.includes('caja') || query.includes('liquidez')) {
      answer = `La caja mínima calculada en el horizonte de ${simResult.horizon} meses es de ${profile.moneda} ${b.cajaMinima}, finalizando con un saldo disponible de ${profile.moneda} ${b.cajaFinal}.`;
    } else if (query.includes('cliente') || query.includes('demanda')) {
      answer = `El número de clientes atendidos al término del periodo alcanza los ${b.clientesFinales} clientes mensuales, manteniendo una satisfacción proyectada de ${Math.round(b.satisfaccionFinal)}%.`;
    } else if (query.includes('beneficio') || query.includes('ganancia')) {
      answer = `El beneficio acumulado generado por este camino es de ${profile.moneda} ${b.beneficioAcumulado}, con un beneficio mensual en el último mes de ${profile.moneda} ${b.beneficioFinal}.`;
    } else {
      answer = `En la decisión «${simResult.decisionName}», el beneficio acumulado proyectado es de ${profile.moneda} ${b.beneficioAcumulado} en ${simResult.horizon} meses con una satisfacción de ${Math.round(b.satisfaccionFinal)} sobre 100.`;
    }

    // Verificador de cifras
    const engineData = { summary: b, horizon: simResult.horizon };
    const check = verifyExplanationNumbers(answer, engineData);

    setConversation((prev) => [
      ...prev,
      { sender: 'user', text: userQuery, verified: true },
      { sender: 'ia', text: answer, verified: check.isValid },
    ]);
    setUserQuery('');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
      {/* Columna Izquierda: Informe Causal y Riesgos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Cabecera */}
        <div
          className="glass-panel"
          style={{
            padding: '24px 28px',
            background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
            <Sparkles size={16} /> Consultoría Automatizada y Fact-Checked
          </div>
          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
            Análisis Causal: {selectedDecision?.name || 'Escenario Base'}
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Explicación determinista de cómo cada variable afectó los resultados financieros sin inventar ni estimar cifras externas.
          </p>
        </div>

        {/* Cadena Causal */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#38bdf8', marginBottom: '10px' }}>
            1. Cadena Causal (Decisión → Efecto Directo → Efecto Indirecto)
          </div>
          <p style={{ color: '#e2e8f0', fontSize: '0.92rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
            {explanation?.cadenaCausal || 'Ejecuta una simulación para generar el análisis causal.'}
          </p>
        </div>

        {/* Riesgos no considerados */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#fbbf24', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={16} /> 2. Riesgos no considerados detectados
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {explanation?.riesgosNoConsiderados.map((r, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  color: '#fde68a',
                  fontSize: '0.86rem',
                }}
              >
                {r}
              </div>
            ))}
          </div>
        </div>

        {/* Recomendación */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#4ade80', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lightbulb size={16} /> 3. Recomendación de Continuidad
          </div>
          <p style={{ color: '#86efac', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {explanation?.recomendacion}
          </p>
        </div>
      </div>

      {/* Columna Derecha: Chat Interactivo Auditado */}
      <div
        className="glass-panel"
        style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
            <Bot size={22} color="#38bdf8" />
            <div>
              <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 600 }}>Preguntas al Analista</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#4ade80' }}>
                <ShieldCheck size={12} /> Cifras verificadas contra el motor
              </div>
            </div>
          </div>

          {/* Historial de Chat */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '6px' }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px 14px', borderRadius: '12px', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.4 }}>
              Puedes preguntarme detalles sobre la caja, evolución de clientes o eventos adversos del escenario actual.
            </div>

            {conversation.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'user' ? '#2563eb' : 'rgba(15, 23, 42, 0.85)',
                  border: msg.sender === 'user' ? 'none' : '1px solid rgba(56, 189, 248, 0.25)',
                  color: '#ffffff',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  maxWidth: '85%',
                  lineHeight: 1.4,
                }}
              >
                {msg.text}
              </div>
            ))}
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleAsk} style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Pregunta sobre la caja, clientes o rentabilidad..."
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '0.88rem',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0 20px',
              borderRadius: '12px',
              border: 'none',
              background: '#38bdf8',
              color: '#0f172a',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
