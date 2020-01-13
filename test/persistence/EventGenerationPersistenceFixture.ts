let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;

import { LastEventGenerationV1 } from '../../src/data/version1/LastEventGenerationV1';

import { IEventGenerationPersistence } from '../../src/persistence/IEventGenerationPersistence';

let time1 = new Date(2017, 1, 1);
let time2 = new Date(2017, 2, 1);

export class EventGenerationPersistenceFixture {
    private _persistence: IEventGenerationPersistence;
    
    constructor(persistence) {
        assert.isNotNull(persistence);
        this._persistence = persistence;
    }

    public testGetAndUpdateEventGeneration(done) {
        async.series([
            (callback) => {
                // Get nothing
                this._persistence.getExisting(
                    null,
                    '1', '2', '3',
                    (err, data) => {
                        assert.isNull(err);

                        assert.isNull(data || null);

                        callback();
                    }
                );
            },
            (callback) => {
                // Create generation
                this._persistence.createOrUpdate(
                    null,
                    { id: '1', org_id: '1', rule_id: '2', object_id: '3', time: time1 },
                    (err, data) => {
                        assert.isNull(err);

                        assert.equal(data.org_id, '1');
                        assert.equal(data.rule_id, '2');
                        assert.equal(data.object_id, '3');
                        assert.equal(data.time.getTime(), time1.getTime());

                        callback();
                    }
                )
            },
            (callback) => {
                // Get create
                this._persistence.getExisting(
                    null,
                    '1', '2', '3',
                    (err, data) => {
                        assert.isNull(err);

                        assert.equal(data.org_id, '1');
                        assert.equal(data.rule_id, '2');
                        assert.equal(data.object_id, '3');
                        assert.equal(data.time.getTime(), time1.getTime());

                        callback();
                    }
                );
            },
            (callback) => {
                // Update generation
                this._persistence.createOrUpdate(
                    null,
                    { id: '1', org_id: '1', rule_id: '2', object_id: '3', time: time2 },
                    (err, data) => {
                        assert.isNull(err);

                        assert.equal(data.org_id, '1');
                        assert.equal(data.rule_id, '2');
                        assert.equal(data.object_id, '3');
                        assert.equal(data.time.getTime(), time2.getTime());

                        callback();
                    }
                )
            }
        ], done);
    }

}
