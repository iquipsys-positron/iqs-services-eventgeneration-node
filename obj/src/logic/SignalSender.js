"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
class SignalSender {
    setDependencies(dependencies) {
        this._dependencies = dependencies;
    }
    configure(config) {
    }
    generateSignals(generations, organizationData) {
        let signals = [];
        for (let generation of generations) {
            if (generation.rule.send_signal && generation.device_id) {
                let signal = {
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
    sendSignals(correlationId, generations, organizationData, callback) {
        let signals = this.generateSignals(generations, organizationData);
        async.each(signals, (s, callback) => {
            this._dependencies.signalsClient.sendSignal(correlationId, s, callback);
        }, callback);
    }
}
exports.SignalSender = SignalSender;
//# sourceMappingURL=SignalSender.js.map