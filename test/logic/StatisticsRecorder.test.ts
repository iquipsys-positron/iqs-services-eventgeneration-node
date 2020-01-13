let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;

import { OrganizationV1 } from 'pip-clients-organizations-node';
import { EventRuleV1 } from 'iqs-clients-eventrules-node';

import { EventGenerationV1 } from '../../src/data/version1/EventGenerationV1';
import { StatisticsRecorder } from '../../src/logic/StatisticsRecorder';
import { OrganizationData } from '../../src/logic/OrganizationData';

suite('StatisticsRecorder', ()=> {    
    let recorder: StatisticsRecorder;

    setup(() => {
        recorder = new StatisticsRecorder();
    });
    
    test('Empty statistics', () => {
        let organization = <OrganizationV1>{
            id: '1',
            name: 'Test Organization 1',
            timezone: 'UTC'
        };

        let generation = <EventGenerationV1>{
            org_id: '1',
            device_id: '1',
            object_id: '1',
            time: new Date(),
            online: 100,
            immobile: 100,
            speed: 50,
            rule_id: '1'
        };

        let increments = recorder.generateIncrements(organization, [generation]);
        assert.lengthOf(increments, 4);
    });

    test('Event statistics', () => {
        let organization = <OrganizationV1>{
            id: '1',
            name: 'Test Organization 1',
            timezone: 'UTC'
        };

        let generation = <EventGenerationV1>{
            org_id: '1',
            device_id: '1',
            object_id: '1',
            group_ids: ['2'],
            time: new Date(100),
            online: 200,
            immobile: 150,
            speed: 50,
            zones: [{ zone_id: '3', duration: 1 }],
            rule_id: '1'
        };

        let increments = recorder.generateEventIncrements(organization, generation);
        assert.lengthOf(increments, 12);

        let increment = _.find(increments, i => i.name == 'events.all.all.1');
        assert.equal(increment.value, 1);

        increment = _.find(increments, i => i.name == 'events.1.all.1');
        assert.equal(increment.value, 1);

        increment = _.find(increments, i => i.name == 'events.2.all.1');
        assert.equal(increment.value, 1);

        increment = _.find(increments, i => i.name == 'events.all.all.all');
        assert.equal(increment.value, 1);

        increment = _.find(increments, i => i.name == 'events.all.3.1');
        assert.equal(increment.value, 1);

        increment = _.find(increments, i => i.name == 'events.1.3.1');
        assert.equal(increment.value, 1);

        increment = _.find(increments, i => i.name == 'events.2.3.1');
        assert.equal(increment.value, 1);

        increment = _.find(increments, i => i.name == 'events.all.3.all');
        assert.equal(increment.value, 1);
    });

});