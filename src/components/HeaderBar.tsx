import React from 'react';
import { RotateCcw, Activity } from 'lucide-react';

interface HeaderBarProps {
  currentHorizonIndex: number; // 0 = Inicio, 1 = Corto plazo, 2 = Mediano plazo, 3 = Largo plazo
  onSelectHorizon?: (index: number) => void;
  onReset: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentHorizonIndex = 0,
  onSelectHorizon,
  onReset,
}) => {
  const steps = [
    { label: 'Inicio', sublabel: '' },
    { label: 'Corto plazo', sublabel: '(1 mes)' },
    { label: 'Mediano plazo', sublabel: '(3-6 meses)' },
    { label: 'Largo plazo', sublabel: '(12 meses)' },
  ];

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        marginBottom: '20px',
      }}
    >
      {/* Badge Estado */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '999px',
          background: 'rgba(56, 189, 248, 0.12)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          color: '#38bdf8',
          fontSize: '0.825rem',
          fontWeight: 600,
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#38bdf8',
            boxShadow: '0 0 10px #38bdf8',
          }}
        />
        <span>Simulación en curso</span>
      </div>

      {/* Stepper Timeline */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px', position: 'relative' }}>
        {steps.map((step, idx) => {
          const isActive = idx === currentHorizonIndex;
          const isPassed = idx < currentHorizonIndex;

          return (
            <div
              key={idx}
              onClick={() => onSelectHorizon?.(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: onSelectHorizon ? 'pointer' : 'default',
              }}
            >
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? '#38bdf8' : isPassed ? '#3b82f6' : '#334155',
                  boxShadow: isActive ? '0 0 12px #38bdf8' : 'none',
                  transition: 'all 0.25s',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#ffffff' : '#94a3b8',
                  }}
                >
                  {step.label}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  style={{
                    width: '36px',
                    height: '2px',
                    backgroundColor: isPassed ? '#3b82f6' : '#1e293b',
                    marginLeft: '8px',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Botón Reiniciar */}
      <button
        onClick={onReset}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'rgba(30, 41, 59, 0.5)',
          color: '#cbd5e1',
          fontSize: '0.85rem',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
          e.currentTarget.style.color = '#fca5a5';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.5)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
          e.currentTarget.style.color = '#cbd5e1';
        }}
      >
        <RotateCcw size={15} />
        <span>Reiniciar</span>
      </button>
    </header>
  );
};
