import React, { useState } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('inicio');

  return (
    <div className="app-container">
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        hasActiveSimulation={false}
      />
      <main className="main-content">
        <div style={{ padding: '20px' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Bienvenido a Nexora</h1>
          <p style={{ color: 'var(--text-muted)' }}>Cargando entorno de simulación...</p>
        </div>
      </main>
    </div>
  );
};

export default App;
