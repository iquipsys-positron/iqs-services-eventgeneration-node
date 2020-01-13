let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;

import { ControlObjectV1 } from 'iqs-clients-controlobjects-node';
import { EventRuleTypeV1 } from 'iqs-clients-eventrules-node';
import { EventRuleV1 } from 'iqs-clients-eventrules-node';
import { EventRuleConditionParamV1 } from 'iqs-clients-eventrules-node';
import { ZoneV1 } from 'iqs-clients-zones-node';

import { EventGenerationV1 } from '../../src/data/version1/EventGenerationV1';
import { MessageSender } from '../../src/logic/MessageSender';
import { OrganizationData } from '../../src/logic/OrganizationData';
import { TestDependencies } from './TestDependencies';

suite('MessageSender', ()=> {    
    let sender: MessageSender;

    setup(() => {
        sender = new MessageSender();
        sender.setDependencies(new TestDependencies());
    });
    
    test('Send nothing', (done) => {
        let rule: EventRuleV1 = { 
            id: '1',
            org_id: '1',
            name: 'test',
            type: EventRuleTypeV1.Entry,
            include_zone_ids: ['1'],
            incident: true,
            send_message: false
        };

        let generation: EventGenerationV1 = {
            org_id: '1',
            device_id: '1',
            object_id: '1',
            time: new Date(),
            zones: [{ zone_id: '1', duration: 1 }],
            rule: rule,
            rule_id: rule.id,
            rule_type: rule.type,
            online: 1,
            offline: 0,
            freezed: 0,
            immobile: 0
        };

        let data = <OrganizationData>{
            org_id: '1',
            rules:[ rule ]
        };

        sender.sendMessages(null, [generation], data, done);
    });

    test('Send messages', (done) => {
        let rule: EventRuleV1 = { 
            id: '1',
            org_id: '1',
            name: 'test',
            type: EventRuleTypeV1.Entry,
            include_zone_ids: ['1'],
            incident: true,
            send_message: true,
            recipient_ids: ['1', '2', '3']
        };

        let generation: EventGenerationV1 = {
            org_id: '1',
            device_id: '1',
            object_id: '1',
            time: new Date(),
            zones: [{ zone_id: '1', duration: 1 }],
            rule: rule,
            rule_id: rule.id,
            rule_type: rule.type,
            online: 1,
            offline: 0,
            freezed: 0,
            immobile: 0
        };

        let data = <OrganizationData>{
            org_id: '1',
            rules:[ rule ]
        };

        sender.sendMessages(null, [generation], data, done);
    });
    
});