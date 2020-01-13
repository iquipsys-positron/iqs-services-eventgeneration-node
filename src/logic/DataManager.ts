let _ = require('lodash');
let async = require('async');

import { ConfigParams } from 'pip-services3-commons-node';
import { FilterParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';

import { OrganizationData } from './OrganizationData';
import { ExternalDependencies } from './ExternalDependencies';

export class DataManager implements IConfigurable {
    private _dependencies: ExternalDependencies;
    private _cacheTimeout: number = 300; // 5 min
    private _cache: { [orgId: string]: OrganizationData } = {};

    public setDependencies(dependencies: ExternalDependencies) {
        this._dependencies = dependencies;
    }

    public configure(config: ConfigParams): void {
        this._cacheTimeout = config.getAsIntegerWithDefault('options.cache_timeout', this._cacheTimeout);
    }

    private getCachedData(orgId: string): OrganizationData {
        // Get data from cache
        let data = this._cache[orgId];

        // Create a new data item if its not in cache
        if (data == null) {
            data = new OrganizationData();
            data.org_id = orgId;
            data.update_time = new Date(0);

            this._cache[orgId] = data;
        }

        return data;
    }

    private retrieveData(correlationId: string, data: OrganizationData,
        callback: (err: any, data: OrganizationData) => void): void {

        let filter = FilterParams.fromTuples(
            'org_id', data.org_id,
            'deleted', false
        );

        async.parallel([
            (callback) => {
                this._dependencies.organizationsClient.getOrganizationById(
                    correlationId, data.org_id,
                        (err, organization) => {
                            data.organization = organization;
                            callback(err);
                        }
                );
            },
            (callback) => {
                this._dependencies.eventRulesClient.getEventRules(
                    correlationId, filter, null,
                        (err, page) => {
                            if (page)
                                data.rules = page.data;
                            callback(err);
                        }
                );
            }
        ], (err) => {
            if (err == null)
                data.update_time = new Date();
            callback(err, data);
        });
    }

    public loadData(correlationId: string, orgId: string,
        callback: (err: any, data: OrganizationData) => void): void {
        
        let data = this.getCachedData(orgId);

        // If cache isn't expired then skip loading
        let elapsed = (new Date().getTime() - data.update_time.getTime()) / 1000;
        if (elapsed < this._cacheTimeout) {
            callback(null, data);
        } else {
            this.retrieveData(correlationId, data, callback);
        }
    }

    public forceLoadData(correlationId: string, orgId: string,
        callback: (err: any, data: OrganizationData) => void): void {
        
        let data = this.getCachedData(orgId);

        this.retrieveData(correlationId, data, callback);
    }
    
    public clearStaleData(): void {
        for (let prop in this._cache) {
            let data = this._cache[prop];

            let elapsed = (new Date().getTime() - data.update_time.getTime()) / 1000;
            if (elapsed < this._cacheTimeout)
                delete this._cache[prop];
        }
    }

    public clear(): void {
        this._cache = {};
    }

}