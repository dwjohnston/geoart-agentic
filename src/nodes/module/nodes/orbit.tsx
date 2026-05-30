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
import { KnobControl } from '../../../ui/KnobControl';


/**
 * Where I'm leaving this. 
 * it looks like the compiler already omits values that are already provided via ref. 
 * 
 * so needsControl neeeds to be reworked. 
 * 
 * And we need a full rework of the types.   

 */

function needsControl<NodeKind extends ModuleNodeKinds>(params: NodeInputsDeclared<NodeKind>, key: keyof NodeInputsDeclared<NodeKind>): boolean {

  console.log(params)
  if (!params[key]) {
    return true;
  }

  if ("ref" in params[key]) {
    return false;
  }

  return true;
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
function pushControlNodeIfNeed<NodeKind extends ModuleNodeKinds, NodeInputKey extends keyof NodeInputsDeclared<NodeKind>>(
  controlNodes: ModuleExpansionResult<NodeKind>['controlNodes'],
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


function renderIfNeeded<NodeKind extends ModuleNodeKinds, NodeInputKey extends keyof NodeInputsDeclared<NodeKind>>
  (
    params: NodeInputsDeclared<NodeKind>,
    key: keyof NodeInputsDeclared<NodeKind>,
    defaultValues: NodeInputsResolved<NodeKind>,
    renderControl: (param: Exclude<Required<NodeInputsDeclared<NodeKind>>[NodeInputKey], ReferencedValueDeclared>) => React.ReactNode) {
  if (needsControl(params, key)) {

    const param = params[key] as Exclude<Required<NodeInputsDeclared<NodeKind>>[NodeInputKey], ReferencedValueDeclared> ?? { v: defaultValues[key] };

    return renderControl(param.v);
  }
  return null;
}

function createInputMarkerParams<NodeKind extends ModuleNodeKinds>(params: NodeInputsDeclared<NodeKind>, defaultValues: NodeInputsResolved<NodeKind>): NodeInputsDeclared<NodeKind> {
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
            {renderIfNeeded(params, 'speed', defaultValues, (param, onChange) => {
              console.log(param)
              return <KnobControl label="Speed" min={-1} max={1} initialValue={param} onChange={(v) => set("speed", { v })} />
            })}

            {renderIfNeeded(params, 'radius', defaultValues, (param, onChange) => {
              console.log(param)
              return <KnobControl label="raasssdius" min={0} max={1} initialValue={param ?? 0.5} onChange={(v) => set("radius", { v })} />
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
