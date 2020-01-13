import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { OrganizationV1 } from 'pip-clients-organizations-node';
import { StatCounterIncrementV1 } from 'pip-clients-statistics-node';
import { EventGenerationV1 } from '../data/version1/EventGenerationV1';
import { OrganizationData } from './OrganizationData';
import { ExternalDependencies } from './ExternalDependencies';
export declare class StatisticsRecorder implements IConfigurable {
    private _dependencies;
    private _dumpCacheInterval;
    private _cache;
    private _maxCacheSize;
    setDependencies(dependencies: ExternalDependencies): void;
    configure(config: ConfigParams): void;
    generateEventIncrements(organization: OrganizationV1, generation: EventGenerationV1): StatCounterIncrementV1[];
    generateIncrements(organization: OrganizationV1, generations: EventGenerationV1[]): StatCounterIncrementV1[];
    recordStatistics(correlationId: string, generations: EventGenerationV1[], organizationData: OrganizationData, callback: (err: any) => void): void;
    dumpCache(correlationId: string, callback: (err: any) => void): void;
}
