let _ = require('lodash');
let async = require('async');
let restify = require('restify');
let assert = require('chai').assert;

import { ConfigParams } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';
import { References } from 'pip-services3-commons-node';

import { OrganizationV1 } from 'pip-clients-organizations-node';
import { EventRuleV1 } from 'iqs-clients-eventrules-node';
import { EventRuleTypeV1 } from 'iqs-clients-eventrules-node';

import { EventGenerationStateV1 } from '../../../src/data/version1/EventGenerationStateV1';
import { EventGenerationController } from '../../../src/logic/EventGenerationController';
import { EventGenerationHttpServiceV1 } from '../../../src/services/version1/EventGenerationHttpServiceV1';
import { TestDependencies } from '../../logic/TestDependencies';

let httpConfig = ConfigParams.fromTuples(
    "connection.protocol", "http",
    "connection.host", "localhost",
    "connection.port", 3000
);

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

suite('EventGenerationHttpServiceV1', ()=> {    
    let dependencies = new TestDependencies();
    let service: EventGenerationHttpServiceV1;
    let rest: any;

    suiteSetup((done) => {
        let controller = new EventGenerationController();

        dependencies.organizationsClient.createOrganization(
            null, 
            { id: '1', name: 'Test organization', create_time: new Date(), creator_id: null, active: true },
            () => {}
        );

        dependencies.eventRulesClient.createEventRule(
            null, 
            { id: '1', org_id: '1', name: 'Test Rule 1', type: EventRuleTypeV1.ShowUp, interval: 300, all_objects: true, all_zones: true }, 
            () => {}
        );
        dependencies.eventRulesClient.createEventRule(
            null, 
            { id: '2', org_id: '1', name: 'Test Rule 2', type: EventRuleTypeV1.Disappear, interval: 300, all_objects: true, all_zones: true }, 
            () => {}
        );
        dependencies.eventRulesClient.createEventRule(
            null, 
            { id: '3', org_id: '1', name: 'Test Rule 3', type: EventRuleTypeV1.ButtonPressed, interval: 300, all_objects: true, all_zones: true }, 
            () => {}
        );

        service = new EventGenerationHttpServiceV1();
        service.configure(httpConfig);

        let references: References = References.fromTuples(
            new Descriptor('pip-services-msgdistribution', 'client', 'null', 'default', '1.0'), dependencies.messageDistributionClient,
            new Descriptor('pip-services-organizations', 'client', 'memory', 'default', '1.0'), dependencies.organizationsClient,
            new Descriptor('iqs-services-controlobjects', 'client', 'memory', 'default', '1.0'), dependencies.objectsClient,
            new Descriptor('iqs-services-eventrules', 'client', 'memory', 'default', '1.0'), dependencies.eventRulesClient,
            new Descriptor('iqs-services-zones', 'client', 'memory', 'default', '1.0'), dependencies.zonesClient,
            new Descriptor('iqs-services-opevents', 'client', 'null', 'default', '1.0'), dependencies.eventsClient,
            new Descriptor('iqs-services-incidents', 'client', 'null', 'default', '1.0'), dependencies.incidentsClient,
            new Descriptor('iqs-services-signals', 'client', 'memory', 'default', '1.0'), dependencies.signalsClient,
            new Descriptor('pip-services-statistics', 'client', 'null', 'default', '1.0'), dependencies.statisticsClient,
            new Descriptor('iqs-services-eventgeneration', 'persistence', 'memory', 'default', '1.0'), dependencies.persistence,
            new Descriptor('iqs-services-eventgeneration', 'controller', 'default', 'default', '1.0'), controller,
            new Descriptor('iqs-services-eventgeneration', 'service', 'http', 'default', '1.0'), service
        );
        controller.setReferences(references);
        service.setReferences(references);

        service.open(null, done);
    });
    
    suiteTeardown((done) => {
        service.close(null, done);
    });

    setup((done) => {
        let url = 'http://localhost:3000';
        rest = restify.createJsonClient({ url: url, version: '*' });

        (<any>dependencies.persistence).clear(null, done);
    });
        
    test('Generate for single state', (done) => {
        rest.post('/v1/event_generation/generate_events_for_state',
            {
                state: STATE1
            },
            (err, req, res, generations) => {
                assert.isNull(err);

                assert.isArray(generations);
                assert.lengthOf(generations, 2);

                done();
            }
        );
    });
    
    test('Generate for multiple state', (done) => {
        rest.post('/v1/event_generation/generate_events_for_states',
            {
                states: [STATE1]
            },
            (err, req, res, generations) => {
                assert.isNull(err);

                assert.isArray(generations);
                assert.lengthOf(generations, 2);

                done();
            }
        );
    });

});