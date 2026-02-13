
import { EngineModule } from './types';

export const engineRegistry: EngineModule[] = [
    // No engines registered yet
];

export function getEngine(id: string): EngineModule | undefined {
    return engineRegistry.find(e => e.id === id);
}

export function getAllEngines(): EngineModule[] {
    return engineRegistry;
}
