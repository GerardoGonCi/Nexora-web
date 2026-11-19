import React from 'react';
import { Users, Coins, TrendingUp, Smile } from 'lucide-react';
import { NormalizedProfile, SimulationMonthState } from '../core/types/index';

interface BusinessBannerProps {
  profile: NormalizedProfile;
  currentState?: SimulationMonthState;
}

export const BusinessBanner: React.FC<BusinessBannerProps> = ({
  profile,
  currentState,
}) => {
  const d = profile.derivatives;
  const isSimulated = Boolean(currentState && currentState.t > 0);

  // Valores a mostrar (o actuales de la simulación o base del negocio)
  const ingresos = currentState ? currentState.ingresos : d.ingresos;
  const beneficio = currentState ? currentState.beneficio : d.beneficioMensual;
  const satisfaccion = currentState ? currentState.satisfaccion : profile.satisfaccionBase;
  const clientesMes = currentState ? currentState.atendidos : profile.clientesPorMes;
  const clientesDiarios = Math.round(clientesMes / 30);

  const tendenciaPct = profile.tendenciaUltimos3Meses.porcentaje;
  const tendenciaTipo = profile.tendenciaUltimos3Meses.tipo;

  const negocioTitulo =
    profile.rubro === 'gastronomia'
      ? 'Tu Cafetería'
      : profile.rubro === 'comercio'
      ? 'Tu Comercio'
      : profile.rubro === 'servicios'
      ? 'Tu Agencia de Servicios'
      : `Tu Negocio (${profile.rubro})`;

  const descripcion =
    profile.descripcionLibre ||
    'Las ventas han presentado variaciones en las últimas semanas. Es momento de tomar una decisión estratégica.';

  return (
    <div
      style={{
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative',
        marginBottom: '24px',
        background: 'linear-gradient(180deg, rgba(20, 28, 48, 0.85) 0%, rgba(12, 17, 30, 0.95) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 16px 36px -12px rgba(0, 0, 0, 0.7)',
      }}
    >
      {/* Background Image / Cafe atmosphere gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '140px',
          backgroundImage:
            'radial-gradient(ellipse at top left, rgba(245, 158, 11, 0.18), transparent 60%), radial-gradient(ellipse at top right, rgba(56, 189, 248, 0.15), transparent 50%), linear-gradient(180deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.95) 100%)',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, padding: '24px 28px' }}>
        {/* Cabecera del Negocio */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '22px' }}>
          {/* Thumbnail del local */}
          <div
            style={{
              width: '90px',
              height: '68px',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'linear-gradient(135deg, #78350f, #1e293b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '1.8rem' }}>
              {profile.rubro === 'gastronomia' ? '☕' : profile.rubro === 'comercio' ? '🛍️' : '💼'}
            </span>
          </div>

          <div>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
              {negocioTitulo}
            </h2>
            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', maxWidth: '650px', lineHeight: 1.4 }}>
              {descripcion}
            </p>
          </div>
        </div>

        {/* 4 Chips de KPIs Principales */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {/* Chip 1: Clientes diarios */}
          <div
            style={{
              background: 'rgba(18, 26, 44, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(6, 182, 212, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#22d3ee',
                flexShrink: 0,
              }}
            >
              <Users size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500, marginBottom: '2px' }}>
                Clientes diarios
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff' }}>
                  {clientesDiarios}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '6px',
                    backgroundColor:
                      tendenciaTipo === 'cayendo'
                        ? 'rgba(239, 68, 68, 0.2)'
                        : 'rgba(34, 197, 94, 0.2)',
                    color: tendenciaTipo === 'cayendo' ? '#f87171' : '#4ade80',
                  }}
                >
                  {tendenciaTipo === 'cayendo' ? `-${tendenciaPct}%` : `+${tendenciaPct}%`}
                </span>
              </div>
            </div>
          </div>

          {/* Chip 2: Ingresos mensuales */}
          <div
            style={{
              background: 'rgba(18, 26, 44, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fbbf24',
                flexShrink: 0,
              }}
            >
              <Coins size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500, marginBottom: '2px' }}>
                Ingresos mensuales
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff' }}>
                {profile.moneda} {ingresos.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Chip 3: Beneficio actual */}
          <div
            style={{
              background: 'rgba(18, 26, 44, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
                flexShrink: 0,
              }}
            >
              <TrendingUp size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500, marginBottom: '2px' }}>
                Beneficio actual
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff' }}>
                {profile.moneda} {beneficio.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Chip 4: Satisfacción */}
          <div
            style={{
              background: 'rgba(18, 26, 44, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4ade80',
                flexShrink: 0,
              }}
            >
              <Smile size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500, marginBottom: '2px' }}>
                Satisfacción
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff' }}>
                {Math.round(satisfaccion)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
