let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;

import { EventRuleTypeV1 } from 'iqs-clients-eventrules-node';
import { EventRuleV1 } from 'iqs-clients-eventrules-node';
import { EventRuleConditionParamV1 } from 'iqs-clients-eventrules-node';

import { EventGenerationV1 } from '../../src/data/version1/EventGenerationV1';
import { SignalSender } from '../../src/logic/SignalSender';
import { OrganizationData } from '../../src/logic/OrganizationData';

suite('SignalSender', ()=> {    
    let sender: SignalSender;

    setup(() => {
        sender = new SignalSender();
    });
    
    test('Generate signals', () => {
        let rule: EventRuleV1 = { 
            id: '1',
            org_id: '1',
            name: 'Test Rule',
            type: EventRuleTypeV1.Entry,
            include_zone_ids: ['1'],
            incident: true,
            send_signal: true,
            signal: 4
        };

        let generation: EventGenerationV1 = {
            org_id: '1',
            device_id: '1',
            object_id: '1',
            time: new Date(),
            rule_id: rule.id,
            rule_type: rule.type,
            rule: rule,
            online: 1,
            offline: 0,
            freezed: 0,
            immobile: 0
        };

        let data = <OrganizationData>{
            org_id: '1',
            rules:[ rule ]
        };

        let signals = sender.generateSignals([generation], data);
        assert.lengthOf(signals, 1);
    });

});