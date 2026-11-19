import React, { useState } from 'react';
import { Bot, Lightbulb, MessageSquare, Send, X } from 'lucide-react';
import { Decision, SimulationResult, NormalizedProfile } from '../core/types/index';
import { verifyExplanationNumbers } from '../core/ai/explain';

interface AiAnalysisCardProps {
  decision: Decision | null;
  simResult: SimulationResult | null;
  profile: NormalizedProfile;
}

export const AiAnalysisCard: React.FC<AiAnalysisCardProps> = ({
  decision,
  simResult,
  profile,
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'ia'; text: string }[]>([]);

  // Texto adaptativo según la decisión seleccionada
  const getAnalysisContent = () => {
    if (!decision) {
      return {
        speech:
          'Selecciona una decisión estratégica para analizar sus consecuencias inmediatas y riesgos de segundo orden.',
        tip: 'Recuerda que todas las simulaciones parten estrictamente de los números de tu caso de negocio.',
      };
    }

    const name = decision.name.toLowerCase();
    const capacityLimit = profile.derivatives.utilizacion > 0.8;

    if (name.includes('marketing') || decision.category === 'marketing') {
      return {
        speech:
          capacityLimit
            ? 'Aumentar el marketing puede ser una gran idea, pero asegúrate de que tu negocio pueda atender el mayor flujo de clientes sin colapsar el servicio.'
            : `Aumentar el marketing generará un incremento proyectado del ${decision.demandLift.end}% en la demanda, aprovechando tu capacidad disponible.`,
        tip: capacityLimit
          ? 'Considera mejorar tu capacidad operativa si esperas un aumento significativo de clientes para evitar caídas en satisfacción.'
          : 'Monitorea el costo de adquisición por cliente durante los primeros 3 meses para evitar fatiga publicitaria.',
      };
    }

    if (name.includes('precio') || decision.priceChangePct !== 0) {
      return {
        speech:
          decision.priceChangePct < 0
            ? `Reducir precios reactiva el tráfico (+${Math.abs(decision.priceChangePct)}%), pero requiere cuidar el margen de contribución unitario.`
            : `El aumento de precio eleva el margen directo, pero en un entorno de competencia ${profile.nivelCompetencia} debes vigilar la retención.`,
        tip: 'La elasticidad de la demanda determinará si el volumen compensa el cambio tarifario.',
      };
    }

    return {
      speech: `La estrategia «${decision.name}» tiene un costo inicial de ${profile.moneda} ${decision.oneTimeCost}. La simulación proyecta un impacto estable en la reputación.`,
      tip: 'Verifica que la caja mínima permanezca en valores seguros durante el horizonte proyectado.',
    };
  };

  const { speech, tip } = getAnalysisContent();

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userText = question;
    const newLog = [...chatLog, { sender: 'user' as const, text: userText }];

    // Respuesta fact-checked determinista basada en datos del motor
    const b = simResult?.base.summary;
    let iaResponse = '';

    if (userText.toLowerCase().includes('caja') || userText.toLowerCase().includes('dinero')) {
      iaResponse = `La caja mínima proyectada en este escenario es de ${profile.moneda} ${b?.cajaMinima ?? profile.cajaDisponible}, terminando con un saldo de ${profile.moneda} ${b?.cajaFinal ?? profile.cajaDisponible}.`;
    } else if (userText.toLowerCase().includes('cliente') || userText.toLowerCase().includes('venta')) {
      iaResponse = `Al finalizar el horizonte de ${simResult?.horizon || 12} meses, se proyecta atender a ${b?.clientesFinales ?? profile.clientesPorMes} clientes con una satisfacción del ${Math.round(b?.satisfaccionFinal ?? profile.satisfaccionBase)}%.`;
    } else {
      iaResponse = `Para el escenario «${decision?.name || 'Base'}», el beneficio acumulado proyectado es de ${profile.moneda} ${b?.beneficioAcumulado ?? profile.derivatives.beneficioMensual}.`;
    }

    // Verificar cifras estrictamente contra el motor
    const engineData = { summary: b, horizon: simResult?.horizon };
    const check = verifyExplanationNumbers(iaResponse, engineData);
    if (!check.isValid) {
      iaResponse = `El beneficio acumulado auditado es de ${profile.moneda} ${b?.beneficioAcumulado}.`;
    }

    setChatLog([...newLog, { sender: 'ia' as const, text: iaResponse }]);
    setQuestion('');
  };

  return (
    <div
      style={{
        background: 'rgba(16, 23, 38, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '22px 26px',
        boxShadow: '0 12px 30px -10px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
      }}
    >
      <div>
        {/* Cabecera */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
            }}
          >
            <Bot size={18} />
          </div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
            Análisis de IA
          </h4>
        </div>

        {/* Robot Avatar y Bocadillo de Diálogo */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '14px' }}>
          {/* Avatar Robot */}
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #1e3a8a, #38bdf8)',
              border: '2px solid rgba(56, 189, 248, 0.4)',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '1.6rem' }}>🤖</span>
          </div>

          {/* Bocadillo */}
          <div
            style={{
              flex: 1,
              background: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '12px 16px',
              color: '#e2e8f0',
              fontSize: '0.86rem',
              lineHeight: 1.4,
            }}
          >
            {speech}
          </div>
        </div>

        {/* Consejo Clave */}
        <div
          style={{
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            color: '#fde68a',
            fontSize: '0.8rem',
            lineHeight: 1.35,
          }}
        >
          <Lightbulb size={17} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: '#fbbf24', marginRight: '4px' }}>Consejo clave:</strong>
            {tip}
          </div>
        </div>
      </div>

      {/* Botón Preguntar a la IA */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
        <button
          onClick={() => setIsChatOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '999px',
            border: '1px solid rgba(139, 92, 246, 0.5)',
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.8), rgba(79, 70, 229, 0.8))',
            color: '#ffffff',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 0 16px rgba(124, 58, 237, 0.4)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <MessageSquare size={14} />
          <span>Preguntar a la IA</span>
        </button>
      </div>

      {/* Modal / Diálogo de Chat interactivo */}
      {isChatOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
        >
          <div
            style={{
              width: '450px',
              background: '#0f172a',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '80vh',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot size={20} color="#38bdf8" />
                <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>Consultor Nexora AI</h4>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Mensajes */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px', minHeight: '180px' }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px 14px', borderRadius: '12px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                Hola. Puedo responder preguntas sobre los números y consecuencias proyectadas para «{decision?.name || 'tu negocio'}».
              </div>
              {chatLog.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.sender === 'user' ? '#2563eb' : 'rgba(30, 41, 59, 0.8)',
                    color: '#fff',
                    padding: '8px 14px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    maxWidth: '85%',
                  }}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSendQuestion} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Pregunta sobre la caja, clientes o margen..."
                style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.88rem' }}
              />
              <button
                type="submit"
                style={{ background: '#38bdf8', border: 'none', borderRadius: '10px', padding: '0 16px', color: '#0f172a', fontWeight: 600, cursor: 'pointer' }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
