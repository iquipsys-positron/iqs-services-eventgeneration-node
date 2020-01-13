"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
class StatisticsRecorder {
    constructor() {
        this._dumpCacheInterval = 5;
        this._cache = [];
        this._maxCacheSize = 100;
    }
    setDependencies(dependencies) {
        this._dependencies = dependencies;
    }
    configure(config) {
        this._dumpCacheInterval = config.getAsIntegerWithDefault('options.dump_cache_interval', this._dumpCacheInterval);
    }
    generateEventIncrements(organization, generation) {
        let increments = [];
        // Define all zone ids
        let zoneIds = _.map(generation.zones, z => z.zone_id);
        zoneIds = ['all'].concat(zoneIds);
        // Define all object and group ids
        let objectIds = ['all', generation.object_id].concat(generation.group_ids || []);
        if (generation.assign_id != null)
            objectIds.push(generation.assign_id);
        let time = generation.time;
        // Generate specific events for object, groups and zones
        for (let objectId of objectIds) {
            for (let zoneId of zoneIds) {
                increments.push({
                    group: generation.org_id, name: 'events.' + objectId + '.' + zoneId + '.' + generation.rule_id,
                    time: time, timezone: organization.timezone, value: 1
                });
                increments.push({
                    group: generation.org_id, name: 'events.' + objectId + '.' + zoneId + '.all',
                    time: time, timezone: organization.timezone, value: 1
                });
            }
        }
        return increments;
    }
    generateIncrements(organization, generations) {
        let increments = [];
        for (let generation of generations) {
            let eventIncrements = this.generateEventIncrements(organization, generation);
            increments = increments.concat(eventIncrements);
        }
        return increments;
    }
    recordStatistics(correlationId, generations, organizationData, callback) {
        // Generate increments
        let increments = this.generateIncrements(organizationData.organization, generations);
        // Skip if nothing to record
        if (increments.length == 0) {
            callback(null);
            return;
        }
        this._cache.push(...increments);
        if (this._dumpCacheInterval == 0 || this._cache.length > this._maxCacheSize)
            this.dumpCache(correlationId, callback);
        else
            callback(null);
    }
    dumpCache(correlationId, callback) {
        if (this._cache.length == 0) {
            callback(null);
            return;
        }
        let increments = this._cache;
        this._cache = [];
        this._dependencies.statisticsClient.incrementCounters(correlationId, increments, (err) => {
            if (err)
                this._cache.push(...increments);
            callback(err);
        });
    }
}
exports.StatisticsRecorder = StatisticsRecorder;
//# sourceMappingURL=StatisticsRecorder.js.map