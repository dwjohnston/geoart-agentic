import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { IAlgorithmStorageService } from './IAlgorithmStorageService';

const AlgorithmStorageContext = createContext<IAlgorithmStorageService | null>(null);

type Props = {
  service: IAlgorithmStorageService;
  children: ReactNode;
};

export function AlgorithmStorageProvider({ service, children }: Props) {
  return (
    <AlgorithmStorageContext.Provider value={service}>
      {children}
    </AlgorithmStorageContext.Provider>
  );
}

export function useAlgorithmStorage(): IAlgorithmStorageService {
  const service = useContext(AlgorithmStorageContext);
  if (!service) throw new Error('AlgorithmStorageContext not provided');
  return service;
}
