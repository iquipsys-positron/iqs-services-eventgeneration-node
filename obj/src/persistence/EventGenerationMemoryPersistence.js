"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
const pip_services3_data_node_1 = require("pip-services3-data-node");
class EventGenerationMemoryPersistence extends pip_services3_data_node_1.IdentifiableMemoryPersistence {
    constructor() {
        super();
    }
    getExisting(correlationId, orgId, ruleId, objectId, callback) {
        let oldItem = _.find(this._items, p => p.org_id == orgId && p.rule_id == ruleId && p.object_id == objectId);
        if (oldItem) {
            this._logger.trace(correlationId, "Found exiting event generation for %s and %s", ruleId, objectId);
        }
        callback(null, oldItem);
    }
    createOrUpdate(correlationId, item, callback) {
        let oldItem = _.find(this._items, p => p.org_id == item.org_id && p.rule_id == item.rule_id && p.object_id == item.object_id);
        if (oldItem) {
            oldItem.time = item.time;
        }
        else {
            oldItem = item;
            this._items.push(item);
        }
        this.save(correlationId, (err) => {
            if (err == null)
                this._logger.trace(correlationId, "Updated event generation for %s and %s", item.rule_id, item.object_id);
            callback(err, err == null ? oldItem : null);
        });
    }
}
exports.EventGenerationMemoryPersistence = EventGenerationMemoryPersistence;
//# sourceMappingURL=EventGenerationMemoryPersistence.js.map