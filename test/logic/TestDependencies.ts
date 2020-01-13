import { CompositeLogger } from 'pip-services3-components-node';

import { MessageDistributionNullClientV1 } from 'pip-clients-msgdistribution-node';
import { OrganizationsMemoryClientV1 } from 'pip-clients-organizations-node';
import { ControlObjectsMemoryClientV1 } from 'iqs-clients-controlobjects-node';
import { EventRulesMemoryClientV1 } from 'iqs-clients-eventrules-node';
import { ZonesMemoryClientV1 } from 'iqs-clients-zones-node';
import { OperationalEventsNullClientV1 } from 'iqs-clients-opevents-node';
import { IncidentsNullClientV1 } from 'iqs-clients-incidents-node';
import { SignalsNullClientV1 } from 'iqs-clients-signals-node';
import { StatisticsNullClientV1 } from 'pip-clients-statistics-node';

import { ExternalDependencies } from '../../src/logic/ExternalDependencies';
import { EventGenerationMemoryPersistence } from '../../src/persistence/EventGenerationMemoryPersistence';

export class TestDependencies extends ExternalDependencies {
    public constructor() {
        super();

        this.messageDistributionClient = new MessageDistributionNullClientV1();
        this.organizationsClient = new OrganizationsMemoryClientV1();
        this.objectsClient = new ControlObjectsMemoryClientV1();
        this.eventRulesClient = new EventRulesMemoryClientV1();
        this.zonesClient = new ZonesMemoryClientV1();
        this.eventsClient = new OperationalEventsNullClientV1();
        this.incidentsClient = new IncidentsNullClientV1();
        this.signalsClient = new SignalsNullClientV1();
        this.statisticsClient = new StatisticsNullClientV1();
        this.persistence = new EventGenerationMemoryPersistence();
    }
}