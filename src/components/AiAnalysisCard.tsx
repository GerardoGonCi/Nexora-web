import React, { useState, useEffect } from 'react';
import { Bot, Lightbulb, MessageSquare, Send, X, Loader2, Sparkles, CheckCircle2, Trophy } from 'lucide-react';
import { Decision, SimulationResult, NormalizedProfile } from '../core/types/index';
import { askAiAnalyst } from '../services/aiService';

interface AiAnalysisCardProps {
  decision: Decision | null;
  simResult: SimulationResult | null;
  profile: NormalizedProfile;
  isCompleted?: boolean;
  userSelectedDecisionId?: string | null;
  onRequestAnalysis?: (decision: Decision) => void;
}

export const AiAnalysisCard: React.FC<AiAnalysisCardProps> = ({
  decision,
  simResult,
  profile,
  isCompleted = false,
  userSelectedDecisionId = null,
  onRequestAnalysis,
}) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'ia'; text: string }[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [aiSpeech, setAiSpeech] = useState<string | null>(null);
  const [isLoadingSpeech, setIsLoadingSpeech] = useState(false);

  // El consultor SOLO debe activarse cuando el usuario ha seleccionado explícitamente una decisión
  const isSelectedByUser = !isCompleted && !!decision && userSelectedDecisionId === decision.id;

  // Consultar a OpenAI ÚNICAMENTE cuando el usuario selecciona una decisión explícita
  useEffect(() => {
    // Si la simulación está finalizada, o no hay decisión, o el usuario no la ha seleccionado: NO ejecutar
    if (isCompleted || !decision || !isSelectedByUser) {
      if (isCompleted) {
        setAiSpeech(null);
      }
      return;
    }

    let isSubscribed = true;
    setIsLoadingSpeech(true);

    askAiAnalyst(
      profile,
      decision,
      simResult,
      `Actúa como Consultor Nexora AI. Analiza la estrategia "${decision.name}" para este negocio. Brinda un análisis ejecutivo conciso de 2 oraciones sobre el impacto principal proyectado y qué riesgo debe cuidar el empresario.`
    )
      .then((res) => {
        if (isSubscribed && res) setAiSpeech(res);
      })
      .catch(() => {})
      .finally(() => {
        if (isSubscribed) setIsLoadingSpeech(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [decision?.id, isSelectedByUser, isCompleted]);

  // Texto adaptativo de respaldo según la decisión seleccionada
  const getFallbackAnalysis = () => {
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
        speech: capacityLimit
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

  const fallbackContent = getFallbackAnalysis();

  const handleSendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isAsking) return;

    const userText = question.trim();
    setQuestion('');
    setChatLog((prev) => [...prev, { sender: 'user', text: userText }]);
    setIsAsking(true);

    try {
      const iaResponse = await askAiAnalyst(profile, decision, simResult, userText);
      setChatLog((prev) => [...prev, { sender: 'ia', text: iaResponse }]);
    } catch {
      setChatLog((prev) => [
        ...prev,
        {
          sender: 'ia',
          text: 'No se pudo contactar con el consultor en este momento. Verifica la conexión con el backend.',
        },
      ]);
    } finally {
      setIsAsking(false);
    }
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isCompleted ? '#34d399' : '#818cf8',
              }}
            >
              <Bot size={18} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
              Consultor Nexora AI
            </h4>
          </div>

          {/* Badge de Estado */}
          {isCompleted ? (
            <span
              style={{
                fontSize: '0.72rem',
                color: '#34d399',
                background: 'rgba(16, 185, 129, 0.15)',
                padding: '3px 10px',
                borderRadius: '999px',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600,
              }}
            >
              <CheckCircle2 size={12} /> Decisiones Concluidas
            </span>
          ) : isSelectedByUser ? (
            <span
              style={{
                fontSize: '0.72rem',
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.12)',
                padding: '3px 10px',
                borderRadius: '999px',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600,
              }}
            >
              <Sparkles size={11} /> OpenAI Activo
            </span>
          ) : (
            <span
              style={{
                fontSize: '0.72rem',
                color: '#94a3b8',
                background: 'rgba(148, 163, 184, 0.12)',
                padding: '3px 10px',
                borderRadius: '999px',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 500,
              }}
            >
              En reposo
            </span>
          )}
        </div>

        {/* Robot Avatar y Bocadillo de Diálogo */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '14px' }}>
          {/* Avatar Robot */}
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: isCompleted
                ? 'linear-gradient(135deg, #059669, #10b981)'
                : 'linear-gradient(135deg, #1e3a8a, #38bdf8)',
              border: isCompleted
                ? '2px solid rgba(52, 211, 153, 0.4)'
                : '2px solid rgba(56, 189, 248, 0.4)',
              boxShadow: isCompleted
                ? '0 0 16px rgba(16, 185, 129, 0.35)'
                : '0 0 16px rgba(56, 189, 248, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {isCompleted ? (
              <Trophy size={24} color="#ffffff" />
            ) : (
              <span style={{ fontSize: '1.6rem' }}>🤖</span>
            )}
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
              lineHeight: 1.45,
              minHeight: '48px',
            }}
          >
            {isCompleted ? (
              <div style={{ color: '#a7f3d0' }}>
                ¡Plan estratégico completado! Has seleccionado y aprobado tus decisiones. Toda la información consolidada ya se refleja en tu tablero y en el Árbol de Consecuencias. No hay más consultas pendientes en esta simulación.
              </div>
            ) : !isSelectedByUser ? (
              <div>
                <p style={{ margin: '0 0 8px 0', color: '#cbd5e1' }}>
                  Selecciona cualquiera de las 4 decisiones en el tablero para que el Consultor Nexora AI analice su impacto y riesgos con OpenAI.
                </p>
                {decision && onRequestAnalysis && (
                  <button
                    onClick={() => onRequestAnalysis(decision)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'rgba(56, 189, 248, 0.15)',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      borderRadius: '8px',
                      padding: '5px 12px',
                      color: '#38bdf8',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Sparkles size={13} />
                    <span>Analizar «{decision.name}» con IA</span>
                  </button>
                )}
              </div>
            ) : isLoadingSpeech ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                <Loader2 size={16} className="spin-animation" style={{ color: '#38bdf8' }} />
                <span>Consultor IA formulando recomendación para «{decision?.name}»...</span>
              </div>
            ) : (
              aiSpeech || fallbackContent.speech
            )}
          </div>
        </div>

        {/* Consejo Clave */}
        <div
          style={{
            background: isCompleted
              ? 'rgba(16, 185, 129, 0.12)'
              : !isSelectedByUser
              ? 'rgba(56, 189, 248, 0.08)'
              : 'rgba(245, 158, 11, 0.12)',
            border: isCompleted
              ? '1px solid rgba(16, 185, 129, 0.3)'
              : !isSelectedByUser
              ? '1px solid rgba(56, 189, 248, 0.2)'
              : '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            color: isCompleted ? '#6ee7b7' : !isSelectedByUser ? '#bae6fd' : '#fde68a',
            fontSize: '0.8rem',
            lineHeight: 1.35,
          }}
        >
          {isCompleted ? (
            <Trophy size={17} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <Lightbulb
              size={17}
              color={!isSelectedByUser ? '#38bdf8' : '#fbbf24'}
              style={{ flexShrink: 0, marginTop: '2px' }}
            />
          )}
          <div>
            <strong
              style={{
                color: isCompleted ? '#34d399' : !isSelectedByUser ? '#38bdf8' : '#fbbf24',
                marginRight: '4px',
              }}
            >
              {isCompleted
                ? 'Conclusión del Plan:'
                : !isSelectedByUser
                ? 'Control de Consultas:'
                : 'Recomendación clave:'}
            </strong>
            {isCompleted
              ? 'Explora el Árbol de Consecuencias para comparar tu trayectoria con otros caminos posibles, o reinicia el camino si deseas evaluar combinaciones alternativas.'
              : !isSelectedByUser
              ? 'El consultor se mantiene en reposo y solo se activará cuando hagas clic en una decisión específica, optimizando las llamadas a la IA.'
              : fallbackContent.tip}
          </div>
        </div>
      </div>

      {/* Botón Preguntar a la IA (solo si no está completado) */}
      {!isCompleted && (
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
            <span>Preguntar al Consultor IA</span>
          </button>
        </div>
      )}

      {/* Modal / Diálogo de Chat interactivo con OpenAI */}
      {isChatOpen && !isCompleted && (
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
              width: '480px',
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
                <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600 }}>Consultor Nexora AI (GPT-4o)</h4>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Mensajes */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px', minHeight: '200px' }}>
              <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '10px 14px', borderRadius: '12px', fontSize: '0.85rem', color: '#cbd5e1' }}>
                Hola. Analizo en vivo los números de tu empresa y el impacto de «{decision?.name || 'tu estrategia'}». ¿Qué deseas consultar sobre caja, clientes, margen o riesgos?
              </div>
              {chatLog.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.sender === 'user' ? '#2563eb' : 'rgba(30, 41, 59, 0.85)',
                    color: '#ffffff',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    maxWidth: '85%',
                    fontSize: '0.85rem',
                    lineHeight: 1.4,
                  }}
                >
                  {msg.text}
                </div>
              ))}
              {isAsking && (
                <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontSize: '0.8rem' }}>
                  <Loader2 size={14} className="spin-animation" />
                  <span>El consultor está pensando...</span>
                </div>
              )}
            </div>

            {/* Input para formular preguntas */}
            <form onSubmit={handleSendQuestion} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Ej: ¿Qué pasa con el flujo de caja en el mes 3?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={isAsking || !question.trim()}
                style={{
                  background: '#2563eb',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0 16px',
                  color: '#ffffff',
                  cursor: isAsking || !question.trim() ? 'not-allowed' : 'pointer',
                  opacity: isAsking || !question.trim() ? 0.5 : 1,
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
      )}
    </div>
  );
};
