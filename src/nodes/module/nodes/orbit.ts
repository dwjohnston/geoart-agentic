/**
 * Orbit Module Implementation
 *
 * Encapsulates orbital motion with configurable control and render layers.
 * Generates control nodes (sliders) and render nodes based on configuration.
 */

import { implementModule } from '../implementModule';
import { createInternalId } from '../moduleUtils';
import type { ModuleExpansionResult } from '../../../graphEngine/externalInterfaces/ModuleImplementation';
import type { ModuleNodeKinds, NodeInputsDeclared, NodeInputsResolved, ReferencedValueDeclared } from '../../../schema/typeHelpers';
import type { ControlNode } from '../../../schema/_generated/schema-types';
import { fColorPoint } from '../../../constants';
// Helpers
function needsControl<NodeKind extends ModuleNodeKinds>(params: NodeInputsDeclared<NodeKind>, key: keyof NodeInputsDeclared<NodeKind>): boolean {
  if (!params[key]) {
    return true;
  }

  if ("ref" in params[key]) {
    return false;
  }

  return true;
}


function pushControlNodeIfNeed<NodeKind extends ModuleNodeKinds, NodeInputKey extends keyof NodeInputsDeclared<NodeKind>>(
  controlNodes: ModuleExpansionResult['controlNodes'],
  params: NodeInputsDeclared<NodeKind>,
  defaultValues: NodeInputsResolved<NodeKind>,
  key: NodeInputKey,
  controlNode: (value: Exclude<Required<NodeInputsDeclared<NodeKind>>[NodeInputKey], ReferencedValueDeclared>) => ControlNode
): void {
  if (needsControl(params, key)) {


    const param = params[key] as Exclude<Required<NodeInputsDeclared<NodeKind>>[NodeInputKey], ReferencedValueDeclared>;


    //@ts-expect-error I'm pretty sure this is right
    controlNodes.push(controlNode(param ?? { v: defaultValues[key] }))
  }

}



const orbitModuleImplementation = implementModule({
  _kind: "orbit-module",
  defaultValues: {
    speed: 0.01,

    "centerPoints": [fColorPoint()],
    "eccentricity": 1,
    "tilt": 0,
    "phase": 0,
    numPoints: 1,
    time: 0,
    "radius": 1,


  },
  fn: (params, moduleId, defaultValues) => {
    const controlNodes: ModuleExpansionResult['controlNodes'] = [];
    const computeNodes: ModuleExpansionResult['computeNodes'] = [];
    const renderNodes: ModuleExpansionResult['renderNodes'] = [];


    // Generate control nodes based on config
    pushControlNodeIfNeed(controlNodes, params, defaultValues, "speed", (value) => {
      return {
        id: createInternalId(moduleId, 'speed-slider'),
        type: 'slider',
        params: {
          label: { v: 'Speed' },
          min: { v: -0.1 },
          max: { v: 0.1 },
          step: { v: 0.01 },
          value,
        },
      }
    });

    pushControlNodeIfNeed(controlNodes, params, defaultValues, "numPoints", (value) => {
      return {
        id: createInternalId(moduleId, 'numPoints-slider'),
        type: 'slider',
        params: {
          label: { v: 'Num points' },
          min: { v: 1 },
          max: { v: 100 },
          step: { v: 1 },
          value,
        },
      }
    });

    pushControlNodeIfNeed(controlNodes, params, defaultValues, "radius", (value) => {
      return {
        id: createInternalId(moduleId, 'radius-slider'),
        type: 'slider',
        params: {
          label: { v: 'Radius' },
          min: { v: 0 },
          max: { v: 0.5 },
          value,
          step: { v: 0.01 },
        },
      }
    });

    pushControlNodeIfNeed(controlNodes, params, defaultValues, "phase", (value) => {
      return {
        id: createInternalId(moduleId, 'phase-slider'),
        type: 'slider',
        params: {
          label: { v: 'Phase' },
          min: { v: 0 },
          max: { v: 1 },
          value,
          step: { v: 0.01 },
        },
      }
    });

    pushControlNodeIfNeed(controlNodes, params, defaultValues, "eccentricity", (value) => {
      return {
        id: createInternalId(moduleId, 'eccentricity-slider'),
        type: 'slider',
        params: {
          label: { v: 'Eccentricity' },
          min: { v: 0 },
          max: { v: 0.99 },
          value,
          step: { v: 0.01 },
        },
      }
    });

    pushControlNodeIfNeed(controlNodes, params, defaultValues, "tilt", (value) => {
      return {
        id: createInternalId(moduleId, 'tilt-slider'),
        type: 'slider',
        params: {
          label: { v: 'Tilt' },
          min: { v: 0 },
          max: { v: 1 },
          value,
          step: { v: 0.01 },
        },
      }
    });

    // Create orbit compute node
    const orbitNodeId = createInternalId(moduleId, 'orbit');

    // Build orbit params, using generated sliders or provided values
    const buildParamRef = (key: 'speed' | 'radius' | 'phase' | 'eccentricity' | 'tilt' | 'numPoints') => {
      const sliderId = createInternalId(moduleId, `${key}-slider`);
      if (needsControl(params, key)) {
        return { ref: `${sliderId}.value` };
      }
      return params[key];
    };

    computeNodes.push({
      id: orbitNodeId,
      type: 'orbit',
      params: {
        time: params.time,
        speed: buildParamRef('speed'),
        radius: buildParamRef('radius'),
        numPoints: buildParamRef("numPoints"),
        centerPoints: params.centerPoints,
        phase: buildParamRef('phase'),
        eccentricity: buildParamRef('eccentricity'),
        tilt: buildParamRef('tilt'),
      },
    });

    computeNodes.push({
      id: orbitNodeId,
      type: 'orbit',
      params: {
        time: params.time,
        speed: buildParamRef('speed'),
        radius: buildParamRef('radius'),
        numPoints: buildParamRef("numPoints"),
        centerPoints: params.centerPoints,
        phase: buildParamRef('phase'),
        eccentricity: buildParamRef('eccentricity'),
        tilt: buildParamRef('tilt'),
      },
    });


    // Generate render nodes based on config
    renderNodes.push({
      id: createInternalId(moduleId, 'point-circle'),
      type: 'circle',
      params: {
        intervalTicks: { v: 0 },
        radius: { v: 0.025 },
        eccentricity: { v: 0 },
        tilt: { v: 0 },
        centerPoints: { ref: `${orbitNodeId}.points` }
      },
      renderConfig: { layer: 'live' },
    });

    const circleId = createInternalId(moduleId, 'orbit-path');
    renderNodes.push({
      id: circleId,
      type: 'circle',
      params: {
        intervalTicks: { v: 1 },
        radius: buildParamRef("radius"),
        eccentricity: buildParamRef('eccentricity'),
        tilt: buildParamRef('tilt'),
        centerPoints: params.centerPoints
      },
      renderConfig: { layer: 'live' },
    });


    const traceId = createInternalId(moduleId, 'orbit-trace');
    renderNodes.push({
      id: traceId,
      type: 'circle',
      params: {
        intervalTicks: { v: 1 },
        radius: { v: 0.0025 },
        eccentricity: { v: 0 },
        tilt: { v: 0 },
        centerPoints: { ref: `${orbitNodeId}.points` }
      },
      renderConfig: { layer: 'paint' },
    });

    // Create marker node
    const result: ModuleExpansionResult = {
      controlNodes,
      computeNodes,
      renderNodes,
      markerNode: {
        id: moduleId,
        type: 'module-marker',
        params: {},
        nodeSource: {
          sourceType: 'module',
          sourceId: moduleId,
        },
      },
    };


    console.log(result)

    return result;
  }
});

export default orbitModuleImplementation;
