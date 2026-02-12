
import { EngineModule } from './types';
// Importing sequence-engine module implementation
import { sequenceEngineModule } from './sequence-engine/module';

export const engineRegistry: EngineModule[] = [
    sequenceEngineModule,
];

export function getEngine(id: string): EngineModule | undefined {
    return engineRegistry.find(e => e.id === id);
}

export function getAllEngines(): EngineModule[] {
    return engineRegistry;
}
