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
      label = 'Estado Actual (Raíz)';
    } else if (isDecision) {
      badgeColor = '#8b5cf6';
      label = `Decisión: ${node.decisionId}`;
    } else if (isResult) {
      badgeColor = '#22c55e';
      label = `Resultado Mes ${node.horizon}`;
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
                ? `Resultado Horizonte Mes ${selectedNode.horizon}`
                : `Nodo: ${selectedNode.type}`}
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
