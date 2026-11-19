import React from 'react';
import { BarChart3 } from 'lucide-react';
import { SimulationResult, NormalizedProfile } from '../core/types/index';

interface EvolutionChartProps {
  simResult: SimulationResult | null;
  profile: NormalizedProfile;
}

export const EvolutionChart: React.FC<EvolutionChartProps> = ({
  simResult,
  profile,
}) => {
  const months = simResult?.base.months || [];
  const moneda = profile.moneda;

  // Si no hay simulación corrida, mostrar curva proyectada de ejemplo
  const dataPoints =
    months.length >= 6
      ? [
          months[0].beneficio,
          months[Math.floor(months.length / 2)].beneficio,
          months[months.length - 1].beneficio,
        ]
      : [profile.derivatives.beneficioMensual, 6200, 7433];

  const finalValue = Math.round(dataPoints[2]);

  // Dimensiones del gráfico SVG
  const width = 480;
  const height = 110;
  const paddingX = 40;
  const paddingY = 20;

  const minVal = Math.min(...dataPoints) * 0.9;
  const maxVal = Math.max(...dataPoints) * 1.1;

  const getX = (idx: number) => paddingX + (idx / 2) * (width - 2 * paddingX);
  const getY = (val: number) =>
    height - paddingY - ((val - minVal) / (maxVal - minVal || 1)) * (height - 2 * paddingY);

  const p0 = { x: getX(0), y: getY(dataPoints[0]) };
  const p1 = { x: getX(1), y: getY(dataPoints[1]) };
  const p2 = { x: getX(2), y: getY(dataPoints[2]) };

  // Curva bezier suave
  const pathD = `M ${p0.x} ${p0.y} Q ${(p0.x + p1.x) / 2} ${p1.y}, ${p1.x} ${p1.y} T ${p2.x} ${p2.y}`;

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
      }}
    >
      {/* Título */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <BarChart3 size={20} color="#fbbf24" />
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>
          Evolución del negocio
        </h4>
      </div>

      {/* Sublabels de Horizontes */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 20px',
          color: '#94a3b8',
          fontSize: '0.78rem',
          marginBottom: '10px',
        }}
      >
        <span>Corto plazo (1 mes)</span>
        <span>Mediano plazo (3-6 meses)</span>
        <span>Largo plazo ({simResult?.horizon || 12} meses)</span>
      </div>

      {/* SVG Line Chart */}
      <div style={{ position: 'relative', width: '100%', height: `${height}px` }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          {/* Líneas tenues de cuadrícula */}
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />

          {/* Sombra / Gradiente bajo la curva */}
          <path
            d={`${pathD} L ${p2.x} ${height - paddingY} L ${p0.x} ${height - paddingY} Z`}
            fill="url(#curveGradient)"
            opacity="0.3"
          />

          {/* Curva principal */}
          <path
            d={pathD}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3.5"
            style={{ filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.6))' }}
          />

          {/* Puntos en la curva */}
          <circle cx={p0.x} cy={p0.y} r="5" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
          <circle cx={p1.x} cy={p1.y} r="5" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
          <circle cx={p2.x} cy={p2.y} r="6" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />

          {/* Gradiente defs */}
          <defs>
            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Pill con valor final proyectado (idéntico a la imagen S/ 7,433) */}
        <div
          style={{
            position: 'absolute',
            right: '25px',
            top: '8px',
            background: 'rgba(30, 58, 138, 0.95)',
            border: '1px solid #38bdf8',
            borderRadius: '999px',
            padding: '3px 10px',
            color: '#ffffff',
            fontSize: '0.78rem',
            fontWeight: 700,
            boxShadow: '0 0 12px rgba(56, 189, 248, 0.5)',
          }}
        >
          {moneda} {finalValue.toLocaleString()}
        </div>
      </div>
    </div>
  );
};
