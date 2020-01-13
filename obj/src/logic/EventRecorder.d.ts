import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { OperationalEventV1 } from 'iqs-clients-opevents-node';
import { IncidentV1 } from 'iqs-clients-incidents-node';
import { OrganizationData } from './OrganizationData';
import { ExternalDependencies } from './ExternalDependencies';
import { EventGenerationV1 } from '../data/version1/EventGenerationV1';
export declare class EventRecorder implements IConfigurable {
    private _dependencies;
    setDependencies(dependencies: ExternalDependencies): void;
    configure(config: ConfigParams): void;
    private getEventType;
    private getEventPos;
    generateEvent(generation: EventGenerationV1, organizationData: OrganizationData): OperationalEventV1;
    generateEvents(generations: EventGenerationV1[], organizationData: OrganizationData): OperationalEventV1[];
    generateIncident(event: OperationalEventV1): IncidentV1;
    private checkIncident;
    generateIncidents(events: OperationalEventV1[], organizationData: OrganizationData): IncidentV1[];
    private recordOperationalEvents;
    private recordIncidents;
    recordEvents(correlationId: string, generations: EventGenerationV1[], organizationData: OrganizationData, callback: (err: any) => void): void;
}
