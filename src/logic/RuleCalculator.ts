let _ = require('lodash');
let async = require('async');

import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IntegerConverter } from 'pip-services3-commons-node';
import { DateTimeConverter } from 'pip-services3-commons-node';

import { EventRuleV1 } from 'iqs-clients-eventrules-node';
import { EventRuleTypeV1 } from 'iqs-clients-eventrules-node';
import { EventRuleConditionParamV1 } from 'iqs-clients-eventrules-node';
import { ControlObjectV1 } from 'iqs-clients-controlobjects-node';
import { OrganizationV1 } from 'pip-clients-organizations-node';

import { EventGenerationV1 } from '../data/version1/EventGenerationV1';
import { EventGenerationStateV1 } from '../data/version1/EventGenerationStateV1';
import { OrganizationData } from './OrganizationData';
import { ExternalDependencies } from './ExternalDependencies';
import { EventGenerationZoneV1Schema } from '../data/version1/EventGenerationZoneV1Schema';
import { IdGenerator } from 'pip-services3-commons-node/obj/src/data/IdGenerator';

export class RuleCalculator implements IConfigurable {
    private _dependencies: ExternalDependencies;

    public setDependencies(dependencies: ExternalDependencies) {
        this._dependencies = dependencies;
    }

    public configure(config: ConfigParams): void {
    }

    private contains(values1: string[], values2: string[]): boolean {
        return _.find(values2, v => _.indexOf(values1, v) >= 0) != null;
    }

    private checkObjectMatch(state: EventGenerationStateV1, rule: EventRuleV1): boolean {
        if (state.object_id == null) return false;

        if (_.indexOf(rule.exclude_object_ids, state.object_id) >= 0) return false;
        if (state.assign_id)
            if (_.indexOf(rule.exclude_object_ids, state.assign_id) >= 0) return false;
        if (this.contains(rule.exclude_group_ids, state.group_ids)) return false;

        if (rule.all_objects) {
            return true;
        } else {
            if (_.indexOf(rule.include_object_ids, state.object_id) >= 0) return true;
            if (state.assign_id)
                if (_.indexOf(rule.include_object_ids, state.assign_id) >= 0) return true;
            if (this.contains(rule.include_group_ids, state.group_ids)) return true;

            return false;
        }
    }

    private checkZoneMatch(state: EventGenerationStateV1, rule: EventRuleV1): boolean {
        let zones = _.filter(state.zones, z => !z.exited);
        let zoneIds = _.map(zones, z => z.zone_id);

        if (this.contains(rule.exclude_zone_ids, zoneIds)) return false;

        if (rule.all_zones) {
            return true;
        } else {
            if (this.contains(rule.include_zone_ids, zoneIds)) return true;
            return false;
        }
    }

    private checkEntryRule(state: EventGenerationStateV1, rule: EventRuleV1): boolean {
        if (state.online == 0) return false;
        if (!this.checkZoneMatch(state, rule)) return false;
        
        for (let zone of state.zones) {
            if (_.indexOf(rule.include_zone_ids, zone.zone_id) >= 0 && zone.entered)
                return true;
        }

        return false;
    }

    private checkExitRule(state: EventGenerationStateV1, rule: EventRuleV1): boolean {
        if (state.online == 0) return false;

        let zones = _.filter(state.zones, z => !z.entered);
        let zoneIds = _.map(zones, z => z.zone_id);
        if (this.contains(rule.exclude_zone_ids, zoneIds)) return false;
                
        for (let zone of state.zones) {
            if (_.indexOf(rule.include_zone_ids, zone.zone_id) >= 0 && zone.exited)
                return true;
        }

        return false;
    }

    private checkPressedRule(state: EventGenerationStateV1, rule: EventRuleV1): boolean {
        if (!this.checkZoneMatch(state, rule)) return false;
        return state.online > 0 && state.pressed;
    }

    private checkLongPressedRule(state: EventGenerationStateV1, rule: EventRuleV1): boolean {
        if (!this.checkZoneMatch(state, rule)) return false;
        return state.online > 0 && state.long_pressed;
    }

    private checkPowerOnRule(state: EventGenerationStateV1, rule: EventRuleV1): boolean {
        if (!this.checkZoneMatch(state, rule)) return false;
        return state.online > 0 && state.power_changed != null && state.power_changed == true;
    }

    private checkPowerOffRule(state: EventGenerationStateV1, rule: EventRuleV1): boolean {
        if (!this.checkZoneMatch(state, rule)) return false;
        return state.online > 0 && state.power_changed != null && state.power_changed == false;
    }
    
    private checkMinSpeedRule(state: EventGenerationStateV1, rule: EventRuleV1): boolean {
        if (!this.checkZoneMatch(state, rule)) return false;
        let minSpeed = IntegerConverter.toNullableInteger(rule.condition[EventRuleConditionParamV1.MinValue]);
        return state.online > 0 && state.speed > 1 && state.speed < minSpeed;
    }

    private checkMaxSpeedRule(state: EventGenerationStateV1, rule: EventRuleV1): boolean {
        if (!this.checkZoneMatch(state, rule)) return false;
        let maxSpeed = IntegerConverter.toNullableInteger(rule.condition[EventRuleConditionParamV1.MaxValue]);
        return state.online > 0 && state.speed > maxSpeed;
    }

    private checkFreezeRule(state: EventGenerationStateV1, rule: EventRuleV1): boolean {
        if (!this.checkZoneMatch(state, rule)) return false;
        let duration = IntegerConverter.toNullableInteger(rule.condition[EventRuleConditionParamV1.Duration]);
        return state.online > 0 && state.freezed > duration;
    }

    private checkImmobilityRule(state: EventGenerationStateV1, rule: EventRuleV1): boolean {
        if (!this.checkZoneMatch(state, rule)) return false;
        let duration = IntegerConverter.toNullableInteger(rule.condition[EventRuleConditionParamV1.Duration]);
        return state.online > 0 && state.immobile > duration;
    }
    
    private checkPresenceRule(state: EventGenerationStateV1, rule: EventRuleV1): boolean {
        if (state.online == 0) return false;
        if (!this.checkZoneMatch(state, rule)) return false;
        
        let duration = IntegerConverter.toNullableInteger(rule.condition[EventRuleConditionParamV1.Duration]);

        if (rule.all_zones) {
            // Calculate presence for entire organization
            return state.online >= duration;
        } else {
            // Calculate presence for included zones
            if (rule.include_zone_ids && rule.include_zone_ids.length > 0) {
                let zones = _.filter(state.zones, z => z.duration >= duration && !z.exited);
                let zoneIds = _.map(zones, z => z.zone_id);
                return this.contains(rule.include_zone_ids, zoneIds);
            } else {
                return false;
            }
        }
    }

    private checkShowUpRule(state: EventGenerationStateV1, rule: EventRuleV1): boolean {
        if (!this.checkZoneMatch(state, rule)) return false;
        return state.online > 0 && state.connected;
    }

    private checkDisappearRule(state: EventGenerationStateV1, rule: EventRuleV1, organization: OrganizationV1): boolean {
        if (!this.checkZoneMatch(state, rule)) return false;

        let offlineTimeout = organization && organization.params ? organization.params['offline_timeout'] : null;
        let duration = IntegerConverter.toIntegerWithDefault(offlineTimeout, 900);
        let limit = 24 * 3600;
        return state.offline >= duration /*&& state.offline <= limit*/ /* && state.expected */;
    }

    private checkRuleConditions(state: EventGenerationStateV1, rule: EventRuleV1, organization: OrganizationV1): boolean {
        // Apply object constraint
        if (!this.checkObjectMatch(state, rule))
            return false;

        switch (rule.type) {
            case EventRuleTypeV1.Entry:
                return this.checkEntryRule(state, rule);
            case EventRuleTypeV1.Exit:
                return this.checkExitRule(state, rule);
            case EventRuleTypeV1.ButtonPressed:
                return this.checkPressedRule(state, rule);
            case EventRuleTypeV1.ButtonLongPressed:
                return this.checkLongPressedRule(state, rule);
            case EventRuleTypeV1.PowerOn:
                return this.checkPowerOnRule(state, rule);
            case EventRuleTypeV1.PowerOff:
                return this.checkPowerOffRule(state, rule);
            case EventRuleTypeV1.MaxSpeed:
                return this.checkMaxSpeedRule(state, rule);
            case EventRuleTypeV1.MinSpeed:
                return this.checkMinSpeedRule(state, rule);
            case EventRuleTypeV1.Immobility:
                return this.checkImmobilityRule(state, rule);
            case EventRuleTypeV1.Freeze:
                return this.checkFreezeRule(state, rule);
            case EventRuleTypeV1.Presence:
                return this.checkPresenceRule(state, rule);
            case EventRuleTypeV1.ShowUp:
                return this.checkShowUpRule(state, rule);
            case EventRuleTypeV1.Disappear:
                return this.checkDisappearRule(state, rule, organization);
            default:
                return false;
        }
    }

    private getActiveRules(organizationData: OrganizationData): EventRuleV1[] {
        // Filter newly created rules
        let createTime = new Date().getTime() - 60000; // Now - 1 min
        let rules = _.filter(organizationData.rules, r => {
            let ruleCreateTime = DateTimeConverter.toNullableDateTime(r.create_time);
            return ruleCreateTime == null || ruleCreateTime.getTime() < createTime;
        });
        return rules;
    }

    private getZoneId(state: EventGenerationStateV1, rule: EventRuleV1): string {
        if (rule.all_zones) return null

        switch (rule.type) {
            case EventRuleTypeV1.Entry:
                let presences1 = _.filter(state.zones, z => z.entered);
                presences1 = _.filter(presences1, p => _.indexOf(rule.include_zone_ids, p.zone_id) >= 0);
                let presence1 = _.minBy(presences1, p => p.duration);
                return presence1 ? presence1.zone_id : null;
            case EventRuleTypeV1.Exit:
                let presences2 = _.filter(state.zones, z => z.exited);
                presences2 = _.filter(presences2, p => _.indexOf(rule.include_zone_ids, p.zone_id) >= 0);
                let presence2 = _.maxBy(presences2, p => p.duration);
                return presence2 ? presence2.zone_id : null;
            default:
                let presences3 = _.filter(state.zones, z => !z.exited);
                presences3 = _.filter(state.zones, p => _.indexOf(rule.include_zone_ids, p.zone_id) >= 0);
                let presence3 = _.maxBy(presences3, p => p.duration);
                return presence3 ? presence3.zone_id : null;
        }
    }

    private getExpectedValue(rule: EventRuleV1): any {
        switch (rule.type) {
            case EventRuleTypeV1.MaxSpeed:
                return rule.condition[EventRuleConditionParamV1.MaxValue];
            case EventRuleTypeV1.MinSpeed:
                return rule.condition[EventRuleConditionParamV1.MinValue];
            case EventRuleTypeV1.Presence:
                return rule.condition[EventRuleConditionParamV1.Duration] / 60;
            case EventRuleTypeV1.Freeze:
                return rule.condition[EventRuleConditionParamV1.Duration] / 60;
            case EventRuleTypeV1.Immobility:
                return rule.condition[EventRuleConditionParamV1.Duration] / 60;
            default:
                return null;
        }
    }

    private getActualValue(state: EventGenerationStateV1, rule: EventRuleV1): any {
        switch (rule.type) {
            case EventRuleTypeV1.MaxSpeed:
                return state.speed;
            case EventRuleTypeV1.MinSpeed:
                return state.speed;
            case EventRuleTypeV1.Presence:
                let zoneId = this.getZoneId(state, rule);
                let presence = _.find(state.zones, p => p.zone_id == zoneId);
                return presence && presence.duration ? presence.duration / 60 : state.online / 60;
            case EventRuleTypeV1.Freeze:
                return state.freezed / 60;
            case EventRuleTypeV1.Immobility:
                return state.immobile / 60;
            default:
                return null;
        }
    }

    private getValueUnits(rule: EventRuleV1): any {
        switch (rule.type) {
            case EventRuleTypeV1.MinSpeed:
                return 'km/h';
            case EventRuleTypeV1.MaxSpeed:
                return 'km/h';
            case EventRuleTypeV1.Presence:
                return 'min';
            case EventRuleTypeV1.Freeze:
                return 'min';
            case EventRuleTypeV1.Immobility:
                return 'min';
            default:
                return null;
        }
    }
    
    public calculateActivations(state: EventGenerationStateV1, organizationData: OrganizationData): EventGenerationV1[] {
        let organization = organizationData.organization;
        let rules = this.getActiveRules(organizationData);
        let generations: EventGenerationV1[] = [];

        for (let rule of rules) {
            if (this.checkRuleConditions(state, rule, organization)) {
                generations.push(<EventGenerationV1>{
                    org_id: state.org_id,
                    organization: organization,
                    object_id: state.object_id,
                    assign_id: state.assign_id,
                    group_ids: state.group_ids,
                    device_id: state.device_id,

                    rule_id: rule.id,
                    rule_type: rule.type,
                    rule: rule,

                    zone_id: this.getZoneId(state, rule),
                    expected_value: this.getExpectedValue(rule),
                    actual_value: this.getActualValue(state, rule),
                    value_units: this.getValueUnits(rule),
                
                    time: state.time,
                    lat: state.lat,
                    lng: state.lng,
                    alt: state.alt,
                    angle: state.angle,
                    speed: state.speed,

                    expected: state.expected,
                    connected: state.connected,
                    online: state.online,
                    offline: state.offline,
                    freezed: state.freezed,
                    immobile: state.immobile,
                    pressed: state.pressed,
                    long_pressed: state.long_pressed,
                    power_changed: state.power_changed,
                
                    params: state.params,
                    events: state.events,
                    commands: state.commands,
                    states: state.states,

                    zones: state.zones
                });
            }
        }

        return generations;
    }

    private checkEventGeneration(correlationId: string, generation: EventGenerationV1,
        callback: (err: any, result: boolean) => void): void {
        
        // Activate every time
        if (generation.rule.interval == 0) {
            callback(null, true);
            return;
        }

        this._dependencies.persistence.getExisting(correlationId, generation.org_id,
            generation.rule_id, generation.object_id, (err, lastActivation) => {
                if (err) {
                    callback(err, false);
                    return;
                }

                let lastTime = lastActivation ? lastActivation.time.getTime() : 0;
                let duration = (generation.time.getTime() - lastTime) / 1000;
                let interval = generation.rule.interval || 300;

                // If interval is not elapsed then do not create a new one
                if (duration < interval) {
                    callback(err, false);
                    return;
                }

                lastActivation = {
                    id: lastActivation ? lastActivation.id : IdGenerator.nextLong(),
                    org_id: generation.org_id,
                    rule_id: generation.rule_id,
                    object_id: generation.object_id,
                    time: generation.time
                };

                // Update last generation
                this._dependencies.persistence.createOrUpdate(correlationId, lastActivation, (err, item) => {
                    callback(err, true);
                });
            }
        );
    }
    
    public generateEvents(correlationId: string, state: EventGenerationStateV1, organizationData: OrganizationData,
        callback: (err: any, generations: EventGenerationV1[]) => void) {

        // Calculate activated rules
        let generationsToCheck = this.calculateActivations(state, organizationData);
        let generations: EventGenerationV1[] = [];

        // Shortcut to avoid extra processing
        if (generationsToCheck.length == 0) {
            callback(null, []);
            return;
        }

        // Filter out already activated rules
        async.each(generationsToCheck, (generation, callback) => {
            this.checkEventGeneration(correlationId, generation, (err, result) => {
                if (result)
                    generations.push(generation);
                callback(err);
            });
        }, (err) => {
            callback(err, generations);
        });
    }

}