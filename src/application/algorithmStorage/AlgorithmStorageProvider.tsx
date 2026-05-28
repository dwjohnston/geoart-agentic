import type { ReactNode } from "react";
import { AlgorithmStorageContext } from "./AlgorithmStorageContext";
import type { IAlgorithmStorageService } from "./IAlgorithmStorageService";

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