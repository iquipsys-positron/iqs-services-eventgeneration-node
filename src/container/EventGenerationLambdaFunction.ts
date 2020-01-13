import { Descriptor } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { CommandableLambdaFunction } from 'pip-services3-aws-node';

import { MessageDistributionClientFactory } from 'pip-clients-msgdistribution-node';
import { OrganizationsClientFactory } from 'pip-clients-organizations-node';
import { ControlObjectsClientFactory } from 'iqs-clients-controlobjects-node';
import { EventRulesClientFactory } from 'iqs-clients-eventrules-node';
import { ZonesClientFactory } from 'iqs-clients-zones-node';
import { OperationalEventsClientFactory } from 'iqs-clients-opevents-node';
import { IncidentsClientFactory } from 'iqs-clients-incidents-node';
import { SignalsClientFactory } from 'iqs-clients-signals-node';
import { StatisticsClientFactory } from 'pip-clients-statistics-node';

import { EventGenerationServiceFactory } from '../build/EventGenerationServiceFactory';

export class EventGenerationLambdaFunction extends CommandableLambdaFunction {
    public constructor() {
        super("event_generation", "Event generation function");
        this._dependencyResolver.put('controller', new Descriptor('iqs-services-eventgeneration', 'controller', 'default', '*', '*'));

        this._factories.add(new EventGenerationServiceFactory());
        this._factories.add(new MessageDistributionClientFactory());
        this._factories.add(new OrganizationsClientFactory());
        this._factories.add(new ControlObjectsClientFactory());
        this._factories.add(new EventRulesClientFactory());
        this._factories.add(new ZonesClientFactory());
        this._factories.add(new OperationalEventsClientFactory());
        this._factories.add(new IncidentsClientFactory());
        this._factories.add(new SignalsClientFactory());
        this._factories.add(new StatisticsClientFactory());
    }

    public getReferences(): IReferences {
        return this._references;
    }
}

export const handler = new EventGenerationLambdaFunction().getHandler();