import { AlgorithmStorageProvider } from "./algorithmStorage/AlgorithmStorageProvider";
import { LocalStorageAlgorithmStorageService } from "./algorithmStorage/LocalStorageAlgorithmStorageService";
import { App } from "./App";

export function ApplicationEntry() {
    return (
        <AlgorithmStorageProvider service={new LocalStorageAlgorithmStorageService()}>
            <App />
        </AlgorithmStorageProvider>
    );
}