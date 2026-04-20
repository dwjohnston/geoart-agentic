export type ValidationSeverity = 'error' | 'warning';

export type ValidationError = {
  code: string;
  severity: ValidationSeverity;
  message: string;
  nodeId?: string;
  paramName?: string;
};

export type SemanticValidationResult = {
  /** False if any error-severity item is present. Warnings do not affect validity. */
  valid: boolean;
  errors: ValidationError[];
};
