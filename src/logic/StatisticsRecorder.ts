let _ = require('lodash');
let async = require('async');

import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';

import { OrganizationV1 } from 'pip-clients-organizations-node';

import { StatCounterIncrementV1 } from 'pip-clients-statistics-node';

import { EventGenerationV1 } from '../data/version1/EventGenerationV1';
import { OrganizationData } from './OrganizationData';
import { ExternalDependencies } from './ExternalDependencies';

export class StatisticsRecorder implements IConfigurable {
    private _dependencies: ExternalDependencies;
    private _dumpCacheInterval: number = 5;
    private _cache: StatCounterIncrementV1[] = [];
    private _maxCacheSize = 100;

    public setDependencies(dependencies: ExternalDependencies) {
        this._dependencies = dependencies;
    }

    public configure(config: ConfigParams): void {
        this._dumpCacheInterval = config.getAsIntegerWithDefault('options.dump_cache_interval', this._dumpCacheInterval);
    }
    
    public generateEventIncrements(organization: OrganizationV1, generation: EventGenerationV1): StatCounterIncrementV1[] {
        let increments: StatCounterIncrementV1[] = [];

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
                increments.push(<StatCounterIncrementV1>{
                    group: generation.org_id, name: 'events.' + objectId + '.' + zoneId + '.' + generation.rule_id,
                    time: time, timezone: organization.timezone, value: 1
                });
                increments.push(<StatCounterIncrementV1>{
                    group: generation.org_id, name: 'events.' + objectId + '.' + zoneId + '.all',
                    time: time, timezone: organization.timezone, value: 1
                });
            }
        }

        return increments;
    }

    public generateIncrements(organization: OrganizationV1, generations: EventGenerationV1[]): StatCounterIncrementV1[] {
        let increments: StatCounterIncrementV1[] = [];

        for (let generation of generations) {
            let eventIncrements = this.generateEventIncrements(organization, generation);
            increments = increments.concat(eventIncrements);
        }

        return increments;
    }

    public recordStatistics(correlationId: string, generations: EventGenerationV1[],
        organizationData: OrganizationData, callback: (err: any) => void): void {

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
        else callback(null);
    }

    public dumpCache(correlationId: string, callback: (err: any) => void): void {
        if (this._cache.length == 0) {
            callback(null);
            return;
        }

        let increments = this._cache;
        this._cache = [];

        this._dependencies.statisticsClient.incrementCounters(
            correlationId, increments, (err) => {
                if (err)
                    this._cache.push(...increments);
                callback(err);
            }
        );
    }
    
}