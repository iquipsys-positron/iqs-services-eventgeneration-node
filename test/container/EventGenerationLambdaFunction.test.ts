let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;

import { Descriptor } from 'pip-services3-commons-node';
import { ConfigParams } from 'pip-services3-commons-node';
import { References } from 'pip-services3-commons-node';
import { ConsoleLogger } from 'pip-services3-components-node';

import { IOrganizationsClientV1 } from 'pip-clients-organizations-node';
import { IEventRulesClientV1 } from 'iqs-clients-eventrules-node';
import { EventRuleTypeV1 } from 'iqs-clients-eventrules-node';

import { EventGenerationV1 } from '../../src/data/version1/EventGenerationV1';
import { EventGenerationStateV1 } from '../../src/data/version1/EventGenerationStateV1';
import { EventGenerationController } from '../../src/logic/EventGenerationController';
import { EventGenerationLambdaFunction } from '../../src/container/EventGenerationLambdaFunction';
import { TestDependencies } from '../logic/TestDependencies';

let STATE1: EventGenerationStateV1 = {
    org_id: '1',
    object_id: '1',
    time: new Date(new Date().getTime() - 10000),
    lat: 32,
    lng: -110,
    alt: 750,
    angle: 0,
    speed: 100,
    connected: true,
    online: 100,
    offline: 0,
    freezed: 0,
    immobile: 100,
    pressed: true
};

suite('EventGenerationLambdaFunction', ()=> {
    let organizationsClient: IOrganizationsClientV1;
    let eventRulesClient: IEventRulesClientV1;
    let lambda: EventGenerationLambdaFunction;

    suiteSetup((done) => {
        let config = ConfigParams.fromTuples(
            'logger.descriptor', 'pip-services:logger:console:default:1.0',
            'msgdistribution.descriptor', 'pip-services-msgdistribution:client:null:default:1.0',
            'organizations.descriptor', 'pip-services-organizations:client:memory:default:1.0',
            'control-objects.descriptor', 'iqs-services-controlobjects:client:memory:default:1.0',
            'event-rules.descriptor', 'iqs-services-eventrules:client:memory:default:1.0',
            'zones.descriptor', 'iqs-services-zones:client:memory:default:1.0',
            'operational-events.descriptor', 'iqs-services-opevents:client:null:default:1.0',
            'incidents.descriptor', 'iqs-services-incidents:client:null:default:1.0',
            'signals.descriptor', 'iqs-services-signals:client:null:default:1.0',
            'statistics.descriptor', 'pip-services-statistics:client:null:default:1.0',
            'controller.descriptor', 'iqs-services-eventgeneration:controller:default:default:1.0'
        );

        lambda = new EventGenerationLambdaFunction();
        lambda.configure(config);
        lambda.open(null, (err) => {
            if (err) {
                done(err);
                return;
            }

            organizationsClient = lambda.getReferences().getOneRequired<IOrganizationsClientV1>(new Descriptor('pip-services-organizations', 'client', '*', '*', '1.0'));
            organizationsClient.createOrganization(
                null, 
                { id: '1', name: 'Test organization', create_time: new Date(), creator_id: null, active: true },
                () => {}
            );
    
            eventRulesClient = lambda.getReferences().getOneRequired<IEventRulesClientV1>(new Descriptor('iqs-services-eventrules', 'client', '*', '*', '1.0'));
            eventRulesClient.createEventRule(
                null, 
                { id: '1', org_id: '1', name: 'Test Rule 1', type: EventRuleTypeV1.ShowUp, interval: 300, all_objects: true, all_zones: true }, 
                () => {}
            );
            eventRulesClient.createEventRule(
                null, 
                { id: '2', org_id: '1', name: 'Test Rule 2', type: EventRuleTypeV1.Disappear, interval: 300, all_objects: true, all_zones: true }, 
                () => {}
            );
            eventRulesClient.createEventRule(
                null, 
                { id: '3', org_id: '1', name: 'Test Rule 3', type: EventRuleTypeV1.ButtonPressed, interval: 300, all_objects: true, all_zones: true }, 
                () => {}
            );
    
            done(err);
        });
    });
    
    suiteTeardown((done) => {
        lambda.close(null, done);
    });
    
    test('Generate for single state', (done) => {
        lambda.act(
            {
                role: 'event_generation',
                cmd: 'generate_events_for_state',
                state: STATE1
            },
            (err, generations) => {
                assert.isNull(err);

                assert.isArray(generations);
                assert.lengthOf(generations, 2);

                done();
            }
        );
    });
    
});