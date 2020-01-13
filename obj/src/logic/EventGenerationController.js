"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_components_node_1 = require("pip-services3-components-node");
const ExternalDependenciesResolver_1 = require("./ExternalDependenciesResolver");
const EventGenerationCommandSet_1 = require("./EventGenerationCommandSet");
const DataManager_1 = require("./DataManager");
const RuleCalculator_1 = require("./RuleCalculator");
const EventRecorder_1 = require("./EventRecorder");
const StatisticsRecorder_1 = require("./StatisticsRecorder");
const SignalSender_1 = require("./SignalSender");
const MessageSender_1 = require("./MessageSender");
class EventGenerationController {
    constructor() {
        this._logger = new pip_services3_components_node_1.CompositeLogger();
        this._dependencyResolver = new ExternalDependenciesResolver_1.ExternalDependenciesResolver();
        this._dumpCacheInterval = 30; // 30 sec
        this._dataManager = new DataManager_1.DataManager();
        this._ruleCalculator = new RuleCalculator_1.RuleCalculator();
        this._eventRecorder = new EventRecorder_1.EventRecorder();
        this._statisticsRecorder = new StatisticsRecorder_1.StatisticsRecorder();
        this._signalSender = new SignalSender_1.SignalSender();
        this._messageSender = new MessageSender_1.MessageSender();
    }
    configure(config) {
        this._dumpCacheInterval = config.getAsIntegerWithDefault('options.dump_cache_interval', this._dumpCacheInterval);
        this._logger.configure(config);
        this._dependencyResolver.configure(config);
        this._dataManager.configure(config);
        this._ruleCalculator.configure(config);
        this._eventRecorder.configure(config);
        this._statisticsRecorder.configure(config);
        this._signalSender.configure(config);
        this._messageSender.configure(config);
    }
    setReferences(references) {
        this._logger.setReferences(references);
        this._dependencyResolver.setReferences(references);
        this._dependencies = this._dependencyResolver.resolve();
        this._dependencies.logger = this._logger;
        this._dataManager.setDependencies(this._dependencies);
        this._ruleCalculator.setDependencies(this._dependencies);
        this._eventRecorder.setDependencies(this._dependencies);
        this._statisticsRecorder.setDependencies(this._dependencies);
        this._signalSender.setDependencies(this._dependencies);
        this._messageSender.setDependencies(this._dependencies);
    }
    getCommandSet() {
        if (this._commandSet == null)
            this._commandSet = new EventGenerationCommandSet_1.EventGenerationCommandSet(this);
        return this._commandSet;
    }
    isOpen() {
        return this._dumpCacheTimer != null;
    }
    open(correlationId, callback) {
        if (this._dumpCacheTimer == null) {
            this._dumpCacheTimer = setInterval(() => {
                this.dumpCache();
            }, this._dumpCacheInterval * 1000);
        }
        if (callback)
            callback(null);
    }
    close(correlationId, callback) {
        if (this._dumpCacheTimer) {
            clearInterval(this._dumpCacheTimer);
            this._dumpCacheTimer = null;
        }
        this.dumpCache(callback);
    }
    fixState(state) {
        state.time = pip_services3_commons_node_1.DateTimeConverter.toNullableDateTime(state.time);
        state.time = state.time || new Date();
        state.zones = state.zones || [];
        state.group_ids = state.group_ids || [];
        if (state.speed) {
            state.speed = Math.max(0, state.speed);
            state.speed = Math.min(120, state.speed);
        }
        if (state.online > 0) {
            state.offline = 0;
        }
        if (state.offline > 0) {
            state.connected = false;
            state.online = 0;
            state.pressed = false;
            state.long_pressed = false;
            state.power_changed = null;
            state.speed = null;
        }
    }
    generateEventsForStates(correlationId, states, callback) {
        let generations = [];
        async.each(states, (state, callback) => {
            this.generateEventsForState(correlationId, state, (err, data) => {
                if (data)
                    generations = generations.concat(data);
                callback(err);
            });
        }, (err) => {
            if (callback)
                callback(err, generations);
        });
    }
    handleAsyncCallback(correlationId, state, message) {
        return (err, result) => {
            if (err) {
                this._logger.error(correlationId, err, message + ' for ' + state.object_id);
            }
        };
    }
    generateEventsForState(correlationId, state, callback) {
        let organizationData;
        let generations;
        this.fixState(state);
        async.series([
            // Get organization data
            (callback) => {
                this._dataManager.loadData(correlationId, state.org_id, (err, data) => {
                    organizationData = data;
                    callback(err);
                });
            },
            // Filter rules based on previous generations
            (callback) => {
                this._ruleCalculator.generateEvents(correlationId, state, organizationData, (err, data) => {
                    generations = data;
                    if (err == null && generations != null && generations.length == 0)
                        err = "abort";
                    callback(err);
                });
            },
            // Record results
            (callback) => {
                async.parallel([
                    // Record events and incidents
                    (callback) => {
                        this._eventRecorder.recordEvents(correlationId, generations, organizationData, this.handleAsyncCallback(correlationId, state, 'Failed to record events'));
                        callback();
                    },
                    // Record statistics
                    (callback) => {
                        this._statisticsRecorder.recordStatistics(correlationId, generations, organizationData, this.handleAsyncCallback(correlationId, state, 'Failed to record statistics'));
                        callback();
                    },
                    // Send signals
                    (callback) => {
                        this._signalSender.sendSignals(correlationId, generations, organizationData, this.handleAsyncCallback(correlationId, state, 'Failed to send signals'));
                        callback();
                    },
                    // Send email and sms messages
                    (callback) => {
                        this._messageSender.sendMessages(correlationId, generations, organizationData, this.handleAsyncCallback(correlationId, state, 'Failed to send messages'));
                        callback();
                    }
                ], callback);
            }
        ], (err) => {
            if (err = 'abort')
                err = null;
            if (callback)
                callback(err, generations);
        });
    }
    dumpCache(callback) {
        this._logger.debug('state-cache', 'Dumping event generation cache...');
        async.parallel([
            (callback) => {
                this._statisticsRecorder.dumpCache('state-cache', callback);
            }
        ], callback);
    }
}
exports.EventGenerationController = EventGenerationController;
//# sourceMappingURL=EventGenerationController.js.map