"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
const pip_services3_mongodb_node_1 = require("pip-services3-mongodb-node");
class EventGenerationMongoDbPersistence extends pip_services3_mongodb_node_1.IdentifiableMongoDbPersistence {
    constructor() {
        super('event_generations');
        super.ensureIndex({ org_id: 1, rule_id: 1, object_id: 1 });
    }
    getExisting(correlationId, orgId, ruleId, objectId, callback) {
        let condition = {
            org_id: orgId,
            rule_id: ruleId,
            object_id: objectId
        };
        this._collection.findOne(condition, (err, oldItem) => {
            oldItem = this.convertToPublic(oldItem);
            if (oldItem) {
                this._logger.trace(correlationId, "Found exiting event generation for %s and %s", ruleId, objectId);
            }
            callback(err, oldItem);
        });
    }
    createOrUpdate(correlationId, item, callback) {
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
        this._collection.findOneAndUpdate(condition, newData, options, (err, result) => {
            let newItem = result ? this.convertToPublic(result.value) : null;
            if (newItem) {
                newItem = this.convertToPublic(newItem);
                this._logger.trace(correlationId, "Updated event generation for %s and %s", item.rule_id, item.object_id);
            }
            callback(err, newItem);
        });
    }
}
exports.EventGenerationMongoDbPersistence = EventGenerationMongoDbPersistence;
//# sourceMappingURL=EventGenerationMongoDbPersistence.js.map