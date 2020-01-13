let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;

import { EventRuleTypeV1 } from 'iqs-clients-eventrules-node';
import { EventRuleV1 } from 'iqs-clients-eventrules-node';
import { EventRuleConditionParamV1 } from 'iqs-clients-eventrules-node';

import { EventGenerationStateV1 } from '../../src/data/version1/EventGenerationStateV1';
import { EventGenerationV1 } from '../../src/data/version1/EventGenerationV1';
import { RuleCalculator } from '../../src/logic/RuleCalculator';
import { OrganizationData } from '../../src/logic/OrganizationData';

suite('RuleCalculator', ()=> {    
    let calculator: RuleCalculator;

    setup(() => {
        calculator = new RuleCalculator();
    });
    
    test('Entry zone', () => {
        let state = <EventGenerationStateV1>{
            org_id: '1',
            object_id: '1',
            time: new Date(),
            online: 1,
            zones: [{ zone_id: '1', duration: 1, entered: true }]
        };

        let data = <OrganizationData>{
            org_id: '1',
            rules:[
                <EventRuleV1>{ 
                    type: EventRuleTypeV1.Entry,
                    include_zone_ids: ['1'],
                    all_objects: true
                }
            ]
        };

        let generations = calculator.calculateActivations(state, data);
        assert.lengthOf(generations, 1);
    });

    test('Exit zone', () => {
        let state = <EventGenerationStateV1>{
            org_id: '1',
            object_id: '1',
            online: 1,
            time: new Date(),
            zones: [{ zone_id: '1', duration: 1, exited: true }]
        };

        let data = <OrganizationData>{
            org_id: '1',
            rules:[
                <EventRuleV1>{ 
                    type: EventRuleTypeV1.Exit,
                    include_zone_ids: ['1'],
                    all_objects: true
                }
            ]
        };

        let generations = calculator.calculateActivations(state, data);
        assert.lengthOf(generations, 1);
        assert.equal(generations[0].zone_id, '1');
    });

    test('Button presses', () => {
        let state = <EventGenerationStateV1>{
            org_id: '1',
            object_id: '1',
            time: new Date(),
            online: 1,
            long_pressed: true,
            pressed: true
        };

        let data = <OrganizationData>{
            org_id: '1',
            rules:[
                <EventRuleV1>{ 
                    id: '1',
                    type: EventRuleTypeV1.ButtonPressed,
                    all_objects: true,
                    all_zones: true
                },
                <EventRuleV1>{ 
                    id: '2',
                    type: EventRuleTypeV1.ButtonLongPressed,
                    all_objects: true,
                    all_zones: true
                }
            ]
        };

        let generations = calculator.calculateActivations(state, data);
        assert.lengthOf(generations, 2);
    });

    test('Immobility', () => {
        let state = <EventGenerationStateV1>{
            org_id: '1',
            object_id: '1',
            time: new Date(),
            online: 1,
            immobile: 1000
        };

        let data = <OrganizationData>{
            org_id: '1',
            rules:[
                <EventRuleV1>{ 
                    type: EventRuleTypeV1.Immobility,
                    condition: { 'duration': 500 },
                    all_objects: true,
                    all_zones: true
                }
            ]
        };

        let generations = calculator.calculateActivations(state, data);
        assert.lengthOf(generations, 1);
    });

    test('Min speed', () => {
        let state = <EventGenerationStateV1>{
            org_id: '1',
            object_id: '1',
            time: new Date(),
            online: 1,
            speed: 5
        };

        let data = <OrganizationData>{
            org_id: '1',
            rules:[
                <EventRuleV1>{ 
                    type: EventRuleTypeV1.MinSpeed,
                    condition: { 'min value': 10 },
                    all_objects: true,
                    all_zones: true
                }
            ]
        };

        let generations = calculator.calculateActivations(state, data);
        assert.lengthOf(generations, 1);
    });

    test('Max speed', () => {
        let state = <EventGenerationStateV1>{
            org_id: '1',
            object_id: '1',
            time: new Date(),
            online: 1,
            speed: 60
        };

        let data = <OrganizationData>{
            org_id: '1',
            rules:[
                <EventRuleV1>{ 
                    type: EventRuleTypeV1.MaxSpeed,
                    condition: { 'max value': 50 },
                    all_objects: true,
                    all_zones: true
                }
            ]
        };

        let generations = calculator.calculateActivations(state, data);
        assert.lengthOf(generations, 1);
    });

    test('Presence in zone', () => {
        let state = <EventGenerationStateV1>{
            org_id: '1',
            object_id: '1',
            time: new Date(),
            online: 1,
            zones: [{ zone_id: '1', duration: 500 }]
        };

        let data = <OrganizationData>{
            org_id: '1',
            rules:[
                <EventRuleV1>{ 
                    type: EventRuleTypeV1.Presence,
                    include_zone_ids: ['1'],
                    condition: { 'duration': 300 },
                    all_objects: true
                }
            ]
        };

        let generations = calculator.calculateActivations(state, data);
        assert.lengthOf(generations, 1);
    });

    test('Show up', () => {
        let state = <EventGenerationStateV1>{
            org_id: '1',
            object_id: '1',
            time: new Date(),
            connected: true,
            online: 1
        };

        let data = <OrganizationData>{
            org_id: '1',
            rules:[
                <EventRuleV1>{ 
                    type: EventRuleTypeV1.ShowUp,
                    all_objects: true,
                    all_zones: true
                }
            ]
        };

        let generations = calculator.calculateActivations(state, data);
        assert.lengthOf(generations, 1);
    });

    test('Disappear', () => {
        let state = <EventGenerationStateV1>{
            org_id: '1',
            object_id: '1',
            time: new Date(),
            offline: 1000
        };

        let data = <OrganizationData>{
            org_id: '1',
            rules:[
                <EventRuleV1>{ 
                    type: EventRuleTypeV1.Disappear,
                    all_objects: true,
                    all_zones: true
                }
            ]
        };

        let generations = calculator.calculateActivations(state, data);
        assert.lengthOf(generations, 1);
    });
    
});