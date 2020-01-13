import { LastEventGenerationV1 } from '../data/version1/LastEventGenerationV1';
export interface IEventGenerationPersistence {
    getExisting(correlationId: string, orgId: string, ruleId: string, objectId: string, callback: (err: any, item: LastEventGenerationV1) => void): void;
    createOrUpdate(correlationId: string, item: LastEventGenerationV1, callback: (err: any, item: LastEventGenerationV1) => void): void;
}
