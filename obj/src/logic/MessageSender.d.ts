import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { OrganizationData } from './OrganizationData';
import { EventGenerationV1 } from '../data/version1/EventGenerationV1';
import { ExternalDependencies } from './ExternalDependencies';
export declare class MessageSender implements IConfigurable {
    private static _defaultConfig;
    private _dependencies;
    private _message;
    setDependencies(dependencies: ExternalDependencies): void;
    configure(config: ConfigParams): void;
    private inflateActivation;
    sendMessages(correlationId: string, generations: EventGenerationV1[], organizationData: OrganizationData, callback: (err: any) => void): void;
}
