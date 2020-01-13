let _ = require('lodash');
let async = require('async');

import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';
import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { ICommandable } from 'pip-services3-commons-node';
import { CommandSet } from 'pip-services3-commons-node';
import { DateTimeConverter } from 'pip-services3-commons-node';
import { UnauthorizedException } from 'pip-services3-commons-node';
import { NotFoundException } from 'pip-services3-commons-node';
import { InvalidStateException } from 'pip-services3-commons-node';
import { CompositeLogger } from 'pip-services3-components-node';
import { IOpenable } from 'pip-services3-commons-node';
import { FixedRateTimer } from 'pip-services3-commons-node';

import { ExternalDependenciesResolver } from './ExternalDependenciesResolver';
import { ExternalDependencies } from './ExternalDependencies';

import { OrganizationV1 } from 'pip-clients-organizations-node';

import { EventGenerationStateV1 } from '../data/version1/EventGenerationStateV1';
import { EventGenerationV1 } from '../data/version1/EventGenerationV1';
import { IEventGenerationController } from './IEventGenerationController';
import { EventGenerationCommandSet } from './EventGenerationCommandSet';

import { OrganizationData } from './OrganizationData';
import { DataManager } from './DataManager';
import { RuleCalculator } from './RuleCalculator';
import { EventRecorder } from './EventRecorder';
import { StatisticsRecorder } from './StatisticsRecorder';
import { SignalSender } from './SignalSender';
import { MessageSender } from './MessageSender';

export class EventGenerationController implements  IConfigurable, IReferenceable, ICommandable, IOpenable, IEventGenerationController {
    private _logger: CompositeLogger = new CompositeLogger();
    private _dependencyResolver = new ExternalDependenciesResolver();
    private _dependencies: ExternalDependencies;
    private _commandSet: EventGenerationCommandSet;
    private _dumpCacheTimer: any;

    private _dumpCacheInterval: number = 30; // 30 sec

    private _dataManager = new DataManager();
    private _ruleCalculator = new RuleCalculator();
    private _eventRecorder = new EventRecorder();
    private _statisticsRecorder = new StatisticsRecorder();
    private _signalSender = new SignalSender();
    private _messageSender = new MessageSender();

    public configure(config: ConfigParams): void {
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

    public setReferences(references: IReferences): void {
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

    public getCommandSet(): CommandSet {
        if (this._commandSet == null)
            this._commandSet = new EventGenerationCommandSet(this);
        return this._commandSet;
    }
    
    public isOpen(): boolean {
        return this._dumpCacheTimer != null;
    }

    public open(correlationId: string, callback: (err: any) => void): void {
        if (this._dumpCacheTimer == null) {
            this._dumpCacheTimer = setInterval(() => {
                this.dumpCache();
            }, this._dumpCacheInterval * 1000);
        }
        
        if (callback) callback(null);
    }

    public close(correlationId: string, callback: (err: any) => void): void {
        if (this._dumpCacheTimer) {
            clearInterval(this._dumpCacheTimer);
            this._dumpCacheTimer = null;
        }

        this.dumpCache(callback);
    }

    private fixState(state: EventGenerationStateV1): void {
        state.time = DateTimeConverter.toNullableDateTime(state.time);
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
    
    public generateEventsForStates(correlationId: string, states: EventGenerationStateV1[], 
        callback?: (err: any, generations: EventGenerationV1[]) => void): void {
        
        let generations: EventGenerationV1[] = [];

        async.each(states, (state, callback) => {
            this.generateEventsForState(correlationId, state, (err, data) => {
                if (data)
                    generations = generations.concat(data);

                callback(err);
            });
        }, (err) => {
            if (callback) callback(err, generations);
        });
    }

    private handleAsyncCallback(correlationId: string, state: EventGenerationStateV1, message: string) {
        return (err: any, result?: any) => {
            if (err) {
                this._logger.error(
                    correlationId, err, message + ' for ' + state.object_id
                );
            }
        }
    }
    
    public generateEventsForState(correlationId: string, state: EventGenerationStateV1, 
        callback?: (err: any, generations: EventGenerationV1[]) => void): void {

        let organizationData: OrganizationData;
        let generations: EventGenerationV1[];
        this.fixState(state);

        async.series([
            // Get organization data
            (callback) => {
                this._dataManager.loadData(
                    correlationId, state.org_id,
                    (err, data) => {
                        organizationData = data;
                        callback(err);
                    }
                );
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
                        this._eventRecorder.recordEvents(
                            correlationId, generations, organizationData,
                            this.handleAsyncCallback(correlationId, state, 'Failed to record events')
                        );
                        callback();
                    },
                    // Record statistics
                    (callback) => {
                        this._statisticsRecorder.recordStatistics(
                            correlationId, generations, organizationData,
                            this.handleAsyncCallback(correlationId, state, 'Failed to record statistics')
                        );
                        callback();
                    },
                    // Send signals
                    (callback) => {
                        this._signalSender.sendSignals(
                            correlationId, generations, organizationData,
                            this.handleAsyncCallback(correlationId, state, 'Failed to send signals')
                        );
                        callback();
                    },
                    // Send email and sms messages
                    (callback) => {
                        this._messageSender.sendMessages(
                            correlationId, generations, organizationData,
                            this.handleAsyncCallback(correlationId, state, 'Failed to send messages')
                        );
                        callback();
                    }
                ], callback);
            }
        ], (err) => {
            if (err = 'abort') err = null;
            if (callback) callback(err, generations);
        });
    }

    private dumpCache(callback?: (err) => void): void {
        this._logger.debug('state-cache', 'Dumping event generation cache...');

        async.parallel([
            (callback) => {
                this._statisticsRecorder.dumpCache('state-cache', callback);
            }
        ], callback);
    }
        
}
