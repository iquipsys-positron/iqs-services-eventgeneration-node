let _ = require('lodash');
let async = require('async');

import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';

import { EventRuleV1 } from 'iqs-clients-eventrules-node';
import { EventRuleTypeV1 } from 'iqs-clients-eventrules-node';
import { EventRuleConditionParamV1 } from 'iqs-clients-eventrules-node';

import { MessageV1 } from 'pip-clients-msgdistribution-node';
import { MessageResolverV1 } from 'pip-clients-msgdistribution-node';
import { DeliveryMethodV1 } from 'pip-clients-msgdistribution-node';
import { ZoneV1 } from 'iqs-clients-zones-node';

import { OrganizationData } from './OrganizationData';
import { EventGenerationV1 } from '../data/version1/EventGenerationV1';
import { ExternalDependencies } from './ExternalDependencies';

export class MessageSender implements IConfigurable {
    private static _defaultConfig = ConfigParams.fromTuples(
        'message_templates.event.subject', '{{rule_name}}',
        'message_templates.event.text', 'Generated event {{rule_name}} for {{object_name}} at {{organization_name}} at {{time}}',
    );
    private _dependencies: ExternalDependencies;
    private _message: MessageV1;

    public setDependencies(dependencies: ExternalDependencies) {
        this._dependencies = dependencies;
    }

    public configure(config: ConfigParams): void {
        config = config.setDefaults(MessageSender._defaultConfig);

        let messageResolver = new MessageResolverV1(config);
        this._message = messageResolver.resolve('event');
    }

    private inflateActivation(correlationId: string, generation: EventGenerationV1,
        callback: (err: any) => void): void {
        
        async.parallel([
            // Read object
            (callback) => {
                if (this._dependencies.objectsClient) {
                    this._dependencies.objectsClient.getObjectById(correlationId, generation.object_id, (err, data) => {
                        generation.object = data;
                        callback(err);
                    });
                } else {
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
                } else {
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
                } else {
                    callback();
                }
            },
        ], callback);
    }

    public sendMessages(correlationId: string, generations: EventGenerationV1[], organizationData: OrganizationData,
        callback: (err: any) => void): void {

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
                let parameters = ConfigParams.fromValue({
                    generation: generation,
                    organization_name: generation.organization ? generation.organization.name : null,
                    object_name: generation.object ? generation.object.name : null,
                    rule_id: generation.rule ? generation.rule.id : null,
                    rule_name: generation.rule ? generation.rule.name : null,
                    zone_name: generation.zone ? generation.zone.name : null,
                    time: date.toDateString() + ' ' + date.toTimeString()
                });
                
                // Send out message
                this._dependencies.messageDistributionClient.sendMessageToRecipients(
                    correlationId, generation.rule.recipient_ids, generation.rule.id,
                    this._message, parameters, DeliveryMethodV1.All,
                    callback
                );
            });
        }, callback);
    }

}