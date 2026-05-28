import { DefaultNodeBody } from './DefaultNodeBody';
import type { RenderRepresentationFn } from '../graphEngine/externalInterfaces/graphViewTypes';

import { computeRegistry, renderRegistry, controlRegistry } from '../graphEngine/exports'

type ViewNodeDef = { nodeKind: string; renderRepresentation?: RenderRepresentationFn; defaultValues?: Record<string, unknown> };

function toViewDef(d: unknown): ViewNodeDef | null {
  if (d && typeof d === 'object' && 'nodeKind' in d) {
    const def = d as { nodeKind: string; renderRepresentation?: RenderRepresentationFn; defaultValues?: Record<string, unknown> };
    return { nodeKind: def.nodeKind, renderRepresentation: def.renderRepresentation, defaultValues: def.defaultValues };
  }
  return null;
}

const allDefs: ViewNodeDef[] = [
  ...(Object.values(computeRegistry)).flatMap(d => { const v = toViewDef(d); return v ? [v] : []; }),
  ...(Object.values(renderRegistry)).map(d => ({ nodeKind: d.nodeKind, renderRepresentation: d.renderRepresentation, defaultValues: d.defaultValues as Record<string, unknown> })),
  ...(Object.values(controlRegistry)).map(d => ({ nodeKind: d.nodeKind, renderRepresentation: d.renderRepresentation, defaultValues: d.defaultValues as Record<string, unknown> })),
];

const legacyComputeKinds: string[] = (Object.values(computeRegistry))
  .filter(d => d && typeof d === 'object' && !('nodeKind' in d) && 'type' in d)
  .map(d => (d as { type: string }).type);

const representationRegistry = new Map<string, RenderRepresentationFn>([
  ...legacyComputeKinds.map(k => [k, DefaultNodeBody] as [string, RenderRepresentationFn]),
  ...allDefs.map(d => [d.nodeKind, d.renderRepresentation ?? DefaultNodeBody] as [string, RenderRepresentationFn]),
]);

const defaultsRegistry = new Map<string, Record<string, unknown>>(
  allDefs
    .filter(d => d.defaultValues)
    .map(d => [d.nodeKind, d.defaultValues as Record<string, unknown>])
);

export function getRepresentationForKind(kind: string): RenderRepresentationFn {
  return representationRegistry.get(kind) ?? DefaultNodeBody;
}

export function getDefaultsForKind(kind: string): Record<string, unknown> {
  return defaultsRegistry.get(kind) ?? {};
}
