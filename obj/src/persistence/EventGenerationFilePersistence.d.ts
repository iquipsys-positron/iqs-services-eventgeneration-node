import { ConfigParams } from 'pip-services3-commons-node';
import { JsonFilePersister } from 'pip-services3-data-node';
import { EventGenerationMemoryPersistence } from './EventGenerationMemoryPersistence';
import { LastEventGenerationV1 } from '../data/version1/LastEventGenerationV1';
export declare class EventGenerationFilePersistence extends EventGenerationMemoryPersistence {
    protected _persister: JsonFilePersister<LastEventGenerationV1>;
    constructor(path?: string);
    configure(config: ConfigParams): void;
}
