import { IdentifiableMemoryPersistence } from 'pip-services3-data-node';
import { LastEventGenerationV1 } from '../data/version1/LastEventGenerationV1';
import { IEventGenerationPersistence } from './IEventGenerationPersistence';
export declare class EventGenerationMemoryPersistence extends IdentifiableMemoryPersistence<LastEventGenerationV1, string> implements IEventGenerationPersistence {
    constructor();
    getExisting(correlationId: string, orgId: string, ruleId: string, objectId: string, callback: (err: any, item: LastEventGenerationV1) => void): void;
    createOrUpdate(correlationId: string, item: LastEventGenerationV1, callback: (err: any, item: LastEventGenerationV1) => void): void;
}
