let _ = require('lodash');

import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { IdentifiableMemoryPersistence } from 'pip-services3-data-node';

import { LastEventGenerationV1 } from '../data/version1/LastEventGenerationV1';
import { IEventGenerationPersistence } from './IEventGenerationPersistence';

export class EventGenerationMemoryPersistence 
    extends IdentifiableMemoryPersistence<LastEventGenerationV1, string> 
    implements IEventGenerationPersistence {

    constructor() {
        super();
    }

    public getExisting(correlationId: string, orgId: string, ruleId: string, objectId: string, 
        callback: (err: any, item: LastEventGenerationV1) => void): void {

            let oldItem = _.find(this._items, p => p.org_id == orgId && p.rule_id == ruleId && p.object_id == objectId);
            
            if (oldItem) {
                this._logger.trace(correlationId, "Found exiting event generation for %s and %s", ruleId, objectId);
            }

            callback(null, oldItem);
    }

    public createOrUpdate(correlationId: string, item: LastEventGenerationV1, 
        callback: (err: any, item: LastEventGenerationV1) => void): void {
        let oldItem = _.find(this._items, p => p.org_id == item.org_id && p.rule_id == item.rule_id && p.object_id == item.object_id);
            
        if (oldItem) {
            oldItem.time = item.time;
        } else {
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
