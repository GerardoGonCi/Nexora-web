import React, { useState } from 'react';
import {
  Target,
  Megaphone,
  Tag,
  Gift,
  Users,
  Star,
  Heart,
  ArrowRight,
  TrendingDown,
  Layers,
  RotateCcw,
  Undo2,
  CheckCircle2,
  Sparkles,
  Trophy,
  Loader2,
  Coins,
  TrendingUp,
  Smile,
  Info,
  X,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { Decision, NormalizedProfile, SimulationResult } from '../core/types/index';

export interface DecisionHistoryItem {
  step: number;
  decision: Decision;
  profileBefore: NormalizedProfile;
  profileAfter: NormalizedProfile;
  simResult: SimulationResult;
  availableDecisions: Decision[];
}

interface DecisionGridProps {
  decisions: Decision[];
  selectedDecisionId: string | null;
  onSelectDecision: (decision: Decision) => void;
  onApproveDecision?: () => void;
  selectedDecision?: Decision | null;
  step?: number;
  maxSteps?: number;
  canUndo?: boolean;
  onUndo?: () => void;
  isGeneratingNext?: boolean;
  isCompleted?: boolean;
  onReset?: () => void;
  pathHistory?: DecisionHistoryItem[];
  profile?: NormalizedProfile;
  simResult?: SimulationResult | null;
  onFinishEarly?: () => void;
  onNavigateToCompare?: () => void;
}

export const DecisionGrid: React.FC<DecisionGridProps> = ({
  decisions,
  selectedDecisionId,
  onSelectDecision,
  onApproveDecision,
  selectedDecision,
  step = 1,
  maxSteps = 3,
  canUndo = false,
  onUndo,
  isGeneratingNext = false,
  isCompleted = false,
  onReset,
  pathHistory = [],
  profile,
  simResult,
  onFinishEarly,
  onNavigateToCompare,
}) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalActiveDecisionId, setModalActiveDecisionId] = useState<string | null>(null);

  const handleOpenDetailModal = (dec: Decision) => {
    setModalActiveDecisionId(dec.id);
    setIsDetailModalOpen(true);
  };

  const currentModalDecision: Decision =
    decisions.find((d) => d.id === modalActiveDecisionId) ||
    selectedDecision ||
    decisions[0];

  // Helper para asignar icono y color según categoría o nombre
  const getDecisionVisuals = (dec: Decision) => {
    const name = dec.name.toLowerCase();
    const cat = dec.category;

    if (name.includes('marketing') || cat === 'marketing') {
      return { icon: Megaphone, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' };
    }
    if (name.includes('precio') || cat === 'precio') {
      return { icon: Tag, color: '#fb923c', bg: 'rgba(251, 146, 60, 0.15)' };
    }
    if (name.includes('promocion') || name.includes('liquidac') || cat === 'producto') {
      return { icon: Gift, color: '#f472b6', bg: 'rgba(244, 114, 182, 0.15)' };
    }
    if (name.includes('personal') || name.includes('capacitac') || cat === 'personal') {
      return { icon: Users, color: '#22d3ee', bg: 'rgba(34, 211, 238, 0.15)' };
    }
    if (name.includes('experiencia') || name.includes('calidad') || cat === 'operaciones') {
      return { icon: Star, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' };
    }
    if (name.includes('fideliz') || cat === 'fidelizacion') {
      return { icon: Heart, color: '#f87171', bg: 'rgba(248, 113, 113, 0.15)' };
    }
    if (cat === 'costos') {
      return { icon: TrendingDown, color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)' };
    }
    return { icon: Layers, color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.15)' };
  };

  const moneda = profile?.moneda || 'USD';

  // Si la simulación está completada (ya se seleccionaron los caminos)
  if (isCompleted) {
    const lastRun = simResult?.base;
    const finalProfit = lastRun?.summary.beneficioFinal ?? profile?.derivatives.beneficioMensual ?? 0;
    const cumProfit = lastRun?.summary.beneficioAcumulado ?? 0;
    const finalCash = lastRun?.summary.cajaFinal ?? profile?.cajaDisponible ?? 0;
    const finalSat = lastRun?.summary.satisfaccionFinal ?? profile?.satisfaccionBase ?? 0;
    const finalClients = lastRun?.summary.clientesFinales ?? profile?.clientesPorMes ?? 0;

    return (
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(20, 30, 55, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '20px',
          padding: '28px 30px',
          boxShadow: '0 16px 40px -10px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
              }}
            >
              <Trophy size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    borderRadius: '999px',
                    padding: '2px 10px',
                    fontSize: '0.75rem',
                    color: '#6ee7b7',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}
                >
                  Simulación Finalizada
                </span>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  {pathHistory.length} decisiones ejecutadas
                </span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                Resultado Esperado de tu Estrategia
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {canUndo && onUndo && (
              <button
                onClick={onUndo}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  color: '#e2e8f0',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                }}
                title="Deshacer la última decisión para probar otra opción"
              >
                <Undo2 size={16} /> Deshacer última decisión
              </button>
            )}

            {onReset && (
              <button
                onClick={onReset}
                style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  color: '#38bdf8',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RotateCcw size={16} /> Reiniciar camino
              </button>
            )}
          </div>
        </div>

        {/* Resumen de las Decisiones Elegidas en el Camino */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Trayectoria Estratégica Elegida:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pathHistory.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                }}
              >
                <div
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: '#10b981',
                    color: '#0f172a',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f8fafc' }}>
                    {item.decision.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    {item.decision.description}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      background: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontWeight: 600,
                    }}
                  >
                    {item.decision.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Métricas Finales Acumuladas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6ee7b7', fontSize: '0.8rem', marginBottom: '4px' }}>
              <TrendingUp size={15} /> Beneficio Mensual
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              {moneda} {Math.round(finalProfit).toLocaleString()}
            </div>
          </div>

          <div style={{ background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#7dd3fc', fontSize: '0.8rem', marginBottom: '4px' }}>
              <Coins size={15} /> Caja Final
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              {moneda} {Math.round(finalCash).toLocaleString()}
            </div>
          </div>

          <div style={{ background: 'rgba(167, 139, 250, 0.12)', border: '1px solid rgba(167, 139, 250, 0.25)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c4b5fd', fontSize: '0.8rem', marginBottom: '4px' }}>
              <Users size={15} /> Clientes / Mes
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              {Math.round(finalClients).toLocaleString()}
            </div>
          </div>

          <div style={{ background: 'rgba(251, 191, 36, 0.12)', border: '1px solid rgba(251, 191, 36, 0.25)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fcd34d', fontSize: '0.8rem', marginBottom: '4px' }}>
              <Smile size={15} /> Satisfacción
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              {finalSat.toFixed(1)} / 5.0
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'rgba(16, 23, 38, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '24px 26px',
        boxShadow: '0 12px 30px -10px rgba(0,0,0,0.5)',
      }}
    >
      {/* Título de la Sección con Stepper y Deshacer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25), rgba(59, 130, 246, 0.25))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f472b6',
              boxShadow: '0 0 15px rgba(244, 114, 182, 0.3)',
            }}
          >
            <Target size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Toma tu decisión
                <span style={{ fontSize: '1rem' }}>✨</span>
              </h3>
              <span
                style={{
                  background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.2), rgba(168, 85, 247, 0.2))',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  borderRadius: '999px',
                  padding: '3px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#38bdf8',
                  letterSpacing: '0.02em',
                }}
              >
                Paso {step} de {maxSteps}
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              {step === 1
                ? 'Selecciona 1 de las 4 opciones para iniciar el impacto en tu negocio'
                : `Selecciona 1 opción para continuar la estrategia tras el paso ${step - 1}`}
            </p>
          </div>
        </div>

        {/* Acciones del Header: Info detallada, Deshacer y Finalizar temprano */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => handleOpenDetailModal(selectedDecision || decisions[0])}
            style={{
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '10px',
              padding: '7px 14px',
              color: '#38bdf8',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
            title="Ver información detallada de parámetros, pros, contras y riesgos"
          >
            <Info size={15} /> Info detallada
          </button>

          {canUndo && onUndo && (
            <button
              onClick={onUndo}
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '10px',
                padding: '7px 14px',
                color: '#fca5a5',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
              title="Deshacer la decisión del paso anterior y probar otra alternativa"
            >
              <Undo2 size={15} /> Deshacer decisión
            </button>
          )}

          {step > 1 && onFinishEarly && (
            <button
              onClick={onFinishEarly}
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '10px',
                padding: '7px 14px',
                color: '#6ee7b7',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              title="Concluir simulación con las decisiones tomadas hasta ahora"
            >
              <CheckCircle2 size={15} /> Finalizar aquí
            </button>
          )}
        </div>
      </div>

      {/* Camino recorrido (Breadcrumbs de decisiones previas) */}
      {pathHistory.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '18px',
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: '10px',
            overflowX: 'auto',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', flexShrink: 0 }}>
            Camino:
          </span>
          {pathHistory.map((h, i) => (
            <React.Fragment key={i}>
              <span
                style={{
                  fontSize: '0.8rem',
                  color: '#e2e8f0',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                  fontWeight: 500,
                }}
              >
                Paso {i + 1}: {h.decision.name}
              </span>
              <span style={{ color: '#475569', fontSize: '0.8rem' }}>→</span>
            </React.Fragment>
          ))}
          <span
            style={{
              fontSize: '0.8rem',
              color: '#38bdf8',
              fontWeight: 700,
              whiteSpace: 'nowrap',
            }}
          >
            Paso {step} (En selección)
          </span>
        </div>
      )}

      {/* Loading state mientras la IA o motor genera la siguiente ronda de 4 decisiones */}
      {isGeneratingNext ? (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '14px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '16px',
            border: '1px dashed rgba(56, 189, 248, 0.3)',
          }}
        >
          <Loader2 size={36} className="spin-animation" style={{ color: '#38bdf8' }} />
          <div>
            <div style={{ color: '#ffffff', fontWeight: 600, fontSize: '1.05rem', marginBottom: '4px' }}>
              Generando 4 nuevas decisiones estratégicas con IA...
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
              Analizando el nuevo estado de tu negocio y proyectando alternativas para el Paso {step}.
            </div>
          </div>
        </div>
      ) : (
        /* Grid de 4 Tarjetas de Decisión */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          {decisions.slice(0, 4).map((dec, idx) => {
            const isSelected = selectedDecisionId === dec.id;
            const { icon: Icon, color, bg } = getDecisionVisuals(dec);

            return (
              <div
                key={dec.id}
                onClick={() => onSelectDecision(dec)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 18px',
                  borderRadius: '14px',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.5) 0%, rgba(30, 41, 59, 0.8) 100%)'
                    : 'rgba(18, 26, 44, 0.65)',
                  border: isSelected
                    ? '2px solid #38bdf8'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isSelected
                    ? '0 0 25px -4px rgba(56, 189, 248, 0.45), 0 8px 20px rgba(0,0,0,0.5)'
                    : '0 4px 12px rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'rgba(28, 38, 62, 0.8)';
                    e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'rgba(18, 26, 44, 0.65)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateY(0px)';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: color,
                      flexShrink: 0,
                      boxShadow: isSelected ? `0 0 12px ${color}66` : 'none',
                    }}
                  >
                    <Icon size={21} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', marginBottom: '3px' }}>
                      {dec.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.3 }}>
                      {dec.description.length > 55
                        ? dec.description.slice(0, 52) + '...'
                        : dec.description}
                    </div>
                    {/* Chip de costo y categoría */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          background: 'rgba(255, 255, 255, 0.06)',
                          color: '#cbd5e1',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {dec.oneTimeCost > 0 ? `Inversión: ${moneda} ${dec.oneTimeCost}` : 'Costo $0'}
                      </span>
                      {dec.demandLift?.end > 0 && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#6ee7b7',
                            padding: '1px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          +{Math.round(dec.demandLift.end)}% demanda
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botones de Acción: Info detallada y Flecha de selección */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px', flexShrink: 0 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetailModal(dec);
                    }}
                    title="Ver detalles de la IA y comparativa"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#38bdf8';
                      e.currentTarget.style.borderColor = '#38bdf8';
                      e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#94a3b8';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                  >
                    <Info size={16} />
                  </button>

                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.06)',
                      color: isSelected ? '#0f172a' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isSelected ? '0 0 10px #38bdf8' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Barra de Aprobación de la Decisión Seleccionada */}
      {selectedDecision && !isGeneratingNext && (
        <div
          style={{
            marginTop: '18px',
            padding: '16px 20px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.12) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            boxShadow: '0 8px 25px -5px rgba(16, 185, 129, 0.2)',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Explorando consecuencias de:</span>
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>{selectedDecision.category.toUpperCase()}</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
              {selectedDecision.name}
            </div>
          </div>

          <button
            onClick={onApproveDecision}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 700,
              padding: '11px 22px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            <CheckCircle2 size={18} />
            <span>Aprobar decisión y avanzar</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Modal de Información Detallada de Decisiones IA y Redirección a Comparar Escenarios */}
      {isDetailModalOpen && currentModalDecision && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div
            style={{
              width: '740px',
              maxWidth: '96vw',
              maxHeight: '90vh',
              background: '#0b1329',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: '24px',
              padding: '28px',
              boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.85), 0 0 30px rgba(56, 189, 248, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecera del Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(99, 102, 241, 0.25))',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8',
                  }}
                >
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    Desglose Detallado de Decisiones (IA)
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '3px 0 0' }}>
                    Parámetros cuantitativos, riesgos proyectados y supuestos del modelo de negocio
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDetailModalOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                <X size={18} />
              </button>
            </div>

            {/* Selector de Pestañas entre las 4 decisiones disponibles */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                marginBottom: '18px',
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '6px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              {decisions.slice(0, 4).map((d, i) => {
                const isActive = currentModalDecision.id === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setModalActiveDecisionId(d.id)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: isActive ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid transparent',
                      background: isActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                      color: isActive ? '#38bdf8' : '#94a3b8',
                      fontSize: '0.78rem',
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'center',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      transition: 'all 0.2s',
                    }}
                    title={d.name}
                  >
                    {i + 1}. {d.name}
                  </button>
                );
              })}
            </div>

            {/* BANNER SOLICITADO: Direccionamiento a "Comparar Escenarios" */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.45) 0%, rgba(15, 23, 42, 0.85) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                borderRadius: '16px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                marginBottom: '20px',
                boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.4)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'rgba(56, 189, 248, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#38bdf8',
                    flexShrink: 0,
                  }}
                >
                  <Layers size={22} />
                </div>
                <div>
                  <div style={{ color: '#ffffff', fontSize: '0.92rem', fontWeight: 700, marginBottom: '2px' }}>
                    ¿Deseas ver una comparativa profunda entre estas 4 opciones?
                  </div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.4 }}>
                    Para obtener un análisis aún más detallado, ver el ranking matemático ponderado (#1 al #4), el punto de divergencia temporal y el retorno de inversión (Payback) frente a frente, <strong>ve al apartado «Comparar Escenarios»</strong>.
                  </div>
                </div>
              </div>

              {onNavigateToCompare && (
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    onNavigateToCompare();
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 0 16px rgba(59, 130, 246, 0.4)',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                >
                  <span>Ir a Comparar Escenarios</span>
                  <ArrowRight size={15} />
                </button>
              )}
            </div>

            {/* Detalles de la Decisión Seleccionada */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Encabezado de la Decisión */}
              <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '16px 18px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#38bdf8',
                      background: 'rgba(56, 189, 248, 0.15)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                    }}
                  >
                    Categoría: {currentModalDecision.category}
                  </span>
                  {currentModalDecision.requiresFinancing && (
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#fbbf24',
                        background: 'rgba(245, 158, 11, 0.15)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                      }}
                    >
                      Requiere Financiamiento
                    </span>
                  )}
                </div>
                <h4 style={{ color: '#ffffff', fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>
                  {currentModalDecision.name}
                </h4>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.45, margin: 0 }}>
                  {currentModalDecision.description}
                </p>
              </div>

              {/* Grid de Parámetros Cuantitativos y Financieros */}
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Parámetros Cuantitativos Proyectados por la IA:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Inversión Inicial (Mes 1)</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                      {moneda} {currentModalDecision.oneTimeCost.toLocaleString()}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Costos Fijos Mensuales</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: currentModalDecision.fixedDelta > 0 ? '#f87171' : '#4ade80', marginTop: '2px' }}>
                      {currentModalDecision.fixedDelta >= 0 ? '+' : ''}{moneda} {currentModalDecision.fixedDelta.toLocaleString()} / mes
                    </div>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Pauta de Marketing</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
                      +{moneda} {currentModalDecision.marketingDelta.toLocaleString()} / mes
                    </div>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Ajuste de Precios</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: currentModalDecision.priceChangePct >= 0 ? '#4ade80' : '#fb923c', marginTop: '2px' }}>
                      {currentModalDecision.priceChangePct >= 0 ? '+' : ''}{currentModalDecision.priceChangePct}%
                    </div>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Impacto en Demanda</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#4ade80', marginTop: '2px' }}>
                      +{Math.round(currentModalDecision.demandLift?.end || 0)}% (Curva {currentModalDecision.demandLift?.curve || 'linear'})
                    </div>
                  </div>

                  <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Capacidad Operativa</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: currentModalDecision.capacityChangePct >= 0 ? '#4ade80' : '#94a3b8', marginTop: '2px' }}>
                      {currentModalDecision.capacityChangePct >= 0 ? '+' : ''}{currentModalDecision.capacityChangePct}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Pros y Contras */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {/* Pros */}
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4ade80', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={16} /> Ventajas Estratégicas (Pros):
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#e2e8f0', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(currentModalDecision.pros && currentModalDecision.pros.length > 0
                      ? currentModalDecision.pros
                      : ['Impacto inmediato en la captación de clientes', 'Aprovechamiento de la estructura existente']
                    ).map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>

                {/* Contras */}
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f87171', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={16} /> Desventajas y Coste de Oportunidad (Cons):
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#e2e8f0', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(currentModalDecision.cons && currentModalDecision.cons.length > 0
                      ? currentModalDecision.cons
                      : ['Requiere disciplina en el control de gastos', 'Menor margen unitario a corto plazo']
                    ).map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Riesgos y Supuestos */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {/* Riesgos */}
                <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24', marginBottom: '8px' }}>
                    ⚠️ Riesgos Identificados por la IA:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#fde68a', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(currentModalDecision.risks && currentModalDecision.risks.length > 0
                      ? currentModalDecision.risks
                      : ['Respuesta competitiva si se prolonga la medida', 'Presión temporal en el flujo de caja']
                    ).map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>

                {/* Supuestos */}
                <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>
                    🔍 Supuestos Clave del Modelo:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {(currentModalDecision.assumptions && currentModalDecision.assumptions.length > 0
                      ? currentModalDecision.assumptions
                      : [{ text: 'Demanda del mercado responde de forma gradual', confidence: 'alta' as const }]
                    ).map((a, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#e2e8f0' }}>
                        <span>• {a.text}</span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: a.confidence === 'alta' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                            color: a.confidence === 'alta' ? '#4ade80' : '#fbbf24',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                          }}
                        >
                          Confianza {a.confidence}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones del Footer del Modal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  padding: '9px 18px',
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Cerrar
              </button>

              <button
                onClick={() => {
                  onSelectDecision(currentModalDecision);
                  setIsDetailModalOpen(false);
                }}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  padding: '9px 20px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
                }}
              >
                <Check size={16} />
                <span>Explorar esta Decisión en el Tablero</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
