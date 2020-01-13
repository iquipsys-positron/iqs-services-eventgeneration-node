"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_clients_msgdistribution_node_1 = require("pip-clients-msgdistribution-node");
const pip_clients_msgdistribution_node_2 = require("pip-clients-msgdistribution-node");
class MessageSender {
    setDependencies(dependencies) {
        this._dependencies = dependencies;
    }
    configure(config) {
        config = config.setDefaults(MessageSender._defaultConfig);
        let messageResolver = new pip_clients_msgdistribution_node_1.MessageResolverV1(config);
        this._message = messageResolver.resolve('event');
    }
    inflateActivation(correlationId, generation, callback) {
        async.parallel([
            // Read object
            (callback) => {
                if (this._dependencies.objectsClient) {
                    this._dependencies.objectsClient.getObjectById(correlationId, generation.object_id, (err, data) => {
                        generation.object = data;
                        callback(err);
                    });
                }
                else {
                    callback();
                }
            },
            // Read assigned object
            (callback) => {
                if (this._dependencies.objectsClient && generation.assign_id) {
                    this._dependencies.objectsClient.getObjectById(correlationId, generation.assign_id, (err, data) => {
                        generation.assign = data;
                        callback(err);
                    });
                }
                else {
                    callback();
                }
            },
            // Read zone
            (callback) => {
                if (this._dependencies.zonesClient && generation.zone_id) {
                    this._dependencies.zonesClient.getZoneById(correlationId, generation.zone_id, (err, data) => {
                        generation.zone = data;
                        callback(err);
                    });
                }
                else {
                    callback();
                }
            },
        ], callback);
    }
    sendMessages(correlationId, generations, organizationData, callback) {
        // Check if client is set
        if (this._dependencies.messageDistributionClient == null) {
            callback(null);
            return;
        }
        generations = _.filter(generations, a => a.rule.send_message && a.rule.recipient_ids && a.rule.recipient_ids.length > 0);
        // Skip there are if nothing to send
        if (generations.length == 0) {
            callback(null);
            return;
        }
        // Send out messages
        async.each(generations, (generation, callback) => {
            this.inflateActivation(correlationId, generation, (err) => {
                if (err) {
                    callback(err);
                    return;
                }
                // Prepare parameters
                let date = new Date(generation.time);
                let parameters = pip_services3_commons_node_1.ConfigParams.fromValue({
                    generation: generation,
                    organization_name: generation.organization ? generation.organization.name : null,
                    object_name: generation.object ? generation.object.name : null,
                    rule_id: generation.rule ? generation.rule.id : null,
                    rule_name: generation.rule ? generation.rule.name : null,
                    zone_name: generation.zone ? generation.zone.name : null,
                    time: date.toDateString() + ' ' + date.toTimeString()
                });
                // Send out message
                this._dependencies.messageDistributionClient.sendMessageToRecipients(correlationId, generation.rule.recipient_ids, generation.rule.id, this._message, parameters, pip_clients_msgdistribution_node_2.DeliveryMethodV1.All, callback);
            });
        }, callback);
    }
}
exports.MessageSender = MessageSender;
MessageSender._defaultConfig = pip_services3_commons_node_1.ConfigParams.fromTuples('message_templates.event.subject', '{{rule_name}}', 'message_templates.event.text', 'Generated event {{rule_name}} for {{object_name}} at {{organization_name}} at {{time}}');
//# sourceMappingURL=MessageSender.js.map