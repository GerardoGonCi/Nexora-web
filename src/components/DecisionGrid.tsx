import React from 'react';
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
  Wrench,
  DollarSign
} from 'lucide-react';
import { Decision } from '../core/types/index';

interface DecisionGridProps {
  decisions: Decision[];
  selectedDecisionId: string | null;
  onSelectDecision: (decision: Decision) => void;
}

export const DecisionGrid: React.FC<DecisionGridProps> = ({
  decisions,
  selectedDecisionId,
  onSelectDecision,
}) => {
  // Helper para asignar icono y color según categoría o nombre
  const getDecisionVisuals = (dec: Decision, index: number) => {
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
      {/* Título de la Sección */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Toma tu decisión
              <span style={{ fontSize: '1rem' }}>✨</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              ¿Qué estrategia quieres aplicar?
            </p>
          </div>
        </div>

        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
          {decisions.length} opciones analizadas por IA
        </div>
      </div>

      {/* Grid de 6 Tarjetas de Decisión */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
        {decisions.slice(0, 6).map((dec, idx) => {
          const isSelected = selectedDecisionId === dec.id;
          const { icon: Icon, color, bg } = getDecisionVisuals(dec, idx);

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
                    {dec.description.length > 40
                      ? dec.description.slice(0, 38) + '...'
                      : dec.description}
                  </div>
                </div>
              </div>

              {/* Botón flecha */}
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.06)',
                  color: isSelected ? '#0f172a' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginLeft: '12px',
                  boxShadow: isSelected ? '0 0 10px #38bdf8' : 'none',
                  transition: 'all 0.2s',
                }}
              >
                <ArrowRight size={15} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
