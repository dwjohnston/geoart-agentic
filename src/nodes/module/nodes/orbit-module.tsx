/**
 * Orbit Module Implementation
 *
 * Encapsulates orbital motion with configurable control and render layers.
 * Generates control nodes (sliders) and render nodes based on configuration.
 */

import { implementModule } from '../implementModule';
import { createInternalId, createInputMarkerParams, renderIfNeeded } from '../moduleUtils';
import type { ModuleExpansionResult } from '../../../graphEngine/externalInterfaces/ModuleImplementation';
import type { NodeInputsDeclared } from '../../../schema/typeHelpers';
import { fColorPoint } from '../../../constants';
import { KnobControl } from '../../../ui/KnobControl';
import { ModulePanel } from '../../../ui/ModulePanel';

export { createInputMarkerParams, renderIfNeeded } from '../moduleUtils';
export type { RenderControlFn } from '../moduleUtils';



const orbitModuleImplementation = implementModule({
  _kind: "orbit-module",
  defaultValues: {
    speed: 0.3,

    "centerPoints": [fColorPoint()],
    "eccentricity": 0,
    "tilt": 0,
    "phase": 0,
    numPoints: 1,
    time: 0,
    "radius": 0.5,


  },

  provideNodes: (params, moduleId, defaultValues) => {
    const controlNodes: ModuleExpansionResult<"orbit-module">['controlNodes'] = [];
    const computeNodes: ModuleExpansionResult<"orbit-module">['computeNodes'] = [];
    const renderNodes: ModuleExpansionResult<"orbit-module">['renderNodes'] = [];



    const inputMarkerNodeId = createInternalId(moduleId, 'input-marker');


    // Create orbit compute node
    const orbitNodeId = createInternalId(moduleId, 'orbit');


    const buildParamRef = (key: keyof NodeInputsDeclared<"orbit-module">) => {
      const inputMarkerOutputPort = inputMarkerNodeId + "." + key;
      return {
        ref: inputMarkerOutputPort
      }
    };

    computeNodes.push({
      id: orbitNodeId,
      type: 'orbit',
      params: {
        time: buildParamRef('time'),
        speed: buildParamRef('speed'),
        radius: buildParamRef('radius'),
        numPoints: buildParamRef("numPoints"),
        centerPoints: buildParamRef('centerPoints'),
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
      renderConfig: {
        layer: 'live',
        "displayByDefault": true,
        "tags": ["orbit", "points"]
      },
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
      renderConfig: {
        layer: 'live',
        "displayByDefault": true,
        "tags": ["orbit", "path"]
      },
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
      renderConfig: {
        layer: 'paint',
        "displayByDefault": false,
        "tags": ["orbit", "trail"]
      },
    });

    // Create marker node
    // For each module input, use the provided param (ref or static value) or fall back to the default value

    const inputMarkerId = createInternalId(moduleId, 'input-marker')

    const result: ModuleExpansionResult<"orbit-module"> = {
      controlNodes,
      computeNodes,
      renderNodes,
      inputMarkerNode: {
        id: inputMarkerId,
        type: "module-input-marker",
        params: createInputMarkerParams(params, defaultValues),
        renderControl: (params, set) => (
          <ModulePanel moduleName="Orbit" moduleId={moduleId} data-testid={`${inputMarkerId}-controls`}>
            {renderIfNeeded(params, 'speed', set, (initialValue, onChange) => (
              <KnobControl label="Speed" min={-1} max={1} initialValue={initialValue} onChange={onChange} />
            ))}

            {renderIfNeeded(params, 'radius', set, (initialValue, onChange) => (
              <KnobControl label="Radius" min={0} max={1} initialValue={initialValue} onChange={onChange} />
            ))}

            {renderIfNeeded(params, 'numPoints', set, (initialValue, onChange) => (
              <KnobControl label="Points" min={0} max={1000} initialValue={initialValue} onChange={onChange} />
            ))}

            {renderIfNeeded(params, 'phase', set, (initialValue, onChange) => (
              <KnobControl label="Phase" min={0} max={1} initialValue={initialValue} onChange={onChange} />
            ))}

            {renderIfNeeded(params, 'eccentricity', set, (initialValue, onChange) => (
              <KnobControl label="Eccentricity" min={0} max={1} initialValue={initialValue} onChange={onChange} />
            ))}

            {renderIfNeeded(params, 'tilt', set, (initialValue, onChange) => (
              <KnobControl label="Tilt" min={0} max={1} initialValue={initialValue} onChange={onChange} />
            ))}
          </ModulePanel>
        ),
      },
      defaultValues,
      outputMarkerNode: {
        id: moduleId,
        type: 'module-output-marker',
        params: {},
        outputRefs: {
          points: {
            "ref": `${orbitNodeId}.points`
          }
        },
        nodeSource: {
          sourceType: 'module',
          sourceId: moduleId,
        },
      },
    };

    return result;
  }
});

export default orbitModuleImplementation;
