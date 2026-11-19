import React, { useState } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { HeaderBar } from './components/HeaderBar';
import { BusinessBanner } from './components/BusinessBanner';
import { DecisionGrid, DecisionHistoryItem } from './components/DecisionGrid';
import { ConsequenceGraph } from './components/ConsequenceGraph';
import { EvolutionChart } from './components/EvolutionChart';
import { AiAnalysisCard } from './components/AiAnalysisCard';
import { CaseFormView, PRESET_CAFETERIA } from './components/CaseFormView';
import { TreeExplorerView } from './components/TreeExplorerView';
import { CompareScenariosView } from './components/CompareScenariosView';
import { AiAnalystView } from './components/AiAnalystView';

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
import {
  createInitialTree,
  addDecisionBranch,
  deriveProfileFromSnapshot,
  buildPathwayTree,
} from './core/tree/build';
import { generateAiDecisions } from './services/aiService';

// 6 Decisiones de referencia iniciales (Cafetería)
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
  // La página principal inicial es "Inicia tu Simulación Empresarial" (formulario)
  const [hasActiveSimulation, setHasActiveSimulation] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('formulario');
  const [aiSource, setAiSource] = useState<'openai' | 'fallback'>('fallback');

  // Inicializar estado base
  const initialValidation = validateCaseForm(PRESET_CAFETERIA);
  const initialProfile = initialValidation.profile!;
  const initialDiagnosis = runRuleBasedDiagnosis(initialProfile);

  const [initialBaseProfile, setInitialBaseProfile] = useState<NormalizedProfile>(initialProfile);
  const [profile, setProfile] = useState<NormalizedProfile>(initialProfile);
  const [diagnosis, setDiagnosis] = useState<DiagnosticLabel[]>(initialDiagnosis);
  const [decisions, setDecisions] = useState<Decision[]>(INITIAL_CAFETERIA_DECISIONS.slice(0, 4));
  const [selectedDecision, setSelectedDecision] = useState<Decision>(INITIAL_CAFETERIA_DECISIONS[0]);

  // Simulación determinista para la decisión seleccionada
  const [simResult, setSimResult] = useState<SimulationResult>(() =>
    simulateDecision(initialProfile, INITIAL_CAFETERIA_DECISIONS[0], 12)
  );

  // Árbol de consecuencias concatenado por ronda
  const [tree, setTree] = useState<ConsequenceTree>(() =>
    buildPathwayTree(
      initialProfile,
      [],
      {
        step: 1,
        decision: INITIAL_CAFETERIA_DECISIONS[0],
        simResult: simulateDecision(initialProfile, INITIAL_CAFETERIA_DECISIONS[0], 12),
      },
      false
    )
  );

  const [currentHorizonIndex, setCurrentHorizonIndex] = useState(0);

  // Estados del flujo multirronda (hasta 3 caminos / decisiones encadenadas) y Deshacer
  const [currentStep, setCurrentStep] = useState<number>(1);
  const maxSteps = 3;
  const [pathHistory, setPathHistory] = useState<DecisionHistoryItem[]>([]);
  const [isGeneratingNext, setIsGeneratingNext] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [userSelectedDecisionId, setUserSelectedDecisionId] = useState<string | null>(null);

  // Manejar inicio de simulación desde el formulario con datos generados por la IA
  const handleStartSimulation = (
    newProfile: NormalizedProfile,
    newDiagnosis: DiagnosticLabel[],
    newDecisions: Decision[],
    source?: 'openai' | 'fallback'
  ) => {
    setInitialBaseProfile(newProfile);
    setProfile(newProfile);
    setDiagnosis(newDiagnosis);
    setAiSource(source || 'fallback');

    // Usar las 4 decisiones generadas para este caso específico
    const validDecisions = newDecisions && newDecisions.length > 0
      ? newDecisions.slice(0, 4)
      : INITIAL_CAFETERIA_DECISIONS.slice(0, 4);

    setDecisions(validDecisions);
    const firstDecision = validDecisions[0];
    setSelectedDecision(firstDecision);

    const newSim = simulateDecision(newProfile, firstDecision, newProfile.horizonte);
    setSimResult(newSim);

    // Inicializar el árbol con el punto de partida y la primera opción en exploración
    const initialTree = buildPathwayTree(
      newProfile,
      [],
      { step: 1, decision: firstDecision, simResult: newSim },
      false
    );
    setTree(initialTree);

    // Reiniciar progresión multirronda
    setCurrentStep(1);
    setPathHistory([]);
    setIsCompleted(false);
    setIsGeneratingNext(false);
    setUserSelectedDecisionId(null);

    // Activar simulación y pasar al Dashboard
    setHasActiveSimulation(true);
    setActiveTab('inicio');
  };

  // 1. Previsualizar / explorar una decisión en el grid (actualiza gráficas, métricas y árbol sin avanzar de paso)
  const handlePreviewDecision = (dec: Decision) => {
    if (isGeneratingNext || isCompleted) return;
    setSelectedDecision(dec);
    setUserSelectedDecisionId(dec.id);
    const newSim = simulateDecision(profile, dec, profile.horizonte);
    setSimResult(newSim);

    // El árbol actualiza la decisión en vista previa concatenada
    const updatedTree = buildPathwayTree(
      initialBaseProfile,
      pathHistory,
      { step: currentStep, decision: dec, simResult: newSim },
      false
    );
    setTree(updatedTree);
  };

  // 2. Aprobar la decisión seleccionada (recién aquí se ejecuta y avanza a la siguiente ronda)
  const handleApproveDecision = async () => {
    if (!selectedDecision || isGeneratingNext || isCompleted) return;

    const dec = selectedDecision;
    const currentSim = simResult || simulateDecision(profile, dec, profile.horizonte);

    // Proyectar el nuevo estado del negocio tras ejecutar esta decisión
    const cycleMonths = Math.max(1, Math.round(profile.horizonte / maxSteps));
    const targetMonthIdx = Math.min(cycleMonths - 1, currentSim.base.months.length - 1);
    const snapshotAfterCycle = currentSim.base.months[targetMonthIdx];
    const derivedProfile = deriveProfileFromSnapshot(profile, snapshotAfterCycle);

    // Registrar en el historial para permitir "Deshacer decisión"
    const historyItem: DecisionHistoryItem = {
      step: currentStep,
      decision: dec,
      profileBefore: profile,
      profileAfter: derivedProfile,
      simResult: currentSim,
      availableDecisions: decisions,
    };
    const nextHistory = [...pathHistory, historyItem];
    setPathHistory(nextHistory);

    // Si ya completó los 3 caminos / pasos
    if (currentStep >= maxSteps) {
      setProfile(derivedProfile);
      setIsCompleted(true);
      setUserSelectedDecisionId(null);

      // El árbol consolida estrictamente las 3 decisiones seleccionadas concatenadas
      const finalTree = buildPathwayTree(initialBaseProfile, nextHistory, null, true);
      setTree(finalTree);
      return;
    }

    // Avanzar a la siguiente ronda y generar 4 nuevas decisiones con IA
    const nextStepNum = currentStep + 1;
    setCurrentStep(nextStepNum);
    setProfile(derivedProfile);
    setIsGeneratingNext(true);
    setUserSelectedDecisionId(null);

    try {
      const res = await generateAiDecisions(
        derivedProfile,
        diagnosis,
        {
          step: nextStepNum,
          maxSteps,
          previousDecisions: nextHistory.map((h) => h.decision),
        }
      );

      const nextDecs = res.decisions.slice(0, 4);
      setDecisions(nextDecs);
      setSelectedDecision(nextDecs[0]);
      setUserSelectedDecisionId(null);

      // Previsualizar la primera decisión de la nueva ronda
      const nextSimPreview = simulateDecision(derivedProfile, nextDecs[0], derivedProfile.horizonte);
      setSimResult(nextSimPreview);

      // Actualizar el árbol concatenando las decisiones aprobadas previas + la nueva en exploración
      const nextTree = buildPathwayTree(
        initialBaseProfile,
        nextHistory,
        { step: nextStepNum, decision: nextDecs[0], simResult: nextSimPreview },
        false
      );
      setTree(nextTree);
    } catch (err) {
      console.error('Error generando decisiones de la siguiente ronda:', err);
    } finally {
      setIsGeneratingNext(false);
    }
  };

  // Manejar "Deshacer decisión" para volver a la ronda anterior y probar otra alternativa
  const handleUndo = () => {
    if (pathHistory.length === 0) return;

    const lastIdx = pathHistory.length - 1;
    const lastItem = pathHistory[lastIdx];
    const remainingHistory = pathHistory.slice(0, lastIdx);

    setIsCompleted(false);
    setIsGeneratingNext(false);
    setCurrentStep(lastItem.step);
    setProfile(lastItem.profileBefore);
    setDecisions(lastItem.availableDecisions);
    setSelectedDecision(lastItem.decision);
    setUserSelectedDecisionId(lastItem.decision.id);
    setSimResult(lastItem.simResult);
    setPathHistory(remainingHistory);

    // Reconstruir el árbol concatenado hasta el paso previo
    const revertedTree = buildPathwayTree(
      initialBaseProfile,
      remainingHistory,
      { step: lastItem.step, decision: lastItem.decision, simResult: lastItem.simResult },
      false
    );
    setTree(revertedTree);
  };

  // Concluir simulación anticipadamente si el usuario no desea tomar el 3er paso
  const handleFinishEarly = () => {
    setIsCompleted(true);
    setUserSelectedDecisionId(null);
    const finalTree = buildPathwayTree(initialBaseProfile, pathHistory, null, true);
    setTree(finalTree);
  };

  // Reiniciar todo el camino a la Ronda 1 inicial
  const handleResetPathway = () => {
    if (pathHistory.length === 0) return;
    const firstItem = pathHistory[0];
    setProfile(firstItem.profileBefore);
    setDecisions(firstItem.availableDecisions);
    setSelectedDecision(firstItem.availableDecisions[0]);
    setUserSelectedDecisionId(null);
    setSimResult(firstItem.simResult);
    setCurrentStep(1);
    setPathHistory([]);
    setIsCompleted(false);
    setIsGeneratingNext(false);

    const resetTree = buildPathwayTree(
      firstItem.profileBefore,
      [],
      { step: 1, decision: firstItem.availableDecisions[0], simResult: firstItem.simResult },
      false
    );
    setTree(resetTree);
  };

  // Estado del snapshot según horizonte seleccionado en el stepper o mes proyectado
  const getSnapshotForHorizon = () => {
    if (!simResult) return undefined;
    const months = simResult.base.months;
    if (months.length === 0) return undefined;

    if (currentHorizonIndex === 1) return months[0]; // 1 mes
    if (currentHorizonIndex === 2) return months[Math.min(2, months.length - 1)]; // 3 meses
    if (currentHorizonIndex === 3) return months[Math.min(5, months.length - 1)]; // 6 meses
    if (currentHorizonIndex === 4) return months[months.length - 1]; // 12 meses

    // Si horizonte está en 0 (preview inmediato), mostrar el impacto del mes 1 de la decisión
    return months[0];
  };

  const currentSnapshot = getSnapshotForHorizon();

  return (
    <div className="app-container">
      {/* Sidebar Menú Lateral */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (!hasActiveSimulation && tab !== 'formulario') {
            setActiveTab('formulario');
            return;
          }
          setActiveTab(tab);
        }}
        hasActiveSimulation={hasActiveSimulation}
      />

      {/* Área Principal */}
      <main className="main-content">
        {/* VISTA 1: Formulario de Caso (Página principal por defecto) */}
        {activeTab === 'formulario' || !hasActiveSimulation ? (
          <div>
            {hasActiveSimulation && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <button
                  onClick={() => setActiveTab('inicio')}
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
                  ← Volver al Dashboard actual
                </button>
              </div>
            )}
            <CaseFormView onStartSimulation={handleStartSimulation} />
          </div>
        ) : activeTab === 'inicio' ? (
          /* VISTA PRINCIPAL: Panel de Control (Dashboard) */
          <div>
            {/* 1. Header con Stepper y Reiniciar / Nuevo Caso */}
            <HeaderBar
              currentHorizonIndex={currentHorizonIndex}
              onSelectHorizon={setCurrentHorizonIndex}
              onReset={() => setActiveTab('formulario')}
            />

            {/* Aviso de generación por IA */}
            <div
              style={{
                background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.15))',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '12px',
                padding: '10px 18px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#a7f3d0',
                fontSize: '0.86rem',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.1)',
              }}
            >
              <span>
                ✨ <strong>Simulación Estratégica con IA ({aiSource === 'openai' ? 'OpenAI GPT-4o' : 'Motor Nexora'}):</strong>{' '}
                {isCompleted
                  ? 'Has completado los 3 pasos estratégicos de tu simulación. Puedes deshacer para probar rutas alternativas.'
                  : `Paso ${currentStep} de ${maxSteps}: Selecciona una decisión para actualizar valores y proyectar las siguientes 4 opciones.`}
              </span>
              <button
                onClick={() => setActiveTab('formulario')}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: '#fff',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                }}
              >
                Nuevo Caso
              </button>
            </div>

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
                  selectedDecision={selectedDecision}
                  onSelectDecision={handlePreviewDecision}
                  onApproveDecision={handleApproveDecision}
                  step={currentStep}
                  maxSteps={maxSteps}
                  canUndo={pathHistory.length > 0}
                  onUndo={handleUndo}
                  isGeneratingNext={isGeneratingNext}
                  isCompleted={isCompleted}
                  onReset={handleResetPathway}
                  pathHistory={pathHistory}
                  profile={profile}
                  simResult={simResult}
                  onFinishEarly={handleFinishEarly}
                  onNavigateToCompare={() => setActiveTab('comparar')}
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
                  isCompleted={isCompleted}
                  userSelectedDecisionId={userSelectedDecisionId}
                  onRequestAnalysis={(dec) => setUserSelectedDecisionId(dec.id)}
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
              handlePreviewDecision(dec);
              setActiveTab('inicio');
            }}
          />
        ) : (
          /* VISTA 4: Analista IA */
          <AiAnalystView
            profile={profile}
            selectedDecision={selectedDecision}
            simResult={simResult}
          />
        )}
      </main>
    </div>
  );
};

export default App;
