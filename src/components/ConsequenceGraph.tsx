import React, { useState } from 'react';
import {
  Network,
  List,
  Megaphone,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  GitBranch,
  ArrowRight
} from 'lucide-react';
import { Decision, SimulationResult, NormalizedProfile } from '../core/types/index';

interface ConsequenceGraphProps {
  decision: Decision | null;
  simResult: SimulationResult | null;
  profile: NormalizedProfile;
}

export const ConsequenceGraph: React.FC<ConsequenceGraphProps> = ({
  decision,
  simResult,
  profile,
}) => {
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');

  if (!decision) {
    return (
      <div
        style={{
          background: 'rgba(16, 23, 38, 0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '24px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          textAlign: 'center',
        }}
      >
        <Network size={40} style={{ opacity: 0.4, marginBottom: '12px' }} />
        <h4 style={{ color: '#cbd5e1', marginBottom: '6px' }}>Explora las consecuencias</h4>
        <p style={{ fontSize: '0.85rem' }}>Selecciona una decisión a la izquierda para ver su ramificación predictiva.</p>
      </div>
    );
  }

  // Métricas derivadas de la simulación
  const baseRun = simResult?.base;
  const optimistaRun = simResult?.optimista;
  const pesimistaRun = simResult?.pesimista;

  const liftEsperado = Math.round(decision.demandLift.end);
  const liftPesimista = Math.max(1, Math.round(liftEsperado * 0.4));

  const beneficioBaseFinal = baseRun?.summary.beneficioFinal ?? 0;
  const beneficioOptimista = optimistaRun?.summary.beneficioFinal ?? beneficioBaseFinal * 1.25;

  return (
    <div
      style={{
        background: 'rgba(16, 23, 38, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '24px 26px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxShadow: '0 12px 30px -10px rgba(0,0,0,0.5)',
      }}
    >
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(99, 102, 241, 0.25))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
            }}
          >
            <GitBranch size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
              ¿Qué podría pasar?
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Explora las consecuencias de tu decisión
            </p>
          </div>
        </div>

        {/* Toggle Vista */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(30, 41, 59, 0.6)',
            padding: '4px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', paddingLeft: '6px' }}>Vista</span>
          <button
            onClick={() => setViewMode('tree')}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'tree' ? '#3b82f6' : 'transparent',
              color: viewMode === 'tree' ? '#ffffff' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Network size={15} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: 'none',
              background: viewMode === 'list' ? '#3b82f6' : 'transparent',
              color: viewMode === 'list' ? '#ffffff' : '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Contenido Visual Árbol de Consecuencias (idéntico a la imagen) */}
      {viewMode === 'tree' ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            padding: '10px 0',
          }}
        >
          {/* Nodo Izquierdo: Decisión seleccionada */}
          <div
            style={{
              width: '140px',
              height: '110px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.8), rgba(30, 41, 59, 0.95))',
              border: '2px solid #3b82f6',
              boxShadow: '0 0 25px -3px rgba(59, 130, 246, 0.45)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '12px',
              zIndex: 2,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
                marginBottom: '6px',
              }}
            >
              <Megaphone size={18} />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
              {decision.name}
            </span>
          </div>

          {/* Curvas Conectoras SVG */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: '140px',
              width: '80px',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {/* Rama Superior (Verde) */}
            <path
              d="M 0,110 C 40,110 40,55 80,55"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
            {/* Rama Inferior (Naranja/Rojo) */}
            <path
              d="M 0,110 C 40,110 40,165 80,165"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeDasharray="4 2"
            />
          </svg>

          {/* Ramas Derechas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', flex: 1, marginLeft: '90px' }}>
            {/* Rama 1: Éxito / Campaña efectiva */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  background: 'rgba(34, 197, 94, 0.15)',
                  border: '1px solid rgba(34, 197, 94, 0.4)',
                  borderRadius: '999px',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#4ade80',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                <CheckCircle2 size={16} />
                <span>Campaña efectiva (+{liftEsperado}% clientes)</span>
              </div>

              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(20, 83, 45, 0.4), rgba(15, 23, 42, 0.8))',
                  border: '1px solid rgba(34, 197, 94, 0.35)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flex: 1,
                }}
              >
                <div style={{ color: '#4ade80' }}>
                  <TrendingUp size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                    Crecimiento sostenible
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#86efac' }}>
                    Mayor rentabilidad (+{profile.moneda} {Math.round(beneficioOptimista - (baseRun?.summary.beneficioFinal ?? 0))})
                  </div>
                </div>
              </div>
            </div>

            {/* Rama 2: Poco efectiva / Riesgo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: '999px',
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#fbbf24',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                <AlertTriangle size={16} />
                <span>Campaña poco efectiva (+{liftPesimista}% clientes)</span>
              </div>

              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(120, 53, 15, 0.4), rgba(15, 23, 42, 0.8))',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flex: 1,
                }}
              >
                <div style={{ color: '#fbbf24' }}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                    Rentabilidad en riesgo
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#fde68a' }}>
                    Revisa tu estrategia de costos
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Vista de Lista Detallada */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
            <div style={{ fontWeight: 600, color: '#4ade80', fontSize: '0.88rem', marginBottom: '4px' }}>
              ✓ Escenario Optimista
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              Demanda crece +{liftEsperado}% superando el punto de equilibrio en el mes 2. Aumento de clientes recurrentes.
            </div>
          </div>
          <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ fontWeight: 600, color: '#fbbf24', fontSize: '0.88rem', marginBottom: '4px' }}>
              ⚠️ Escenario Pesimista
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              El costo de adquisición supera el retorno inmediato. Se requerirá absorber {profile.moneda} {decision.oneTimeCost} en el mes 1.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
