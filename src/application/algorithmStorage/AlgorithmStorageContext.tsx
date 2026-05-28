import { createContext, useContext } from 'react';
import type { IAlgorithmStorageService } from './IAlgorithmStorageService';

export const AlgorithmStorageContext = createContext<IAlgorithmStorageService | null>(null);

export function useAlgorithmStorage(): IAlgorithmStorageService {
  const service = useContext(AlgorithmStorageContext);
  if (!service) throw new Error('AlgorithmStorageContext not provided');
  return service;
}
