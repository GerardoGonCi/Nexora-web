import React, { useState } from 'react';
import {
  GitBranch,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Smile,
  Shield,
  Layers,
  ChevronRight,
  PlusCircle
} from 'lucide-react';
import {
  ConsequenceTree,
  TreeNode,
  NormalizedProfile,
  Decision,
} from '../core/types/index';
import { addDecisionBranch, setActiveNode } from '../core/tree/build';
import { FALLBACK_DECISIONS_BY_RUBRO } from '../core/ai/fallbacks';

interface TreeExplorerViewProps {
  tree: ConsequenceTree;
  profile: NormalizedProfile;
  availableDecisions: Decision[];
  onUpdateTree: (newTree: ConsequenceTree) => void;
}

export const TreeExplorerView: React.FC<TreeExplorerViewProps> = ({
  tree,
  profile,
  availableDecisions,
  onUpdateTree,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(tree.activeNodeId);
  const [isChainingModalOpen, setIsChainingModalOpen] = useState(false);

  const selectedNode: TreeNode = tree.nodes[selectedNodeId] || tree.nodes[tree.rootId];

  const handleSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    try {
      const updated = setActiveNode(tree, nodeId);
      onUpdateTree(updated);
    } catch {
      // ignore
    }
  };

  const handleChainDecision = (decision: Decision) => {
    try {
      const { updatedTree, decisionNodeId } = addDecisionBranch(
        tree,
        selectedNodeId,
        decision,
        profile
      );
      onUpdateTree(updatedTree);
      setSelectedNodeId(decisionNodeId);
      setIsChainingModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Error al encadenar decisión');
    }
  };

  // Helper para obtener el nombre legible de la decisión en lugar de su ID interno
  const getDecisionName = (node: TreeNode): string => {
    if (node.decisionName && !node.decisionName.startsWith('fb_') && !node.decisionName.startsWith('dec_')) {
      return node.decisionName;
    }

    if (node.decisionId) {
      // 1. Buscar en availableDecisions
      const foundInAvailable = availableDecisions.find((d) => d.id === node.decisionId);
      if (foundInAvailable?.name) return foundInAvailable.name;

      // 2. Buscar en todos los catálogos predefinidos por rubro
      for (const list of Object.values(FALLBACK_DECISIONS_BY_RUBRO)) {
        const found = list.find((d) => d.id === node.decisionId);
        if (found?.name) return found.name;
      }

      // 3. Mapeo específico para IDs de gastronomía (fb_gas_* o fb_ga_*)
      const id = node.decisionId.toLowerCase();
      if (id.includes('gas_1') || id.includes('ga_1') || id === 'fb_ga_1' || id === 'fb_gas_1') {
        return 'Optimización de menú e ingeniería de platos';
      }
      if (id.includes('gas_2') || id.includes('ga_2') || id === 'fb_ga_2' || id === 'fb_gas_2') {
        return 'Lanzamiento de servicio corporativo y delivery';
      }
      if (id.includes('gas_3') || id.includes('ga_3') || id === 'fb_ga_3' || id === 'fb_gas_3') {
        return 'Horas felices y promociones fuera de pico';
      }
      if (id.includes('gas_4') || id.includes('ga_4') || id === 'fb_ga_4' || id === 'fb_gas_4') {
        return 'Capacitación de servicio y estandarización';
      }

      // 4. Mapeo para comercio (fb_com_* o fb_co_*)
      if (id.includes('com_1') || id.includes('co_1')) return 'Liquidación y ajuste de catálogo';
      if (id.includes('com_2') || id.includes('co_2')) return 'Digitalización de ventas y e-commerce';
      if (id.includes('com_3') || id.includes('co_3')) return 'Programa de fidelización y recompra';
      if (id.includes('com_4') || id.includes('co_4')) return 'Optimización de compras a crédito';

      // 5. Mapeo para servicios (fb_ser_* o fb_se_*)
      if (id.includes('ser_1') || id.includes('se_1')) return 'Paquetización y planes mensuales';
      if (id.includes('ser_2') || id.includes('se_2')) return 'Prospección activa B2B y alianzas';
      if (id.includes('ser_3') || id.includes('se_3')) return 'Optimización de procesos internos y herramientas';
      if (id.includes('ser_4') || id.includes('se_4')) return 'Aumento selectivo de tarifas por valor';

      // 6. Mapeo para manufactura (fb_man_*)
      if (id.includes('man_1')) return 'Mantenimiento preventivo y reducción de cuellos de botella';
      if (id.includes('man_2')) return 'Desarrollo de línea de producto complementaria';
      if (id.includes('man_3')) return 'Renegociación de materias primas y compras consolidadas';
      if (id.includes('man_4')) return 'Capacitación en control de calidad y mermas';

      // 7. Mapeo para educación (fb_edu_*)
      if (id.includes('edu_1')) return 'Lanzamiento de cursos y talleres cortos';
      if (id.includes('edu_2')) return 'Campaña de captación temprana y becas parciales';
      if (id.includes('edu_3')) return 'Plataforma digital de contenidos complementarios';
      if (id.includes('edu_4')) return 'Alianzas corporativas para formación de personal';

      // 8. Mapeo para otros (fb_otr_*)
      if (id.includes('otr_1')) return 'Revisión integral de estructura de costos fijos';
      if (id.includes('otr_2')) return 'Estrategia comercial focalizada en clientes clave';
      if (id.includes('otr_3')) return 'Optimización de capital de trabajo y cobranza';
      if (id.includes('otr_4')) return 'Diversificación gradual de fuentes de ingreso';

      // 9. IDs semánticos genéricos
      if (id.includes('marketing')) return 'Aumentar presencia y marketing';
      if (id.includes('precio')) return 'Ajuste estratégico de precios';
      if (id.includes('promocion')) return 'Implementar promociones';
      if (id.includes('personal')) return 'Contratar más personal';
      if (id.includes('experiencia')) return 'Mejorar experiencia del cliente';
      if (id.includes('fideliz')) return 'Programa de fidelización';
      if (id.includes('costo')) return 'Optimización de insumos y costos';
    }

    if (node.decisionName) return node.decisionName;
    return 'Decisión Estratégica';
  };

  // Helper para obtener la descripción de la decisión
  const getDecisionDescription = (node: TreeNode): string => {
    if (node.decisionId) {
      const foundInAvailable = availableDecisions.find((d) => d.id === node.decisionId);
      if (foundInAvailable?.description) return foundInAvailable.description;

      for (const list of Object.values(FALLBACK_DECISIONS_BY_RUBRO)) {
        const found = list.find((d) => d.id === node.decisionId);
        if (found?.description) return found.description;
      }
    }
    return 'Medida estratégica adoptada para proyectar y transformar el rendimiento del negocio.';
  };

  // Agrupar nodos por padre para renderizar jerarquía
  const rootNode = tree.nodes[tree.rootId];

  const renderNodeItem = (node: TreeNode, depth: number = 0) => {
    const isSelected = selectedNodeId === node.id;
    const isRoot = node.type === 'raiz';
    const isDecision = node.type === 'decision' || node.type === 'seguimiento';
    const isResult = node.type === 'resultado';
    const isEvent = node.type === 'evento';

    let badgeColor = '#3b82f6';
    let label = 'Nodo';
    if (isRoot) {
      badgeColor = '#06b6d4';
      label = 'Estado Inicial (Punto de Partida)';
    } else if (isDecision) {
      badgeColor = '#8b5cf6';
      label = `Paso ${node.depth}: ${getDecisionName(node)}`;
    } else if (isResult) {
      badgeColor = '#22c55e';
      label = node.depth === 3
        ? `Resultado Final Consolidado (Fase 3)`
        : `Impacto Fase ${node.depth} — Tras ${getDecisionName(node)}`;
    } else if (isEvent) {
      badgeColor = '#f59e0b';
      label = `Evento: ${node.events[0]?.name || 'Incidente'}`;
    }

    return (
      <div key={node.id} style={{ marginLeft: `${depth * 24}px`, marginBottom: '12px' }}>
        <div
          onClick={() => handleSelectNode(node.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            borderRadius: '14px',
            background: isSelected
              ? 'linear-gradient(135deg, rgba(30, 58, 138, 0.6) 0%, rgba(15, 23, 42, 0.9) 100%)'
              : 'rgba(18, 26, 44, 0.6)',
            border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: isSelected ? '0 0 20px -3px rgba(56, 189, 248, 0.4)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: badgeColor,
                boxShadow: `0 0 8px ${badgeColor}`,
              }}
            />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>
                {label}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Caja: {profile.moneda} {node.metrics.caja.toLocaleString()} | Beneficio Acum: {profile.moneda} {node.metrics.beneficioAcumulado.toLocaleString()}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Profundidad {node.depth}</span>
            <ChevronRight size={16} color={isSelected ? '#38bdf8' : '#64748b'} />
          </div>
        </div>

        {/* Renderizar Hijos Recursivamente */}
        {node.childrenIds.map((childId) => {
          const childNode = tree.nodes[childId];
          return childNode ? renderNodeItem(childNode, depth + 1) : null;
        })}
      </div>
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
      {/* Columna Izquierda: Jerarquía del Árbol */}
      <div
        className="glass-panel"
        style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <GitBranch size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Árbol de Consecuencias</h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Explora ramificaciones, encadena decisiones y compara contrafactuales</p>
            </div>
          </div>

          {selectedNode.type === 'resultado' && selectedNode.depth < 3 && (
            <button
              onClick={() => setIsChainingModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '10px',
                border: 'none',
                background: '#3b82f6',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
              }}
            >
              <PlusCircle size={15} />
              <span>Encadenar Decisión</span>
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
          {rootNode && renderNodeItem(rootNode, 0)}
        </div>
      </div>

      {/* Columna Derecha: Inspector del Nodo Seleccionado */}
      <div
        className="glass-panel"
        style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#38bdf8', fontWeight: 700 }}>
              Detalles del Snapshot
            </div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              {selectedNode.type === 'raiz'
                ? 'Estado Inicial del Negocio'
                : selectedNode.type === 'resultado'
                ? selectedNode.depth === 3
                  ? 'Resultado Final Consolidado (Fase 3)'
                  : `Impacto Fase ${selectedNode.depth} — ${getDecisionName(selectedNode)}`
                : selectedNode.type === 'evento'
                ? `Evento: ${selectedNode.events[0]?.name || 'Incidente'}`
                : `Paso ${selectedNode.depth}: ${getDecisionName(selectedNode)}`}
            </h4>
          </div>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '999px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            Mes {selectedNode.stateSnapshot.t}
          </span>
        </div>

        {/* Info de la Decisión Asociada */}
        {selectedNode.type !== 'raiz' && (selectedNode.decisionId || selectedNode.decisionName) && (
          <div style={{ background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#c084fc', fontWeight: 700, marginBottom: '4px' }}>
              {selectedNode.type === 'resultado' ? 'Consecuencia de la Decisión:' : 'Decisión Estratégica:'}
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>
              {getDecisionName(selectedNode)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              {getDecisionDescription(selectedNode)}
            </div>
          </div>
        )}

        {/* Métricas Clave del Snapshot */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2px' }}>Beneficio Mensual</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              {profile.moneda} {selectedNode.stateSnapshot.beneficio.toLocaleString()}
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2px' }}>Caja Acumulada</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              {profile.moneda} {selectedNode.stateSnapshot.caja.toLocaleString()}
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2px' }}>Clientes Atendidos</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
              {selectedNode.stateSnapshot.atendidos.toLocaleString()}
            </div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2px' }}>Satisfacción</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4ade80' }}>
              {Math.round(selectedNode.stateSnapshot.satisfaccion)}%
            </div>
          </div>
        </div>

        {/* Delta Respecto al Padre */}
        {selectedNode.deltaVsParent && (
          <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '14px', padding: '16px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#38bdf8', marginBottom: '8px' }}>
              Delta vs Estado Previo:
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#cbd5e1' }}>
              <span>Beneficio Acumulado:</span>
              <strong style={{ color: selectedNode.deltaVsParent.beneficioDeltaVsParent >= 0 ? '#4ade80' : '#f87171' }}>
                {selectedNode.deltaVsParent.beneficioDeltaVsParent >= 0 ? '+' : ''}
                {profile.moneda} {selectedNode.deltaVsParent.beneficioDeltaVsParent.toLocaleString()}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#cbd5e1', marginTop: '4px' }}>
              <span>Impacto en Caja:</span>
              <strong style={{ color: selectedNode.deltaVsParent.cajaDeltaVsParent >= 0 ? '#4ade80' : '#f87171' }}>
                {selectedNode.deltaVsParent.cajaDeltaVsParent >= 0 ? '+' : ''}
                {profile.moneda} {selectedNode.deltaVsParent.cajaDeltaVsParent.toLocaleString()}
              </strong>
            </div>
          </div>
        )}

        {/* Eventos Disparados en este Tramo */}
        {selectedNode.events && selectedNode.events.length > 0 && (
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fbbf24', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={15} /> Eventos Activos de Segundo Orden:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedNode.events.map((ev, i) => (
                <div key={i} style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '10px 14px', fontSize: '0.8rem', color: '#fde68a' }}>
                  <strong>{ev.name} (Mes {ev.triggeredAtMonth}):</strong> {ev.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Encadenamiento */}
      {isChainingModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
        >
          <div
            style={{
              width: '560px',
              background: '#0f172a',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            }}
          >
            <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '6px' }}>
              Encadenar Nueva Decisión
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>
              Partiendo del estado en el Mes {selectedNode.stateSnapshot.t}, selecciona qué acción tomar:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
              {availableDecisions.map((dec) => (
                <div
                  key={dec.id}
                  onClick={() => handleChainDecision(dec)}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(56, 189, 248, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(30, 41, 59, 0.6)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{dec.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{dec.description}</div>
                  </div>
                  <ArrowRight size={16} color="#38bdf8" />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setIsChainingModalOpen(false)}
                style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
