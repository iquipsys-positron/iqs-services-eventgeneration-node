let _ = require('lodash');
let async = require('async');

import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IdGenerator } from 'pip-services3-commons-node';

import { EventRuleV1 } from 'iqs-clients-eventrules-node';
import { EventRuleTypeV1 } from 'iqs-clients-eventrules-node';
import { EventRuleConditionParamV1 } from 'iqs-clients-eventrules-node';

import { SignalV1 } from 'iqs-clients-signals-node';

import { OrganizationData } from './OrganizationData';
import { EventGenerationV1 } from '../data/version1/EventGenerationV1';
import { ExternalDependencies } from './ExternalDependencies';

export class SignalSender implements IConfigurable {
    private _dependencies: ExternalDependencies;

    public setDependencies(dependencies: ExternalDependencies) {
        this._dependencies = dependencies;
    }

    public configure(config: ConfigParams): void {
    }

    public generateSignals(generations: EventGenerationV1[], organizationData: OrganizationData): SignalV1[] {
        let signals: SignalV1[] = [];

        for (let generation of generations) {
            if (generation.rule.send_signal && generation.device_id) {
                let signal: SignalV1 = {
                    id: null,
                    org_id: generation.org_id,
                    device_id: generation.device_id,
                    time: new Date(),
                    type: generation.rule.signal,
                    sent: false
                };

                signals.push(signal);
            }
        }

        return signals;
    }

    public sendSignals(correlationId: string, generations: EventGenerationV1[],
        organizationData: OrganizationData, callback: (err: any) => void): void {

        let signals = this.generateSignals(generations, organizationData);

        async.each(signals, (s, callback) => {
            this._dependencies.signalsClient.sendSignal(correlationId, s, callback);
        }, callback);
    }

}