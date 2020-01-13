"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const OrganizationData_1 = require("./OrganizationData");
class DataManager {
    constructor() {
        this._cacheTimeout = 300; // 5 min
        this._cache = {};
    }
    setDependencies(dependencies) {
        this._dependencies = dependencies;
    }
    configure(config) {
        this._cacheTimeout = config.getAsIntegerWithDefault('options.cache_timeout', this._cacheTimeout);
    }
    getCachedData(orgId) {
        // Get data from cache
        let data = this._cache[orgId];
        // Create a new data item if its not in cache
        if (data == null) {
            data = new OrganizationData_1.OrganizationData();
            data.org_id = orgId;
            data.update_time = new Date(0);
            this._cache[orgId] = data;
        }
        return data;
    }
    retrieveData(correlationId, data, callback) {
        let filter = pip_services3_commons_node_1.FilterParams.fromTuples('org_id', data.org_id, 'deleted', false);
        async.parallel([
            (callback) => {
                this._dependencies.organizationsClient.getOrganizationById(correlationId, data.org_id, (err, organization) => {
                    data.organization = organization;
                    callback(err);
                });
            },
            (callback) => {
                this._dependencies.eventRulesClient.getEventRules(correlationId, filter, null, (err, page) => {
                    if (page)
                        data.rules = page.data;
                    callback(err);
                });
            }
        ], (err) => {
            if (err == null)
                data.update_time = new Date();
            callback(err, data);
        });
    }
    loadData(correlationId, orgId, callback) {
        let data = this.getCachedData(orgId);
        // If cache isn't expired then skip loading
        let elapsed = (new Date().getTime() - data.update_time.getTime()) / 1000;
        if (elapsed < this._cacheTimeout) {
            callback(null, data);
        }
        else {
            this.retrieveData(correlationId, data, callback);
        }
    }
    forceLoadData(correlationId, orgId, callback) {
        let data = this.getCachedData(orgId);
        this.retrieveData(correlationId, data, callback);
    }
    clearStaleData() {
        for (let prop in this._cache) {
            let data = this._cache[prop];
            let elapsed = (new Date().getTime() - data.update_time.getTime()) / 1000;
            if (elapsed < this._cacheTimeout)
                delete this._cache[prop];
        }
    }
    clear() {
        this._cache = {};
    }
}
exports.DataManager = DataManager;
//# sourceMappingURL=DataManager.js.map