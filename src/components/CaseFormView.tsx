import React, { useState } from 'react';
import {
  Sparkles,
  Building2,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  ShieldAlert,
  ArrowRight,
  Coffee,
  ShoppingBag,
  Laptop,
  Key,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import {
  CaseFormInput,
  NormalizedProfile,
  DiagnosticLabel,
  Decision,
  Rubro,
  TipoOferta,
  TendenciaTipo,
  NivelCompetencia,
  ObjetivoPrioritario,
} from '../core/types/index';
import { validateCaseForm } from '../core/form/validate';
import { runRuleBasedDiagnosis } from '../core/diagnosis/rules';
import { getFallbackDecisions } from '../core/ai/fallbacks';
import { generateAiDecisions } from '../services/aiService';

interface CaseFormViewProps {
  onStartSimulation: (
    profile: NormalizedProfile,
    diagnosis: DiagnosticLabel[],
    decisions: Decision[],
    source?: 'openai' | 'fallback'
  ) => void;
}

export const PRESET_CAFETERIA: CaseFormInput = {
  rubro: 'gastronomia',
  tipoOferta: 'mixto',
  moneda: 'S/',
  descripcionLibre: 'Las ventas han disminuido en las últimas semanas. Es momento de tomar una decisión estratégica.',
  clientesPorMes: 2400, // ~80 clientes diarios
  ticketPromedio: 15.6, // 2400 * 15.6 = S/ 37,440 de ingresos mensuales
  tendenciaUltimos3Meses: { tipo: 'cayendo', porcentaje: 12 },
  estacionalidad: 'ninguna',
  costoVariablePct: 35, // CV = 13,104
  costosFijosMensuales: 16500, // fijos
  desgloseCostosFijos: { personal: 10000, alquiler: 5000, servicios: 1500 },
  marketingMensual: 1500,
  cuotasDeudaMensuales: 672, // Total costos = 13,104 + 16,500 + 1,500 + 672 = 31,776. Beneficio = S/ 5,664! Exacto como la imagen
  capacidadMaximaMes: 3000,
  numeroEmpleados: 6,
  nivelCompetencia: 'alta',
  cajaDisponible: 28000,
  satisfaccionClientes: 3.9, // 78% exacto como la imagen
  reputacion: 4.0,
  problemaPrincipal: {
    categoria: 'demanda',
    descripcion: 'Caída de tráfico peatonal en las últimas semanas',
  },
  objetivoPrioritario: 'rentabilidad',
  restricciones: ['no despedir'],
  horizonte: 12,
};

export const PRESET_COMERCIO: CaseFormInput = {
  rubro: 'comercio',
  tipoOferta: 'producto',
  moneda: '$',
  descripcionLibre: 'Boutique de moda urbana con desaceleración de ventas en tienda física.',
  clientesPorMes: 800,
  ticketPromedio: 45,
  tendenciaUltimos3Meses: { tipo: 'cayendo', porcentaje: 8 },
  estacionalidad: 'leve',
  costoVariablePct: 40,
  costosFijosMensuales: 10000,
  marketingMensual: 1200,
  capacidadMaximaMes: 1200,
  numeroEmpleados: 4,
  nivelCompetencia: 'media',
  cajaDisponible: 20000,
  satisfaccionClientes: 4.1,
  reputacion: 4.2,
  problemaPrincipal: {
    categoria: 'competencia',
    descripcion: 'Pérdida de cuota frente a cadenas de retail',
  },
  objetivoPrioritario: 'crecimiento',
  restricciones: ['no bajar precios'],
  horizonte: 12,
};

export const PRESET_SERVICIOS: CaseFormInput = {
  rubro: 'servicios',
  tipoOferta: 'servicio',
  moneda: 'USD',
  descripcionLibre: 'Agencia de software y marketing digital con cuellos de botella.',
  clientesPorMes: 30,
  ticketPromedio: 1200,
  tendenciaUltimos3Meses: { tipo: 'creciendo', porcentaje: 10 },
  estacionalidad: 'ninguna',
  costoVariablePct: 20,
  costosFijosMensuales: 18000,
  marketingMensual: 2500,
  capacidadMaximaMes: 35,
  numeroEmpleados: 8,
  nivelCompetencia: 'alta',
  cajaDisponible: 35000,
  satisfaccionClientes: 3.8,
  reputacion: 4.0,
  problemaPrincipal: {
    categoria: 'capacidad',
    descripcion: 'Horas extras del equipo y demoras en entregas',
  },
  objetivoPrioritario: 'estabilidad',
  restricciones: ['inversion maxima: 10000'],
  horizonte: 12,
};

export const PRESET_BLANCO: CaseFormInput = {
  rubro: 'gastronomia',
  tipoOferta: 'servicio',
  moneda: 'S/',
  descripcionLibre: '',
  clientesPorMes: 1000,
  ticketPromedio: 25,
  tendenciaUltimos3Meses: { tipo: 'estable', porcentaje: 0 },
  estacionalidad: 'ninguna',
  costoVariablePct: 30,
  costosFijosMensuales: 8000,
  desgloseCostosFijos: { personal: 5000, alquiler: 2000, servicios: 1000 },
  marketingMensual: 500,
  cuotasDeudaMensuales: 0,
  capacidadMaximaMes: 2000,
  numeroEmpleados: 3,
  nivelCompetencia: 'media',
  cajaDisponible: 10000,
  satisfaccionClientes: 4.0,
  reputacion: 4.0,
  problemaPrincipal: {
    categoria: 'demanda',
    descripcion: '',
  },
  objetivoPrioritario: 'rentabilidad',
  restricciones: [],
  horizonte: 12,
};

export const CaseFormView: React.FC<CaseFormViewProps> = ({ onStartSimulation }) => {
  const [form, setForm] = useState<CaseFormInput>(PRESET_CAFETERIA);
  const [activeSection, setActiveSection] = useState<'negocio' | 'ventas' | 'costos' | 'capacidad' | 'objetivos'>('negocio');
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleApplyPreset = (preset: CaseFormInput) => {
    setForm(preset);
    setErrors([]);
    setWarnings([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateCaseForm(form);

    if (!result.isValid || !result.profile) {
      setErrors(result.errors);
      setWarnings(result.warnings);
      return;
    }

    setWarnings(result.warnings);
    setErrors([]);
    setIsGenerating(true);

    try {
      // 1. Diagnóstico por reglas deterministas
      const diagnosis = runRuleBasedDiagnosis(result.profile);

      // 2. Generar decisiones con IA a través del backend
      const { decisions, source } = await generateAiDecisions(
        result.profile,
        diagnosis
      );

      // 3. Iniciar simulación y pasar al dashboard
      onStartSimulation(result.profile, diagnosis, decisions, source);
    } catch (err: any) {
      console.error('Error generando decisiones con IA:', err);
      const diagnosis = runRuleBasedDiagnosis(result.profile);
      const fallbackDecs = getFallbackDecisions(result.profile.rubro);
      onStartSimulation(result.profile, diagnosis, fallbackDecs, 'fallback');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '16px 0 40px' }}>
      {/* Banner Superior */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '20px',
          padding: '28px 32px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 12px 30px -10px rgba(0,0,0,0.6)',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '999px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', fontSize: '0.82rem', fontWeight: 600, marginBottom: '12px' }}>
            <Sparkles size={14} /> Simulador Determinista de Negocios
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Inicia tu Simulación Empresarial
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '600px', lineHeight: 1.5 }}>
            Ingresa los parámetros de tu empresa. El motor determinista calculará los impactos financieros y la IA propondrá decisiones estratégicas a la medida.
          </p>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Plantillas Rápidas
          </div>
          <button
            type="button"
            onClick={() => handleApplyPreset(PRESET_CAFETERIA)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              background: 'rgba(245, 158, 11, 0.1)',
              color: '#fde68a',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <Coffee size={16} color="#fbbf24" />
            <span>Tu Cafetería (Referencia)</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset(PRESET_COMERCIO)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              background: 'rgba(56, 189, 248, 0.08)',
              color: '#bae6fd',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <ShoppingBag size={16} color="#38bdf8" />
            <span>Comercio Minorista</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset(PRESET_SERVICIOS)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              background: 'rgba(139, 92, 246, 0.08)',
              color: '#e9d5ff',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <Laptop size={16} color="#a855f7" />
            <span>Agencia de Servicios</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyPreset(PRESET_BLANCO)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#f1f5f9',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <FileText size={16} color="#cbd5e1" />
            <span>Caso en Blanco (Tu negocio)</span>
          </button>
        </div>
      </div>

      {/* Tarjeta Informativa del Motor de IA en Backend */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          <Sparkles size={18} />
        </div>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Motor de Inteligencia Artificial (Backend Nexora)
            <span style={{ fontSize: '0.72rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: '999px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
              OpenAI Centralizado en Backend
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Las decisiones estratégicas son analizadas y formuladas por la API de OpenAI integrada en tu servidor backend.
          </div>
        </div>
      </div>

      {/* Modal Overlay de Generación con IA */}
      {isGenerating && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 15, 30, 0.88)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            color: '#fff',
          }}
        >
          <div
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '22px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 40px rgba(139, 92, 246, 0.7)',
            }}
          >
            <Sparkles size={36} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>
            Generando tu Simulación con IA...
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', maxWidth: '440px', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
            Procesando el caso con la IA del backend para formular 4 decisiones estratégicas cuantitativas a la medida...
          </p>
          <div style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 600 }}>
            ⚡ Calculando impactos, caja y satisfacción...
          </div>
        </div>
      )}

      {/* Navegación por pestañas del formulario */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
        {[
          { id: 'negocio', label: '1. Negocio', icon: Building2 },
          { id: 'ventas', label: '2. Ventas', icon: TrendingUp },
          { id: 'costos', label: '3. Costos y Caja', icon: DollarSign },
          { id: 'capacidad', label: '4. Capacidad', icon: Users },
          { id: 'objetivos', label: '5. Objetivos', icon: Target },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: isActive ? '1px solid #38bdf8' : '1px solid transparent',
                background: isActive ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: isActive ? '#38bdf8' : '#94a3b8',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px' }}>
          {/* SECCIÓN 1: NEGOCIO */}
          {activeSection === 'negocio' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Rubro del Negocio *
                </label>
                <select
                  value={form.rubro}
                  onChange={(e) => setForm({ ...form, rubro: e.target.value as Rubro })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                >
                  <option value="gastronomia">Gastronomía (Restaurante, Cafetería, Bar)</option>
                  <option value="comercio">Comercio (Tienda, Retail, E-commerce)</option>
                  <option value="servicios">Servicios (Agencias, Consultoría, Profesionales)</option>
                  <option value="manufactura">Manufactura (Taller, Producción)</option>
                  <option value="educacion">Educación (Cursos, Academias)</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Tipo de Oferta *
                </label>
                <select
                  value={form.tipoOferta}
                  onChange={(e) => setForm({ ...form, tipoOferta: e.target.value as TipoOferta })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                >
                  <option value="producto">Producto</option>
                  <option value="servicio">Servicio</option>
                  <option value="mixto">Mixto (Producto + Servicio)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Moneda *
                </label>
                <input
                  type="text"
                  value={form.moneda}
                  onChange={(e) => setForm({ ...form, moneda: e.target.value })}
                  placeholder="S/, USD, EUR, etc."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Nivel de Competencia *
                </label>
                <select
                  value={form.nivelCompetencia}
                  onChange={(e) => setForm({ ...form, nivelCompetencia: e.target.value as NivelCompetencia })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                >
                  <option value="baja">Baja (Pocos sustitutos cercanos)</option>
                  <option value="media">Media (Mercado competitivo regular)</option>
                  <option value="alta">Alta (Mucha presión y guerras de precio)</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Descripción Libre de la Situación (máx 500 caracteres)
                </label>
                <textarea
                  value={form.descripcionLibre || ''}
                  onChange={(e) => setForm({ ...form, descripcionLibre: e.target.value })}
                  rows={2}
                  maxLength={500}
                  placeholder="Describe brevemente el contexto o situación actual del negocio..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>
            </div>
          )}

          {/* SECCIÓN 2: VENTAS */}
          {activeSection === 'ventas' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                    Clientes o Pedidos por Mes *
                  </label>
                  {form.clientesPorMes > 0 && (
                    <span style={{ fontSize: '0.78rem', color: '#38bdf8' }}>
                      ≈ {(form.clientesPorMes / 30 >= 10 ? Math.round(form.clientesPorMes / 30) : (form.clientesPorMes / 30).toFixed(1))} clientes/día
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  min="1"
                  value={form.clientesPorMes}
                  onChange={(e) => setForm({ ...form, clientesPorMes: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                  required
                />
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px' }}>
                  💡 Si atiendes 1 cliente al día, ingresa <strong>30</strong> clientes al mes.
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Ticket Promedio ({form.moneda}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.ticketPromedio}
                  onChange={(e) => setForm({ ...form, ticketPromedio: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Tendencia de los Últimos 3 Meses *
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    value={form.tendenciaUltimos3Meses.tipo}
                    onChange={(e) => setForm({
                      ...form,
                      tendenciaUltimos3Meses: { ...form.tendenciaUltimos3Meses, tipo: e.target.value as TendenciaTipo }
                    })}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                  >
                    <option value="cayendo">Cayendo</option>
                    <option value="estable">Estable</option>
                    <option value="creciendo">Creciendo</option>
                  </select>
                  <input
                    type="number"
                    value={form.tendenciaUltimos3Meses.porcentaje}
                    onChange={(e) => setForm({
                      ...form,
                      tendenciaUltimos3Meses: { ...form.tendenciaUltimos3Meses, porcentaje: Number(e.target.value) }
                    })}
                    placeholder="%"
                    style={{ width: '80px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Estacionalidad
                </label>
                <select
                  value={form.estacionalidad || 'ninguna'}
                  onChange={(e) => setForm({ ...form, estacionalidad: e.target.value as any })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                >
                  <option value="ninguna">Ninguna (Demanda uniforme)</option>
                  <option value="leve">Leve (±5% oscilación)</option>
                  <option value="fuerte">Fuerte (±15% picos estacionales)</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2', padding: '12px 16px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', color: '#bae6fd' }}>Ingreso Mensual Base Estimado:</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#38bdf8' }}>
                  {form.moneda} {(form.clientesPorMes * form.ticketPromedio).toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* SECCIÓN 3: COSTOS Y CAJA */}
          {activeSection === 'costos' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Costo Variable (% de los ingresos) *
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.costoVariablePct}
                  onChange={(e) => setForm({ ...form, costoVariablePct: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Costos Fijos Mensuales ({form.moneda}) *
                </label>
                <input
                  type="number"
                  value={form.costosFijosMensuales}
                  onChange={(e) => setForm({ ...form, costosFijosMensuales: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Marketing Mensual ({form.moneda}) *
                </label>
                <input
                  type="number"
                  value={form.marketingMensual}
                  onChange={(e) => setForm({ ...form, marketingMensual: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Cuotas de Deuda Mensuales ({form.moneda})
                </label>
                <input
                  type="number"
                  value={form.cuotasDeudaMensuales || 0}
                  onChange={(e) => setForm({ ...form, cuotasDeudaMensuales: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Caja Disponible / Liquidez ({form.moneda}) *
                </label>
                <input
                  type="number"
                  value={form.cajaDisponible}
                  onChange={(e) => setForm({ ...form, cajaDisponible: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                  required
                />
              </div>
            </div>
          )}

          {/* SECCIÓN 4: CAPACIDAD Y CLIENTES */}
          {activeSection === 'capacidad' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Capacidad Máxima de Atención al Mes *
                </label>
                <input
                  type="number"
                  value={form.capacidadMaximaMes}
                  onChange={(e) => setForm({ ...form, capacidadMaximaMes: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Número de Empleados *
                </label>
                <input
                  type="number"
                  value={form.numeroEmpleados}
                  onChange={(e) => setForm({ ...form, numeroEmpleados: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Satisfacción Actual de Clientes (1 a 5)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={form.satisfaccionClientes || 3.9}
                  onChange={(e) => setForm({ ...form, satisfaccionClientes: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Reputación Actual (1 a 5)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={form.reputacion || 4.0}
                  onChange={(e) => setForm({ ...form, reputacion: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                />
              </div>
            </div>
          )}

          {/* SECCIÓN 5: OBJETIVOS */}
          {activeSection === 'objetivos' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Objetivo Prioritario *
                </label>
                <select
                  value={form.objetivoPrioritario}
                  onChange={(e) => setForm({ ...form, objetivoPrioritario: e.target.value as ObjetivoPrioritario })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                >
                  <option value="rentabilidad">Rentabilidad (Maximizar beneficio acumulado)</option>
                  <option value="crecimiento">Crecimiento (Maximizar clientes y reputación)</option>
                  <option value="estabilidad">Estabilidad (Cuidar la caja mínima)</option>
                  <option value="reducir_riesgo">Reducir Riesgo (Minimizar eventos adversos)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Horizonte de Simulación *
                </label>
                <select
                  value={form.horizonte}
                  onChange={(e) => setForm({ ...form, horizonte: Number(e.target.value) as 12 | 24 })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                >
                  <option value={12}>12 Meses</option>
                  <option value={24}>24 Meses</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Problema Principal a Resolver *
                </label>
                <input
                  type="text"
                  value={form.problemaPrincipal.descripcion}
                  onChange={(e) => setForm({
                    ...form,
                    problemaPrincipal: { ...form.problemaPrincipal, descripcion: e.target.value }
                  })}
                  placeholder="Ej: Las ventas cayeron 12% por menor afluencia peatonal"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                  required
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Restricciones (Separadas por comas, ej: "no despedir, no bajar precios")
                </label>
                <input
                  type="text"
                  value={(form.restricciones || []).join(', ')}
                  onChange={(e) => setForm({
                    ...form,
                    restricciones: e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
                  })}
                  placeholder="no despedir, no bajar precios, inversion maxima: 5000"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '0.9rem' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Errores y Advertencias */}
        {errors.length > 0 && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '12px', padding: '16px', marginBottom: '20px', color: '#fca5a5', fontSize: '0.88rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={16} /> Errores en el formulario:
            </div>
            <ul style={{ paddingLeft: '20px' }}>
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {warnings.length > 0 && (
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '12px', padding: '16px', marginBottom: '20px', color: '#fde68a', fontSize: '0.88rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '6px' }}>⚠️ Advertencias de coherencia:</div>
            <ul style={{ paddingLeft: '20px' }}>
              {warnings.map((warn, i) => (
                <li key={i}>{warn}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Botón de Enviar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="submit"
            disabled={isGenerating}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 28px',
              borderRadius: '12px',
              border: 'none',
              background: isGenerating ? 'rgba(59, 130, 246, 0.5)' : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
              color: '#ffffff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: isGenerating ? 'wait' : 'pointer',
              boxShadow: '0 0 25px -3px rgba(56, 189, 248, 0.5)',
              transition: 'transform 0.2s',
            }}
          >
            <Sparkles size={18} />
            <span>{isGenerating ? 'Analizando y Generando con IA...' : 'Iniciar Simulación con IA'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};
