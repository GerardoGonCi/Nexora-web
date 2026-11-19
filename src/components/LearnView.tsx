import React from 'react';
import { BookOpen, Sparkles, Cpu, Layers, GitBranch, ArrowRight } from 'lucide-react';

export const LearnView: React.FC = () => {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      {/* Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '28px 32px',
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '8px' }}>
          <BookOpen size={16} /> Filosofía del Sistema
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>
          ¿Qué es el «Efecto Mariposa» en los Negocios?
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.5 }}>
          En sistemas dinámicos empresariales, una pequeña alteración de un parámetro (ej. bajar 5% un precio o demorar 1 mes una contratación) desencadena efectos no lineales en la capacidad, la satisfacción y la liquidez meses después.
        </p>
      </div>

      {/* 3 Principios Fundamentales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', marginBottom: '12px' }}>
            <Cpu size={20} />
          </div>
          <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>1. Motor Determinista</h4>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.4 }}>
            El motor matemático calcula; la IA jamás devuelve resultados financieros. Misma entrada produce siempre el mismo resultado.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc', marginBottom: '12px' }}>
            <Sparkles size={20} />
          </div>
          <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>2. IA Asesora</h4>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.4 }}>
            La IA propone parámetros creativos y explica los resultados en lenguaje claro, con verificación estricta de cada cifra.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80', marginBottom: '12px' }}>
            <GitBranch size={20} />
          </div>
          <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>3. Efectos de 2° Orden</h4>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.4 }}>
            Colapsos por colas, fatiga publicitaria, desgaste del equipo y guerras de precios se modelan como eventos en cadena.
          </p>
        </div>
      </div>
    </div>
  );
};
