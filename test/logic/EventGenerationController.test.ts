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

import { TestDependencies } from './TestDependencies';
import { EventGenerationV1 } from '../../src/data/version1/EventGenerationV1';
import { EventGenerationStateV1 } from '../../src/data/version1/EventGenerationStateV1';
import { EventGenerationController } from '../../src/logic/EventGenerationController';

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
let STATE2: EventGenerationStateV1 = {
    org_id: '1',
    object_id: '2',
    time: new Date(new Date().getTime() - 10000),
    lat: 33,
    lng: -111,
    alt: 750,
    angle: 0,
    speed: 1,
    online: 0,
    offline: 1000,
    freezed: 0,
    immobile: 0
};

suite('EventGenerationController', ()=> {    
    let dependencies = new TestDependencies();
    let controller: EventGenerationController;

    suiteSetup(() => {
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

        controller = new EventGenerationController();
        controller.configure(new ConfigParams());

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
            new Descriptor('iqs-services-eventgeneration', 'controller', 'default', 'default', '1.0'), controller
        );
        controller.setReferences(references);
    });

    setup((done) => {
        (<any>dependencies.persistence).clear(null, done);
    });
    
    test('Generate for single state', (done) => {
        controller.generateEventsForState(
            null, STATE1,
            (err, generations) => {
                assert.isNull(err);

                assert.isArray(generations);
                assert.lengthOf(generations, 2);

                done();
            }
        );
    });

    test('Generate for multiple states', (done) => {
        controller.generateEventsForStates(
            null, [ STATE1, STATE2 ],
            (err, generations) => {
                assert.isNull(err);

                assert.isArray(generations);
                assert.lengthOf(generations, 3);

                done();
            }
        );
    });

    test('Avoid sending duplicates', (done) => {
        async.series([
            // Activate rules once
            (callback) => {
                controller.generateEventsForState(
                    null, STATE1,
                    (err, generations) => {
                        assert.isNull(err);
        
                        assert.isArray(generations);
                        assert.lengthOf(generations, 2);
        
                        callback();
                    }
                );
            },
            // Activate rules once again
            (callback) => {
                controller.generateEventsForState(
                    null, STATE1,
                    (err, generations) => {
                        assert.isNull(err);
        
                        assert.isArray(generations);
                        assert.lengthOf(generations, 0);
        
                        callback();
                    }
                );
            }
        ], done);
    });
    
});