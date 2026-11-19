import React, { useState } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { HeaderBar } from './components/HeaderBar';
import { BusinessBanner } from './components/BusinessBanner';
import { DecisionGrid } from './components/DecisionGrid';
import { ConsequenceGraph } from './components/ConsequenceGraph';
import { EvolutionChart } from './components/EvolutionChart';
import { AiAnalysisCard } from './components/AiAnalysisCard';
import { CaseFormView, PRESET_CAFETERIA } from './components/CaseFormView';
import { TreeExplorerView } from './components/TreeExplorerView';
import { CompareScenariosView } from './components/CompareScenariosView';
import { AiAnalystView } from './components/AiAnalystView';
import { LearnView } from './components/LearnView';

import {
  NormalizedProfile,
  Decision,
  ConsequenceTree,
  SimulationResult,
  DiagnosticLabel,
} from './core/types/index';
import { validateCaseForm } from './core/form/validate';
import { runRuleBasedDiagnosis } from './core/diagnosis/rules';
import { simulateDecision } from './core/engine/simulate';
import { createInitialTree, addDecisionBranch } from './core/tree/build';
import { getFallbackDecisions } from './core/ai/fallbacks';

// 6 Decisiones iniciales adaptadas al caso de cafetería para que coincidan con la imagen
const INITIAL_CAFETERIA_DECISIONS: Decision[] = [
  {
    id: 'dec_marketing',
    name: 'Aumentar marketing',
    category: 'marketing',
    description: 'Atrae más clientes a través de pauta local',
    oneTimeCost: 1500,
    fixedDelta: 300,
    marketingDelta: 1000,
    priceChangePct: 0,
    varCostDeltaPct: 0,
    capacityChangePct: 15,
    demandLift: { start: 10, end: 20, curve: 'linear', lagMonths: 0 },
    satisfactionPerMonth: 0.5,
    pros: ['Entrada rápida de clientes'],
    cons: ['Mayor desembolso mensual en pauta'],
    risks: ['Fatiga publicitaria si no se renueva el mensaje'],
    assumptions: [{ text: 'Pauta local efectiva', confidence: 'media' }],
    requiresFinancing: false,
  },
  {
    id: 'dec_precios',
    name: 'Reducir precios',
    category: 'precio',
    description: 'Atrae clientes con mejores ofertas',
    oneTimeCost: 200,
    fixedDelta: 0,
    marketingDelta: 200,
    priceChangePct: -10,
    varCostDeltaPct: -2,
    capacityChangePct: 0,
    demandLift: { start: 12, end: 8, curve: 'pulse', lagMonths: 0 },
    satisfactionPerMonth: 0.8,
    pros: ['Competitividad directa'],
    cons: ['Menor margen de contribución'],
    risks: ['Riesgo de guerra de precios'],
    assumptions: [{ text: 'Demanda elástica a promociones', confidence: 'alta' }],
    requiresFinancing: false,
  },
  {
    id: 'dec_promociones',
    name: 'Implementar promociones',
    category: 'producto',
    description: 'Genera más visitas con combos especiales',
    oneTimeCost: 400,
    fixedDelta: 0,
    marketingDelta: 300,
    priceChangePct: -5,
    varCostDeltaPct: 1,
    capacityChangePct: 10,
    demandLift: { start: 8, end: 14, curve: 'linear', lagMonths: 0 },
    satisfactionPerMonth: 1.0,
    pros: ['Mayor rotación de productos complementarios'],
    cons: ['Margen unitario reducido en combos'],
    risks: ['Canibalización de productos a precio regular'],
    assumptions: [{ text: 'Aceptación de combos desayuno', confidence: 'media' }],
    requiresFinancing: false,
  },
  {
    id: 'dec_personal',
    name: 'Contratar más personal',
    category: 'personal',
    description: 'Mejora la atención y reduce tiempos de espera',
    oneTimeCost: 800,
    fixedDelta: 2200,
    marketingDelta: 0,
    priceChangePct: 0,
    varCostDeltaPct: 0,
    capacityChangePct: 35,
    demandLift: { start: 4, end: 12, curve: 'linear', lagMonths: 1 },
    satisfactionPerMonth: 2.2,
    pros: ['Elimina colas y cuellos de botella'],
    cons: ['Incremento en planilla mensual'],
    risks: ['Sobrecosto si la afluencia no compensa'],
    assumptions: [{ text: 'Personal calificado disponible', confidence: 'alta' }],
    requiresFinancing: false,
  },
  {
    id: 'dec_experiencia',
    name: 'Mejorar experiencia',
    category: 'operaciones',
    description: 'Incrementa la fidelidad y ambiente del local',
    oneTimeCost: 2500,
    fixedDelta: 200,
    marketingDelta: 200,
    priceChangePct: 6,
    varCostDeltaPct: -1,
    capacityChangePct: 5,
    demandLift: { start: 3, end: 15, curve: 'linear', lagMonths: 1 },
    satisfactionPerMonth: 2.5,
    pros: ['Mayor disposición a pagar de clientes fieles'],
    cons: ['Desembolso de remodelación inicial'],
    risks: ['Tiempo de ejecución de obras'],
    assumptions: [{ text: 'Clientes valoran el ambiente acogedor', confidence: 'alta' }],
    requiresFinancing: false,
  },
  {
    id: 'dec_fidelizacion',
    name: 'Programa de fidelización',
    category: 'fidelizacion',
    description: 'Retiene más clientes con recompensas por visita',
    oneTimeCost: 600,
    fixedDelta: 150,
    marketingDelta: 100,
    priceChangePct: 0,
    varCostDeltaPct: 0,
    capacityChangePct: 0,
    demandLift: { start: 5, end: 18, curve: 'linear', lagMonths: 1 },
    satisfactionPerMonth: 1.8,
    pros: ['Frecuencia de recompra garantizada'],
    cons: ['Costo del beneficio al 10mo café'],
    risks: ['Baja tasa de registro inicial'],
    assumptions: [{ text: 'Clientes habituales se afilian al club', confidence: 'alta' }],
    requiresFinancing: false,
  },
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('inicio');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Inicializar estado base con el caso Cafetería de la imagen
  const initialValidation = validateCaseForm(PRESET_CAFETERIA);
  const initialProfile = initialValidation.profile!;
  const initialDiagnosis = runRuleBasedDiagnosis(initialProfile);

  const [profile, setProfile] = useState<NormalizedProfile>(initialProfile);
  const [diagnosis, setDiagnosis] = useState<DiagnosticLabel[]>(initialDiagnosis);
  const [decisions, setDecisions] = useState<Decision[]>(INITIAL_CAFETERIA_DECISIONS);
  const [selectedDecision, setSelectedDecision] = useState<Decision>(INITIAL_CAFETERIA_DECISIONS[0]);

  // Simulación determinista para la decisión seleccionada
  const [simResult, setSimResult] = useState<SimulationResult>(() =>
    simulateDecision(initialProfile, INITIAL_CAFETERIA_DECISIONS[0], 12)
  );

  // Árbol de consecuencias
  const [tree, setTree] = useState<ConsequenceTree>(() => {
    const t = createInitialTree(initialProfile);
    const { updatedTree } = addDecisionBranch(t, 'root', INITIAL_CAFETERIA_DECISIONS[0], initialProfile);
    return updatedTree;
  });

  const [currentHorizonIndex, setCurrentHorizonIndex] = useState(0);

  // Manejar inicio de simulación desde el formulario
  const handleStartSimulation = (
    newProfile: NormalizedProfile,
    newDiagnosis: DiagnosticLabel[],
    newDecisions: Decision[]
  ) => {
    setProfile(newProfile);
    setDiagnosis(newDiagnosis);

    // Si es gastronomía usar las 6 específicas, sino las del rubro
    const finalDecisions =
      newProfile.rubro === 'gastronomia'
        ? INITIAL_CAFETERIA_DECISIONS
        : newDecisions;

    setDecisions(finalDecisions);
    const firstDecision = finalDecisions[0];
    setSelectedDecision(firstDecision);

    const newSim = simulateDecision(newProfile, firstDecision, newProfile.horizonte);
    setSimResult(newSim);

    const newTree = createInitialTree(newProfile);
    const { updatedTree } = addDecisionBranch(newTree, 'root', firstDecision, newProfile);
    setTree(updatedTree);

    setIsFormOpen(false);
    setActiveTab('inicio');
  };

  // Manejar selección de decisión en el grid
  const handleSelectDecision = (dec: Decision) => {
    setSelectedDecision(dec);
    const newSim = simulateDecision(profile, dec, profile.horizonte);
    setSimResult(newSim);

    // Agregar rama al árbol si aún no existe
    try {
      const alreadyHas = Object.values(tree.nodes).some(
        (n) => (n.type === 'decision' || n.type === 'seguimiento') && n.decisionId === dec.id
      );
      if (!alreadyHas) {
        const { updatedTree } = addDecisionBranch(tree, 'root', dec, profile);
        setTree(updatedTree);
      }
    } catch {
      // ignore
    }
  };

  // Estado del snapshot según horizonte seleccionado en el stepper
  const getSnapshotForHorizon = () => {
    if (!simResult || currentHorizonIndex === 0) return undefined;
    const months = simResult.base.months;
    if (currentHorizonIndex === 1) return months[0]; // 1 mes
    if (currentHorizonIndex === 2) return months[Math.min(2, months.length - 1)]; // 3 meses
    if (currentHorizonIndex === 3) return months[Math.min(5, months.length - 1)]; // 6 meses
    return months[months.length - 1];
  };

  const currentSnapshot = getSnapshotForHorizon();

  return (
    <div className="app-container">
      {/* Sidebar Menú Lateral */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'inicio' && isFormOpen) {
            setIsFormOpen(false);
          }
        }}
        hasActiveSimulation={true}
      />

      {/* Área Principal */}
      <main className="main-content">
        {/* VISTA 1: Formulario de Caso */}
        {isFormOpen ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <button
                onClick={() => setIsFormOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  color: '#cbd5e1',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                ← Volver al panel actual
              </button>
            </div>
            <CaseFormView onStartSimulation={handleStartSimulation} />
          </div>
        ) : activeTab === 'inicio' ? (
          /* VISTA PRINCIPAL: Panel de Control (Idéntico a la imagen de referencia) */
          <div>
            {/* 1. Header con Stepper y Reiniciar */}
            <HeaderBar
              currentHorizonIndex={currentHorizonIndex}
              onSelectHorizon={setCurrentHorizonIndex}
              onReset={() => setIsFormOpen(true)}
            />

            {/* 2. Banner de Negocio con 4 Chips de KPIs */}
            <BusinessBanner profile={profile} currentState={currentSnapshot} />

            {/* 3. Grid Principal de 2 Columnas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.15fr', gap: '24px' }}>
              {/* Columna Izquierda */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Toma tu decisión */}
                <DecisionGrid
                  decisions={decisions}
                  selectedDecisionId={selectedDecision?.id || null}
                  onSelectDecision={handleSelectDecision}
                />

                {/* Evolución del negocio */}
                <EvolutionChart simResult={simResult} profile={profile} />
              </div>

              {/* Columna Derecha */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* ¿Qué podría pasar? */}
                <ConsequenceGraph
                  decision={selectedDecision}
                  simResult={simResult}
                  profile={profile}
                />

                {/* Análisis de IA */}
                <AiAnalysisCard
                  decision={selectedDecision}
                  simResult={simResult}
                  profile={profile}
                />
              </div>
            </div>
          </div>
        ) : activeTab === 'arbol' ? (
          /* VISTA 2: Árbol de Consecuencias */
          <TreeExplorerView
            tree={tree}
            profile={profile}
            availableDecisions={decisions}
            onUpdateTree={setTree}
          />
        ) : activeTab === 'comparar' ? (
          /* VISTA 3: Comparar Escenarios */
          <CompareScenariosView
            profile={profile}
            decisions={decisions}
            onSelectDecision={(dec) => {
              handleSelectDecision(dec);
              setActiveTab('inicio');
            }}
          />
        ) : activeTab === 'analista' ? (
          /* VISTA 4: Analista IA */
          <AiAnalystView
            profile={profile}
            selectedDecision={selectedDecision}
            simResult={simResult}
          />
        ) : (
          /* VISTA 5: Aprende */
          <LearnView />
        )}
      </main>
    </div>
  );
};

export default App;
