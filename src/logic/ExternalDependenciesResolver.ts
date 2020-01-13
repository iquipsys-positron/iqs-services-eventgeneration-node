import { DependencyResolver } from 'pip-services3-commons-node';
import { ConfigParams } from 'pip-services3-commons-node';

import { IMessageDistributionClientV1 } from 'pip-clients-msgdistribution-node';
import { IOrganizationsClientV1 } from 'pip-clients-organizations-node';
import { IControlObjectsClientV1 } from 'iqs-clients-controlobjects-node';
import { IEventRulesClientV1 } from 'iqs-clients-eventrules-node';
import { IZonesClientV1 } from 'iqs-clients-zones-node';
import { IOperationalEventsClientV1 } from 'iqs-clients-opevents-node';
import { IIncidentsClientV1 } from 'iqs-clients-incidents-node';
import { ISignalsClientV1 } from 'iqs-clients-signals-node';
import { IStatisticsClientV1 } from 'pip-clients-statistics-node';

import { ExternalDependencies } from './ExternalDependencies';
import { IEventGenerationPersistence } from '../persistence/IEventGenerationPersistence';

export class ExternalDependenciesResolver extends DependencyResolver {
    private static _defaultConfig: ConfigParams = ConfigParams.fromTuples(
        'dependencies.msgdistribution', 'pip-services-msgdistribution:client:*:*:1.0',
        'dependencies.organizations', 'pip-services-organizations:client:*:*:1.0',
        'dependencies.control-objects', 'iqs-services-controlobjects:client:*:*:1.0',
        'dependencies.zones', 'iqs-services-zones:client:*:*:1.0',
        'dependencies.event-rules', 'iqs-services-eventrules:client:*:*:1.0',
        'dependencies.operational-events', 'iqs-services-opevents:client:*:*:1.0',
        'dependencies.incidents', 'iqs-services-incidents:client:*:*:1.0',
        'dependencies.signals', 'iqs-services-signals:client:*:*:1.0',
        'dependencies.statistics', 'pip-services-statistics:client:*:*:1.0',
        'dependencies.persistence', 'iqs-services-eventgeneration:persistence:*:*:1.0'
    );

    public constructor() {
        super(ExternalDependenciesResolver._defaultConfig);
    }

    public resolve(): ExternalDependencies {
        let dependencies = new ExternalDependencies();

        dependencies.messageDistributionClient = this.getOneRequired<IMessageDistributionClientV1>('msgdistribution');
        dependencies.organizationsClient = this.getOneRequired<IOrganizationsClientV1>('organizations');
        dependencies.objectsClient = this.getOneRequired<IControlObjectsClientV1>('control-objects');
        dependencies.zonesClient = this.getOneRequired<IZonesClientV1>('zones');
        dependencies.eventRulesClient = this.getOneRequired<IEventRulesClientV1>('event-rules');
        dependencies.eventsClient = this.getOneRequired<IOperationalEventsClientV1>('operational-events');
        dependencies.incidentsClient = this.getOneRequired<IIncidentsClientV1>('incidents');
        dependencies.signalsClient = this.getOneRequired<ISignalsClientV1>('signals');
        dependencies.statisticsClient = this.getOneRequired<IStatisticsClientV1>('statistics');
        dependencies.persistence = this.getOneRequired<IEventGenerationPersistence>('persistence');
        
        return dependencies;
    }
}