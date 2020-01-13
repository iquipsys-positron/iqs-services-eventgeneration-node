import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { OrganizationData } from './OrganizationData';
import { ExternalDependencies } from './ExternalDependencies';
export declare class DataManager implements IConfigurable {
    private _dependencies;
    private _cacheTimeout;
    private _cache;
    setDependencies(dependencies: ExternalDependencies): void;
    configure(config: ConfigParams): void;
    private getCachedData;
    private retrieveData;
    loadData(correlationId: string, orgId: string, callback: (err: any, data: OrganizationData) => void): void;
    forceLoadData(correlationId: string, orgId: string, callback: (err: any, data: OrganizationData) => void): void;
    clearStaleData(): void;
    clear(): void;
}
