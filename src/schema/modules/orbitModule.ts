import type { ModuleDef } from './types';

const RING_COLOR = { r: 0.3, g: 0.3, b: 0.35, a: 0.5 };
const DOT_COLOR = { r: 0.5, g: 0.5, b: 0.5, a: 1 };

/**
 * Orbit module — bundles an orbit compute node with:
 * - control nodes for each numeric input (radius, speed, eccentricity, tilt, phase, numPoints)
 * - a render node drawing the orbit path (ellipse)
 * - a render node drawing the current position marker
 *
 * Output port: `points` — the colorPointArray from the inner orbit compute node.
 */
export const orbitModule: ModuleDef = {
  name: 'orbit',

  inputs: [
    {
      name: 'time',
      valueType: 'numberValue',
      controlNode: null, // always supplied as a ref
      defaultValue: { v: 0 },
    },
    {
      name: 'radius',
      valueType: 'numberValue',
      controlNode: {
        type: 'slider',
        defaultParams: {
          label: { v: 'Radius' },
          min: { v: 0 },
          max: { v: 1 },
          value: { v: 0.4 },
          step: { v: 0.01 },
        },
      },
      defaultValue: { v: 0.4 },
    },
    {
      name: 'speed',
      valueType: 'numberValue',
      controlNode: {
        type: 'slider',
        defaultParams: {
          label: { v: 'Speed' },
          min: { v: -5 },
          max: { v: 5 },
          value: { v: 1 },
          step: { v: 0.1 },
        },
      },
      defaultValue: { v: 1 },
    },
    {
      name: 'eccentricity',
      valueType: 'numberValue',
      controlNode: {
        type: 'slider',
        defaultParams: {
          label: { v: 'Eccentricity' },
          min: { v: 0 },
          max: { v: 0.99 },
          value: { v: 0 },
          step: { v: 0.01 },
        },
      },
      defaultValue: { v: 0 },
    },
    {
      name: 'tilt',
      valueType: 'numberValue',
      controlNode: {
        type: 'slider',
        defaultParams: {
          label: { v: 'Tilt' },
          min: { v: 0 },
          max: { v: 1 },
          value: { v: 0 },
          step: { v: 0.01 },
        },
      },
      defaultValue: { v: 0 },
    },
    {
      name: 'phase',
      valueType: 'numberValue',
      controlNode: {
        type: 'slider',
        defaultParams: {
          label: { v: 'Phase' },
          min: { v: 0 },
          max: { v: 1 },
          value: { v: 0 },
          step: { v: 0.01 },
        },
      },
      defaultValue: { v: 0 },
    },
    {
      name: 'numPoints',
      valueType: 'numberValue',
      controlNode: {
        type: 'slider',
        defaultParams: {
          label: { v: 'Num Points' },
          min: { v: 1 },
          max: { v: 12 },
          value: { v: 1 },
          step: { v: 1 },
        },
      },
      defaultValue: { v: 1 },
    },
  ],

  outputs: [
    {
      name: 'points',
      getInternalRef: (moduleId) => `${moduleId}__orbit.points`,
    },
  ],

  buildNodes: (moduleId, resolvedInputs) => [
    // ── Compute: the orbit itself ────────────────────────────────────────
    {
      id: `${moduleId}__orbit`,
      layer: 'compute',
      type: 'orbit',
      params: {
        time: { ref: resolvedInputs.get('time')! },
        radius: { ref: resolvedInputs.get('radius')! },
        speed: { ref: resolvedInputs.get('speed')! },
        eccentricity: { ref: resolvedInputs.get('eccentricity')! },
        tilt: { ref: resolvedInputs.get('tilt')! },
        phase: { ref: resolvedInputs.get('phase')! },
        numPoints: { ref: resolvedInputs.get('numPoints')! },
      },
    },

    // ── Render: orbit path ellipse ───────────────────────────────────────
    {
      id: `${moduleId}__orbitPath`,
      layer: 'render',
      type: 'circle',
      renderConfig: { layer: 'live' },
      params: {
        center: { v: { x: 0, y: 0 } },
        radius: { ref: resolvedInputs.get('radius')! },
        eccentricity: { ref: resolvedInputs.get('eccentricity')! },
        tilt: { ref: resolvedInputs.get('tilt')! },
        color: { v: RING_COLOR },
      },
    },

    // ── Render: current position marker ─────────────────────────────────
    {
      id: `${moduleId}__orbitDot`,
      layer: 'render',
      type: 'circle',
      renderConfig: { layer: 'live' },
      params: {
        centerPoints: { ref: `${moduleId}__orbit.points` },
        radius: { v: 0.015 },
        color: { v: DOT_COLOR },
      },
    },
  ],
};
