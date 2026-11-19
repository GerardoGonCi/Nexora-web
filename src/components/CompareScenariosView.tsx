import React from 'react';
import {
  Layers,
  Award,
  TrendingUp,
  AlertTriangle,
  Clock,
  DollarSign,
  Smile,
  Shield,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import {
  NormalizedProfile,
  Decision,
  ComparisonResult,
} from '../core/types/index';
import { comparePaths } from '../core/compare/metrics';

interface CompareScenariosViewProps {
  profile: NormalizedProfile;
  decisions: Decision[];
  onSelectDecision?: (decision: Decision) => void;
}

export const CompareScenariosView: React.FC<CompareScenariosViewProps> = ({
  profile,
  decisions,
  onSelectDecision,
}) => {
  const comparison: ComparisonResult = comparePaths(
    profile,
    decisions,
    profile.horizonte
  );

  const { ranking, divergencePoints, usedWeights, sinCambios } = comparison;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Banner de Ponderación según Objetivo */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
            <Award size={16} /> Ranking Ponderado de Estrategias
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
            Objetivo Prioritario: {profile.objetivoPrioritario.toUpperCase()}
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', maxWidth: '650px' }}>
            Las opciones han sido ordenadas matemáticamente según el objetivo que definiste en el caso de negocio.
          </p>
        </div>

        {/* Pesos Utilizados Transparentes */}
        <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '14px 18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
            Pesos matemáticos aplicados:
          </div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem' }}>
            {Object.entries(usedWeights).map(([key, weight]) => (
              <span key={key} style={{ color: '#38bdf8' }}>
                {key}: <strong>{Math.round(weight * 100)}%</strong>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de Escenarios Comparados */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {ranking.map((path, idx) => {
          const matchedDecision = decisions.find((d) => d.id === path.decisionId);
          const isTop = idx === 0;
          const divergenceMonth = divergencePoints[path.decisionId];

          return (
            <div
              key={path.decisionId}
              className="glass-card-interactive"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: isTop ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isTop ? '0 0 25px -4px rgba(56, 189, 248, 0.35)' : 'none',
                position: 'relative',
              }}
            >
              {/* Badge de Posición */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div
                  style={{
                    padding: '4px 12px',
                    borderRadius: '999px',
                    background: isTop ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.06)',
                    border: isTop ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                    color: isTop ? '#38bdf8' : '#94a3b8',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                  }}
                >
                  #{idx + 1} {isTop ? 'Mejor Opción' : 'Alternativa'}
                </div>

                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  Score: <strong style={{ color: '#fff' }}>{(path.score * 100).toFixed(0)} pts</strong>
                </div>
              </div>

              {/* Título de la Decisión */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
                  {path.decisionName}
                </h4>
                {matchedDecision && (
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.35 }}>
                    {matchedDecision.description}
                  </p>
                )}
              </div>

              {/* Métricas Principales */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Beneficio Acumulado</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: path.beneficioAcumulado >= 0 ? '#4ade80' : '#f87171' }}>
                    {profile.moneda} {path.beneficioAcumulado.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#38bdf8' }}>
                    {path.difVsSinCambios.beneficioAcumulado >= 0 ? '+' : ''}
                    {profile.moneda} {path.difVsSinCambios.beneficioAcumulado.toLocaleString()} vs base
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Caja Mínima</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: path.cajaMinima >= 0 ? '#ffffff' : '#f87171' }}>
                    {profile.moneda} {path.cajaMinima.toLocaleString()}
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Clientes Finales</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                    {path.clientesFinales.toLocaleString()}
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '10px 12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Satisfacción Final</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#4ade80' }}>
                    {Math.round(path.satisfaccionFinal)}%
                  </div>
                </div>
              </div>

              {/* Punto de Divergencia & Payback */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Punto de divergencia (&gt;5%):</span>
                  <strong style={{ color: divergenceMonth ? '#38bdf8' : '#64748b' }}>
                    {divergenceMonth ? `Mes ${divergenceMonth}` : 'Sin divergencia'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Recuperación inversión (Payback):</span>
                  <strong style={{ color: path.paybackMonth ? '#fbbf24' : '#64748b' }}>
                    {path.paybackMonth ? `Mes ${path.paybackMonth}` : 'Inmediato / Sin costo'}
                  </strong>
                </div>
              </div>

              {/* Botón Aplicar en Dashboard */}
              {onSelectDecision && matchedDecision && (
                <button
                  onClick={() => onSelectDecision(matchedDecision)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: isTop ? '#3b82f6' : 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <span>Seleccionar esta Estrategia</span>
                  <ArrowRight size={15} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
