/**
 * Orbit Module Implementation
 *
 * Encapsulates orbital motion with configurable control and render layers.
 * Generates control nodes (sliders) and render nodes based on configuration.
 */

import { implementModule } from '../implementModule';
import { createInternalId } from '../moduleUtils';
import type { ModuleControlSetter, ModuleExpansionResult, StaticModuleNodeParams } from '../../../graphEngine/externalInterfaces/ModuleImplementation';
import type { ModuleNodeKinds, NodeInputsDeclared, NodeInputsResolved } from '../../../schema/typeHelpers';
import { fColorPoint } from '../../../constants';
import { KnobControl } from '../../../ui/KnobControl';



// nb. the typing on the onChange handler - NodeInputsResolved, not StaticModuleNodeParams which is a partial - basically we are kind of asserting that all values will exist and then can access via key of.
// The render if needed already does a check to see that the value definitely will exist. 

export type RenderControlFn<NodeKind extends ModuleNodeKinds, NodeInputKey extends keyof NodeInputsDeclared<NodeKind>> = (initialValue: Required<StaticModuleNodeParams<NodeKind>>[NodeInputKey], onChange: (value: NodeInputsResolved<NodeKind>[NodeInputKey]) => void) => React.ReactNode

function renderIfNeeded<
  NodeKind extends ModuleNodeKinds,
  NodeInputKey extends keyof NodeInputsDeclared<NodeKind>>
  (
    params: StaticModuleNodeParams<NodeKind>,
    key: NodeInputKey,
    controlSetter: ModuleControlSetter<NodeKind>,
    renderControl: RenderControlFn<NodeKind, NodeInputKey>) {

  if (Object.hasOwn(params, key)) {
    const initialValue = (params as Required<typeof params>)[key];
    return renderControl(initialValue, (v) => controlSetter(key, v));
  }
  return null;
}



// I'm going to leave this here for now. 
// The point of it is to curry in the params and the set function, 
// but the typings are not playing nicely

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createRenderIfNeeded<
  NodeKind extends ModuleNodeKinds,
  NodeInputKey extends keyof NodeInputsDeclared<NodeKind>>(
    params: StaticModuleNodeParams<NodeKind>,
    controlSetter: ModuleControlSetter<NodeKind>,
  ) {
  return (key: NodeInputKey, renderControl: RenderControlFn<NodeKind, NodeInputKey>) => {
    return renderIfNeeded(params, key, controlSetter, renderControl)
  }
}
export function createInputMarkerParams<NodeKind extends ModuleNodeKinds>(params: NodeInputsDeclared<NodeKind>, defaultValues: NodeInputsResolved<NodeKind>): NodeInputsDeclared<NodeKind> {
  const result: Record<string, unknown> = {};

  for (const key in defaultValues) {
    if (params[key]) {
      result[key] = params[key];
    } else {
      result[key] = { v: defaultValues[key] };
    }
  }

  return result as NodeInputsDeclared<NodeKind>;
}



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
    // For each module input, use the provided param (ref or static value) or fall back to the default value

    console.log(moduleId)
    const inputMarkerId = createInternalId(moduleId, 'input-marker')

    const result: ModuleExpansionResult<"orbit-module"> = {
      controlNodes,
      computeNodes,
      renderNodes,
      inputMarkerNode: {
        id: inputMarkerId,
        type: "module-input-marker",
        params: createInputMarkerParams(params, defaultValues),
        renderControl: (params, set) => {

          return <div data-testid={`${inputMarkerId}-controls`}>

            {renderIfNeeded(params, 'speed', set, (initialValue, onChange) => {
              console.log(initialValue)
              return <KnobControl label="Speed" min={-1} max={1} initialValue={initialValue} onChange={onChange} />
            })}

            {renderIfNeeded(params, 'radius', set, (initialValue, onChange) => {
              console.log(initialValue)
              return <KnobControl label="raasssdius" min={0} max={1} initialValue={initialValue} onChange={onChange} />
            })}



          </div>
        },
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
