import React from 'react';
import {
  Home,
  GitBranch,
  Layers,
  Bot,
  Sparkles,
  BookOpen
} from 'lucide-react';

export type ActiveTab = 'inicio' | 'arbol' | 'comparar' | 'analista' | 'aprende';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  hasActiveSimulation: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  hasActiveSimulation,
}) => {
  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'arbol', label: 'Árbol de consecuencias', icon: GitBranch },
    { id: 'comparar', label: 'Comparar escenarios', icon: Layers },
    { id: 'analista', label: 'Analista IA', icon: Bot },
    { id: 'aprende', label: 'Aprende', icon: BookOpen },
  ] as const;

  return (
    <aside
      style={{
        width: '260px',
        minWidth: '260px',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-card)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        height: '100vh',
        userSelect: 'none',
      }}
    >
      <div>
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', paddingLeft: '8px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(139, 92, 246, 0.35))',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px -2px rgba(56, 189, 248, 0.4)',
            }}
          >
            {/* Butterfly SVG Icon with glowing wings */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: 'drop-shadow(0 0 6px #38bdf8)' }}
            >
              <path
                d="M12 4C10.5 2.5 7 1.5 4 3.5C1 5.5 1.5 11 5 13C8 14.5 11 11.5 12 10.5M12 4C13.5 2.5 17 1.5 20 3.5C23 5.5 22.5 11 19 13C16 14.5 13 11.5 12 10.5M12 4V19M12 19C11 17.5 8 16 5 18C2.5 19.5 3 22.5 5 22.5C8 22.5 10.5 19.5 12 19ZM12 19C13 17.5 16 16 19 18C21.5 19.5 21 22.5 19 22.5C16 22.5 13.5 19.5 12 19Z"
                stroke="#38bdf8"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="rgba(56, 189, 248, 0.2)"
              />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Nexora
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', lineHeight: 1.1 }}>
              Efecto Mariposa
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>
              Toma decisiones sin arriesgar
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: isActive ? '#3b82f6' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 0 20px -3px rgba(59, 130, 246, 0.5)' : 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#f1f5f9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                <Icon size={19} color={isActive ? '#ffffff' : '#64748b'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Glowing Card */}
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '14px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          boxShadow: '0 8px 24px -6px rgba(0,0,0,0.5)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-20px',
            width: '60px',
            height: '60px',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, transparent 70%)',
          }}
        />
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ marginBottom: '8px', filter: 'drop-shadow(0 0 8px #38bdf8)' }}
        >
          <path
            d="M12 4C10.5 2.5 7 1.5 4 3.5C1 5.5 1.5 11 5 13C8 14.5 11 11.5 12 10.5M12 4C13.5 2.5 17 1.5 20 3.5C23 5.5 22.5 11 19 13C16 14.5 13 11.5 12 10.5M12 4V19M12 19C11 17.5 8 16 5 18C2.5 19.5 3 22.5 5 22.5C8 22.5 10.5 19.5 12 19ZM12 19C13 17.5 16 16 19 18C21.5 19.5 21 22.5 19 22.5C16 22.5 13.5 19.5 12 19Z"
            stroke="#38bdf8"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="rgba(56, 189, 248, 0.25)"
          />
        </svg>
        <p style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.3', fontWeight: 500 }}>
          «Una pequeña decisión puede generar un gran cambio...»
        </p>
      </div>
    </aside>
  );
};
