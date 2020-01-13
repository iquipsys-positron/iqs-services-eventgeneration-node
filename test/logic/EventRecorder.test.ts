let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;

import { EventRuleTypeV1 } from 'iqs-clients-eventrules-node';
import { EventRuleV1 } from 'iqs-clients-eventrules-node';
import { EventRuleConditionParamV1 } from 'iqs-clients-eventrules-node';
import { ZoneV1 } from 'iqs-clients-zones-node';

import { EventGenerationV1 } from '../../src/data/version1/EventGenerationV1';
import { EventRecorder } from '../../src/logic/EventRecorder';
import { OrganizationData } from '../../src/logic/OrganizationData';

suite('EventRecorder', ()=> {    
    let recorder: EventRecorder;

    setup(() => {
        recorder = new EventRecorder();
    });
    
    test('Generate Events and Incidents', () => {
        let rule: EventRuleV1 = { 
            org_id: '1',
            id: '1',
            name: 'Test Rule',
            type: EventRuleTypeV1.Entry,
            include_zone_ids: ['1'],
            incident: true
        };

        let generation: EventGenerationV1 = {
            org_id: '1',
            device_id: '1',
            object_id: '1',
            time: new Date(),
            zones: [{ zone_id: '1', duration: 1, entered: true }],
            rule_id: rule.id,
            rule_type: rule.type,
            rule: rule,
            zone_id: '1',
            online: 1,
            offline: 0,
            freezed: 0,
            immobile: 0
        };

        let data = <OrganizationData>{
            org_id: '1',
            rules:[ rule ]
        };

        let events = recorder.generateEvents([generation], data);
        assert.lengthOf(events, 1);

        let event = events[0];
        assert.equal(event.zone_id, '1');

        let incidents = recorder.generateIncidents(events, data);
        assert.lengthOf(incidents, 1);

        let incident = incidents[0];
        assert.equal(incident.zone_id, '1');
    });

});