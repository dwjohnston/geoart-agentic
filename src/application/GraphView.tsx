import { useEffect, useMemo, useRef, useState } from 'react';
import type { GeoArtGraph } from '../schema/_generated/schema-types';
import type { InputDescriptor, PortSchemaMeta } from '../graphEngine/externalInterfaces/graphViewTypes';
import { getRepresentationForKind, getDefaultsForKind } from './graphViewRegistry';
import { NodeCard } from './NodeCard';
import { nodeInputs } from '../schema/_generated/node-inputs-2';
import { nodeOutputMeta } from '../schema/_generated/node-outputs-2';

type PortPosition = { x: number; y: number };
type Connection = { from: string; to: string };

type AnyNode = {
  id: string;
  type: string;
  params?: Record<string, unknown>;
};

function buildInputDescriptors(params: Record<string, unknown> | undefined): Record<string, InputDescriptor> {
  const result: Record<string, InputDescriptor> = {};
  for (const [name, value] of Object.entries(params ?? {})) {
    if (value && typeof value === 'object' && 'ref' in value) {
      result[name] = { kind: 'ref', ref: (value as { ref: string }).ref };
    } else if (value && typeof value === 'object' && 'v' in value) {
      result[name] = { kind: 'static', value: (value as { v: unknown }).v };
    }
  }
  return result;
}

function getInputPorts(kind: string): PortSchemaMeta[] {
  const meta = (nodeInputs as unknown as Record<string, Record<string, { valueType: string }>>)[kind];
  if (!meta) return [];
  return Object.entries(meta).map(([name, def]) => ({
    name,
    valueKind: def.valueType.replace(/Value$/, ''),
  }));
}

function getOutputPorts(kind: string): PortSchemaMeta[] {
  const meta = (nodeOutputMeta as unknown as Record<string, Array<{ name: string; valueType: string }>>)[kind];
  if (!meta) return [];
  return meta.map(({ name, valueType }) => ({
    name,
    valueKind: valueType.replace(/Value$/, ''),
  }));
}

function collectConnections(graph: GeoArtGraph): Connection[] {
  const connections: Connection[] = [];
  const allNodes: AnyNode[] = [
    ...(graph.control.nodes as unknown as AnyNode[]),
    ...(graph.compute.nodes as unknown as AnyNode[]),
    ...(graph.render.nodes as unknown as AnyNode[]),
  ];
  for (const node of allNodes) {
    for (const [paramName, paramValue] of Object.entries(node.params ?? {})) {
      if (paramValue && typeof paramValue === 'object' && 'ref' in paramValue) {
        const ref = (paramValue as { ref: string }).ref;
        const dotIdx = ref.indexOf('.');
        if (dotIdx !== -1) {
          const srcNodeId = ref.slice(0, dotIdx);
          const srcPortName = ref.slice(dotIdx + 1);
          connections.push({
            from: `output:${srcNodeId}:${srcPortName}`,
            to: `input:${node.id}:${paramName}`,
          });
        }
      }
    }
  }
  return connections;
}

type ColumnProps = {
  title: string;
  nodes: AnyNode[];
  layerKind: 'control' | 'compute' | 'render';
  hoveredNodeId: string | null;
  highlightedNodeIds: Set<string>;
  refHighlightedNodeIds: Set<string>;
  onNodeHover: (id: string | null) => void;
  onRefHover: (id: string | null) => void;
  onOutputPortHover: (portRef: string | null) => void;
};

function Column({ title, nodes, layerKind, hoveredNodeId, highlightedNodeIds, refHighlightedNodeIds, onNodeHover, onRefHover, onOutputPortHover }: ColumnProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 220 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 'bold',
          color: '#888',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: 8,
          paddingBottom: 4,
          borderBottom: '1px solid #333',
        }}
      >
        {title}
      </div>
      {nodes.map(node => {
        const inputs = buildInputDescriptors(node.params);
        const defaults = getDefaultsForKind(node.type);
        const inputPorts = getInputPorts(node.type);
        for (const port of inputPorts) {
          if (!inputs[port.name] && defaults[port.name] !== undefined) {
            inputs[port.name] = { kind: 'default', value: defaults[port.name] };
          }
        }
        const outputPorts = getOutputPorts(node.type);
        const renderBody = getRepresentationForKind(node.type);
        const isActive = node.id === hoveredNodeId;
        const isHighlighted = highlightedNodeIds.has(node.id);
        const isDimmed = hoveredNodeId !== null && !isActive && !isHighlighted;
        const isRefHighlighted = refHighlightedNodeIds.has(node.id);
        return (
          <NodeCard
            key={node.id}
            nodeId={node.id}
            nodeKind={node.type}
            layerKind={layerKind}
            inputs={inputs}
            inputPorts={inputPorts}
            outputPorts={outputPorts}
            renderBody={renderBody}
            isActive={isActive}
            isHighlighted={isHighlighted}
            isDimmed={isDimmed}
            isRefHighlighted={isRefHighlighted}
            onMouseEnter={() => onNodeHover(node.id)}
            onMouseLeave={() => onNodeHover(null)}
            onRefHover={onRefHover}
            onOutputPortHover={onOutputPortHover}
          />
        );
      })}
    </div>
  );
}

function assignComputeColumns(computeNodes: AnyNode[]): AnyNode[][] {
  if (computeNodes.length === 0) return [];
  const computeIds = new Set(computeNodes.map(n => n.id));

  const deps = new Map<string, Set<string>>();
  for (const node of computeNodes) {
    const nodeDeps = new Set<string>();
    for (const paramValue of Object.values(node.params ?? {})) {
      if (paramValue && typeof paramValue === 'object' && 'ref' in paramValue) {
        const ref = (paramValue as { ref: string }).ref;
        const srcNodeId = ref.slice(0, ref.indexOf('.'));
        if (computeIds.has(srcNodeId)) nodeDeps.add(srcNodeId);
      }
    }
    deps.set(node.id, nodeDeps);
  }

  const levels = new Map<string, number>();
  function getLevel(id: string): number {
    if (levels.has(id)) return levels.get(id)!;
    const nodeDeps = deps.get(id) ?? new Set();
    const level = nodeDeps.size === 0 ? 0 : Math.max(...[...nodeDeps].map(getLevel)) + 1;
    levels.set(id, level);
    return level;
  }
  for (const node of computeNodes) getLevel(node.id);

  const maxLevel = Math.max(...levels.values());
  const columns: AnyNode[][] = Array.from({ length: maxLevel + 1 }, () => []);
  for (const node of computeNodes) columns[levels.get(node.id)!].push(node);
  return columns;
}

function getRefIds(node: AnyNode): string[] {
  const ids: string[] = [];
  for (const v of Object.values(node.params ?? {})) {
    if (v && typeof v === 'object' && 'ref' in v) {
      const ref = (v as { ref: string }).ref;
      const dot = ref.indexOf('.');
      if (dot !== -1) ids.push(ref.slice(0, dot));
    }
  }
  return ids;
}

function sortByBarycenter(nodes: AnyNode[], rowOf: Map<string, number>): AnyNode[] {
  return [...nodes].sort((a, b) => {
    const rowsOf = (n: AnyNode) => getRefIds(n)
      .map(id => rowOf.get(id))
      .filter((r): r is number => r !== undefined);
    const bary = (rows: number[]) => rows.length ? rows.reduce((s, r) => s + r, 0) / rows.length : Infinity;
    return bary(rowsOf(a)) - bary(rowsOf(b));
  });
}

function computeLayout(graph: GeoArtGraph) {
  const controlNodes = graph.control.nodes as unknown as AnyNode[];
  const computeNodes = graph.compute.nodes as unknown as AnyNode[];
  const renderNodes = graph.render.nodes as unknown as AnyNode[];

  const computeColumns = assignComputeColumns(computeNodes);

  const rowOf = new Map<string, number>();
  controlNodes.forEach((n, i) => rowOf.set(n.id, i));

  const sortedComputeColumns = computeColumns.map(col => {
    const sorted = sortByBarycenter(col, rowOf);
    sorted.forEach((n, i) => rowOf.set(n.id, i));
    return sorted;
  });

  const sortedRenderNodes = sortByBarycenter(renderNodes, rowOf);

  return { controlNodes, sortedComputeColumns, sortedRenderNodes };
}

type GraphViewProps = {
  graph: GeoArtGraph;
};

export function GraphView({ graph }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [portPositions, setPortPositions] = useState<Map<string, PortPosition>>(new Map());
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [refHoveredNodeId, setRefHoveredNodeId] = useState<string | null>(null);
  const [outputHoveredPortRef, setOutputHoveredPortRef] = useState<string | null>(null);

  const { controlNodes, sortedComputeColumns, sortedRenderNodes } = useMemo(
    () => computeLayout(graph),
    [graph],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function measure() {
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const handles = container.querySelectorAll<HTMLElement>('[data-port-id]');
      const positions = new Map<string, PortPosition>();
      handles.forEach(el => {
        const portId = el.getAttribute('data-port-id');
        if (!portId) return;
        const rect = el.getBoundingClientRect();
        positions.set(portId, {
          x: rect.left + rect.width / 2 - containerRect.left,
          y: rect.top + rect.height / 2 - containerRect.top,
        });
      });
      setPortPositions(new Map(positions));
    }

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [graph]);

  const connections = collectConnections(graph);

  const highlightedNodeIds = useMemo(() => {
    if (!hoveredNodeId) return new Set<string>();
    const ids = new Set<string>();
    for (const conn of connections) {
      const fromId = conn.from.split(':')[1];
      const toId = conn.to.split(':')[1];
      if (fromId === hoveredNodeId) ids.add(toId);
      if (toId === hoveredNodeId) ids.add(fromId);
    }
    return ids;
  }, [hoveredNodeId, connections]);

  const refHighlightedNodeIds = useMemo(() => {
    const ids = new Set<string>();
    if (refHoveredNodeId) ids.add(refHoveredNodeId);
    if (outputHoveredPortRef) {
      for (const conn of connections) {
        const [, fromNodeId, fromPort] = conn.from.split(':');
        if (`${fromNodeId}.${fromPort}` === outputHoveredPortRef) {
          ids.add(conn.to.split(':')[1]);
        }
      }
    }
    return ids;
  }, [refHoveredNodeId, outputHoveredPortRef, connections]);

  const columnProps = { hoveredNodeId, highlightedNodeIds, onNodeHover: setHoveredNodeId, refHighlightedNodeIds, onRefHover: setRefHoveredNodeId, onOutputPortHover: setOutputHoveredPortRef };

  return (
    <div
      style={{
        background: '#0d1117',
        borderRadius: 8,
        padding: 24,
        minHeight: 400,
        color: '#ccc',
        fontFamily: 'monospace',
        fontSize: 12,
      }}
    >
      <div ref={containerRef} style={{ position: 'relative', display: 'inline-flex', gap: 32, alignItems: 'flex-start' }}>
        <Column title="Control" nodes={controlNodes} layerKind="control" {...columnProps} />
        {sortedComputeColumns.map((colNodes, i) => (
          <Column key={i} title={i === 0 ? 'Compute' : ' '} nodes={colNodes} layerKind="compute" {...columnProps} />
        ))}
        <Column title="Render" nodes={sortedRenderNodes} layerKind="render" {...columnProps} />

        {/* SVG connection overlay */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'visible',
          }}
        >
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#4fc3f7" opacity="0.7" />
            </marker>
            <marker id="arrowhead-active" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#fff" />
            </marker>
          </defs>
          {connections.map((conn, i) => {
            const from = portPositions.get(conn.from);
            const to = portPositions.get(conn.to);
            if (!from || !to) return null;
            const fromId = conn.from.split(':')[1];
            const toId = conn.to.split(':')[1];
            const isActive = hoveredNodeId !== null &&
              (fromId === hoveredNodeId || toId === hoveredNodeId);
            const isDimmed = hoveredNodeId !== null && !isActive;
            const dx = Math.max(40, Math.abs(to.x - from.x) * 0.5);
            return (
              <path
                key={i}
                data-testid={`edge-${fromId}-${toId}`}
                d={`M ${from.x} ${from.y} C ${from.x + dx} ${from.y}, ${to.x - dx} ${to.y}, ${to.x} ${to.y}`}
                stroke={isActive ? '#fff' : '#4fc3f7'}
                strokeWidth={isActive ? 2 : 1.5}
                fill="none"
                opacity={isDimmed ? 0.08 : isActive ? 1 : 0.6}
                markerEnd={isActive ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                style={{ transition: 'opacity 0.15s' }}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
