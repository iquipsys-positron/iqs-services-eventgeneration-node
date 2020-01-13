let _ = require('lodash');

import { IdentifiableMongoDbPersistence } from 'pip-services3-mongodb-node';

import { LastEventGenerationV1 } from '../data/version1/LastEventGenerationV1';
import { IEventGenerationPersistence } from './IEventGenerationPersistence';

export class EventGenerationMongoDbPersistence
    extends IdentifiableMongoDbPersistence<LastEventGenerationV1, string>
    implements IEventGenerationPersistence {

    constructor() {
        super('event_generations');
        super.ensureIndex({ org_id: 1, rule_id: 1, object_id: 1 });
    }

    public getExisting(correlationId: string, orgId: string, ruleId: string, objectId: string, 
        callback: (err: any, item: LastEventGenerationV1) => void): void {

        let condition = {
            org_id: orgId,
            rule_id: ruleId,
            object_id: objectId
        };
    
        this._collection.findOne(
            condition,
            (err, oldItem) => {
                oldItem = this.convertToPublic(oldItem);

                if (oldItem) {
                    this._logger.trace(correlationId, "Found exiting event generation for %s and %s", ruleId, objectId);
                }

                callback(err, oldItem);
            }
        )
    }

    public createOrUpdate(correlationId: string, item: LastEventGenerationV1, 
        callback: (err: any, item: LastEventGenerationV1) => void): void {

        let condition = {
            org_id: item.org_id,
            rule_id: item.rule_id,
            object_id: item.object_id
        };

        let newData = {
            $set: {
                time: item.time
            },
            $setOnInsert: {
                id: item.id,
                org_id: item.org_id,
                rule_id: item.rule_id,
                object_id: item.object_id
            }
        };

        let options = { 
            returnOriginal: false,
            upsert: true 
        };

        this._collection.findOneAndUpdate(
            condition, newData, options, (err, result) => {
                let newItem = result ? this.convertToPublic(result.value) : null;

                if (newItem) {
                    newItem = this.convertToPublic(newItem);

                    this._logger.trace(correlationId, "Updated event generation for %s and %s", item.rule_id, item.object_id);
                }

                callback(err, newItem);
            }
        );
    }
    
}
