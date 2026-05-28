import type React from 'react';

export type InputDescriptor =
  | { kind: 'static'; value: unknown }
  | { kind: 'default'; value: unknown }
  | { kind: 'ref'; ref: string };

export type PortSchemaMeta = {
  name: string;
  valueKind: string;
};

export type NodeRepresentationProps = {
  nodeId: string;
  nodeKind: string;
  inputs: Record<string, InputDescriptor>;
  inputPorts: PortSchemaMeta[];
  outputPorts: PortSchemaMeta[];
  onRefHover?: (nodeId: string | null) => void;
  onOutputPortHover?: (portRef: string | null) => void;
};

export type RenderRepresentationFn = (props: NodeRepresentationProps) => React.ReactNode;
