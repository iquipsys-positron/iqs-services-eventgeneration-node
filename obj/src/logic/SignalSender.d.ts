import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { SignalV1 } from 'iqs-clients-signals-node';
import { OrganizationData } from './OrganizationData';
import { EventGenerationV1 } from '../data/version1/EventGenerationV1';
import { ExternalDependencies } from './ExternalDependencies';
export declare class SignalSender implements IConfigurable {
    private _dependencies;
    setDependencies(dependencies: ExternalDependencies): void;
    configure(config: ConfigParams): void;
    generateSignals(generations: EventGenerationV1[], organizationData: OrganizationData): SignalV1[];
    sendSignals(correlationId: string, generations: EventGenerationV1[], organizationData: OrganizationData, callback: (err: any) => void): void;
}
