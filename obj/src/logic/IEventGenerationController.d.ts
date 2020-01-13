import { EventGenerationStateV1 } from '../data/version1/EventGenerationStateV1';
import { EventGenerationV1 } from '../data/version1/EventGenerationV1';
export interface IEventGenerationController {
    generateEventsForState(correlationId: string, state: EventGenerationStateV1, callback?: (err: any, generations: EventGenerationV1[]) => void): void;
    generateEventsForStates(correlationId: string, states: EventGenerationStateV1[], callback?: (err: any, generations: EventGenerationV1[]) => void): void;
}
