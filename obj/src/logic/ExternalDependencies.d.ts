import { CompositeLogger } from 'pip-services3-components-node';
import { IMessageDistributionClientV1 } from 'pip-clients-msgdistribution-node';
import { IOrganizationsClientV1 } from 'pip-clients-organizations-node';
import { IControlObjectsClientV1 } from 'iqs-clients-controlobjects-node';
import { IEventRulesClientV1 } from 'iqs-clients-eventrules-node';
import { IZonesClientV1 } from 'iqs-clients-zones-node';
import { IOperationalEventsClientV1 } from 'iqs-clients-opevents-node';
import { IIncidentsClientV1 } from 'iqs-clients-incidents-node';
import { ISignalsClientV1 } from 'iqs-clients-signals-node';
import { IStatisticsClientV1 } from 'pip-clients-statistics-node';
import { IEventGenerationPersistence } from '../persistence/IEventGenerationPersistence';
export declare class ExternalDependencies {
    logger: CompositeLogger;
    messageDistributionClient: IMessageDistributionClientV1;
    organizationsClient: IOrganizationsClientV1;
    objectsClient: IControlObjectsClientV1;
    eventRulesClient: IEventRulesClientV1;
    zonesClient: IZonesClientV1;
    eventsClient: IOperationalEventsClientV1;
    incidentsClient: IIncidentsClientV1;
    signalsClient: ISignalsClientV1;
    statisticsClient: IStatisticsClientV1;
    persistence: IEventGenerationPersistence;
}
