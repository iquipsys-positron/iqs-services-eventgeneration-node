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

export class ExternalDependencies {
    public logger: CompositeLogger;

    public messageDistributionClient: IMessageDistributionClientV1;
    public organizationsClient: IOrganizationsClientV1;
    public objectsClient: IControlObjectsClientV1;
    public eventRulesClient: IEventRulesClientV1;
    public zonesClient: IZonesClientV1;
    public eventsClient: IOperationalEventsClientV1;
    public incidentsClient: IIncidentsClientV1;
    public signalsClient: ISignalsClientV1;
    public statisticsClient: IStatisticsClientV1;
    public persistence: IEventGenerationPersistence;
}