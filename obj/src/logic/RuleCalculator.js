"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const iqs_clients_eventrules_node_1 = require("iqs-clients-eventrules-node");
const iqs_clients_eventrules_node_2 = require("iqs-clients-eventrules-node");
const IdGenerator_1 = require("pip-services3-commons-node/obj/src/data/IdGenerator");
class RuleCalculator {
    setDependencies(dependencies) {
        this._dependencies = dependencies;
    }
    configure(config) {
    }
    contains(values1, values2) {
        return _.find(values2, v => _.indexOf(values1, v) >= 0) != null;
    }
    checkObjectMatch(state, rule) {
        if (state.object_id == null)
            return false;
        if (_.indexOf(rule.exclude_object_ids, state.object_id) >= 0)
            return false;
        if (state.assign_id)
            if (_.indexOf(rule.exclude_object_ids, state.assign_id) >= 0)
                return false;
        if (this.contains(rule.exclude_group_ids, state.group_ids))
            return false;
        if (rule.all_objects) {
            return true;
        }
        else {
            if (_.indexOf(rule.include_object_ids, state.object_id) >= 0)
                return true;
            if (state.assign_id)
                if (_.indexOf(rule.include_object_ids, state.assign_id) >= 0)
                    return true;
            if (this.contains(rule.include_group_ids, state.group_ids))
                return true;
            return false;
        }
    }
    checkZoneMatch(state, rule) {
        let zones = _.filter(state.zones, z => !z.exited);
        let zoneIds = _.map(zones, z => z.zone_id);
        if (this.contains(rule.exclude_zone_ids, zoneIds))
            return false;
        if (rule.all_zones) {
            return true;
        }
        else {
            if (this.contains(rule.include_zone_ids, zoneIds))
                return true;
            return false;
        }
    }
    checkEntryRule(state, rule) {
        if (state.online == 0)
            return false;
        if (!this.checkZoneMatch(state, rule))
            return false;
        for (let zone of state.zones) {
            if (_.indexOf(rule.include_zone_ids, zone.zone_id) >= 0 && zone.entered)
                return true;
        }
        return false;
    }
    checkExitRule(state, rule) {
        if (state.online == 0)
            return false;
        let zones = _.filter(state.zones, z => !z.entered);
        let zoneIds = _.map(zones, z => z.zone_id);
        if (this.contains(rule.exclude_zone_ids, zoneIds))
            return false;
        for (let zone of state.zones) {
            if (_.indexOf(rule.include_zone_ids, zone.zone_id) >= 0 && zone.exited)
                return true;
        }
        return false;
    }
    checkPressedRule(state, rule) {
        if (!this.checkZoneMatch(state, rule))
            return false;
        return state.online > 0 && state.pressed;
    }
    checkLongPressedRule(state, rule) {
        if (!this.checkZoneMatch(state, rule))
            return false;
        return state.online > 0 && state.long_pressed;
    }
    checkPowerOnRule(state, rule) {
        if (!this.checkZoneMatch(state, rule))
            return false;
        return state.online > 0 && state.power_changed != null && state.power_changed == true;
    }
    checkPowerOffRule(state, rule) {
        if (!this.checkZoneMatch(state, rule))
            return false;
        return state.online > 0 && state.power_changed != null && state.power_changed == false;
    }
    checkMinSpeedRule(state, rule) {
        if (!this.checkZoneMatch(state, rule))
            return false;
        let minSpeed = pip_services3_commons_node_1.IntegerConverter.toNullableInteger(rule.condition[iqs_clients_eventrules_node_2.EventRuleConditionParamV1.MinValue]);
        return state.online > 0 && state.speed > 1 && state.speed < minSpeed;
    }
    checkMaxSpeedRule(state, rule) {
        if (!this.checkZoneMatch(state, rule))
            return false;
        let maxSpeed = pip_services3_commons_node_1.IntegerConverter.toNullableInteger(rule.condition[iqs_clients_eventrules_node_2.EventRuleConditionParamV1.MaxValue]);
        return state.online > 0 && state.speed > maxSpeed;
    }
    checkFreezeRule(state, rule) {
        if (!this.checkZoneMatch(state, rule))
            return false;
        let duration = pip_services3_commons_node_1.IntegerConverter.toNullableInteger(rule.condition[iqs_clients_eventrules_node_2.EventRuleConditionParamV1.Duration]);
        return state.online > 0 && state.freezed > duration;
    }
    checkImmobilityRule(state, rule) {
        if (!this.checkZoneMatch(state, rule))
            return false;
        let duration = pip_services3_commons_node_1.IntegerConverter.toNullableInteger(rule.condition[iqs_clients_eventrules_node_2.EventRuleConditionParamV1.Duration]);
        return state.online > 0 && state.immobile > duration;
    }
    checkPresenceRule(state, rule) {
        if (state.online == 0)
            return false;
        if (!this.checkZoneMatch(state, rule))
            return false;
        let duration = pip_services3_commons_node_1.IntegerConverter.toNullableInteger(rule.condition[iqs_clients_eventrules_node_2.EventRuleConditionParamV1.Duration]);
        if (rule.all_zones) {
            // Calculate presence for entire organization
            return state.online >= duration;
        }
        else {
            // Calculate presence for included zones
            if (rule.include_zone_ids && rule.include_zone_ids.length > 0) {
                let zones = _.filter(state.zones, z => z.duration >= duration && !z.exited);
                let zoneIds = _.map(zones, z => z.zone_id);
                return this.contains(rule.include_zone_ids, zoneIds);
            }
            else {
                return false;
            }
        }
    }
    checkShowUpRule(state, rule) {
        if (!this.checkZoneMatch(state, rule))
            return false;
        return state.online > 0 && state.connected;
    }
    checkDisappearRule(state, rule, organization) {
        if (!this.checkZoneMatch(state, rule))
            return false;
        let offlineTimeout = organization && organization.params ? organization.params['offline_timeout'] : null;
        let duration = pip_services3_commons_node_1.IntegerConverter.toIntegerWithDefault(offlineTimeout, 900);
        let limit = 24 * 3600;
        return state.offline >= duration /*&& state.offline <= limit*/ /* && state.expected */;
    }
    checkRuleConditions(state, rule, organization) {
        // Apply object constraint
        if (!this.checkObjectMatch(state, rule))
            return false;
        switch (rule.type) {
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.Entry:
                return this.checkEntryRule(state, rule);
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.Exit:
                return this.checkExitRule(state, rule);
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.ButtonPressed:
                return this.checkPressedRule(state, rule);
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.ButtonLongPressed:
                return this.checkLongPressedRule(state, rule);
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.PowerOn:
                return this.checkPowerOnRule(state, rule);
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.PowerOff:
                return this.checkPowerOffRule(state, rule);
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.MaxSpeed:
                return this.checkMaxSpeedRule(state, rule);
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.MinSpeed:
                return this.checkMinSpeedRule(state, rule);
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.Immobility:
                return this.checkImmobilityRule(state, rule);
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.Freeze:
                return this.checkFreezeRule(state, rule);
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.Presence:
                return this.checkPresenceRule(state, rule);
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.ShowUp:
                return this.checkShowUpRule(state, rule);
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.Disappear:
                return this.checkDisappearRule(state, rule, organization);
            default:
                return false;
        }
    }
    getActiveRules(organizationData) {
        // Filter newly created rules
        let createTime = new Date().getTime() - 60000; // Now - 1 min
        let rules = _.filter(organizationData.rules, r => {
            let ruleCreateTime = pip_services3_commons_node_2.DateTimeConverter.toNullableDateTime(r.create_time);
            return ruleCreateTime == null || ruleCreateTime.getTime() < createTime;
        });
        return rules;
    }
    getZoneId(state, rule) {
        if (rule.all_zones)
            return null;
        switch (rule.type) {
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.Entry:
                let presences1 = _.filter(state.zones, z => z.entered);
                presences1 = _.filter(presences1, p => _.indexOf(rule.include_zone_ids, p.zone_id) >= 0);
                let presence1 = _.minBy(presences1, p => p.duration);
                return presence1 ? presence1.zone_id : null;
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.Exit:
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
    getExpectedValue(rule) {
        switch (rule.type) {
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.MaxSpeed:
                return rule.condition[iqs_clients_eventrules_node_2.EventRuleConditionParamV1.MaxValue];
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.MinSpeed:
                return rule.condition[iqs_clients_eventrules_node_2.EventRuleConditionParamV1.MinValue];
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.Presence:
                return rule.condition[iqs_clients_eventrules_node_2.EventRuleConditionParamV1.Duration] / 60;
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.Freeze:
                return rule.condition[iqs_clients_eventrules_node_2.EventRuleConditionParamV1.Duration] / 60;
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.Immobility:
                return rule.condition[iqs_clients_eventrules_node_2.EventRuleConditionParamV1.Duration] / 60;
            default:
                return null;
        }
    }
    getActualValue(state, rule) {
        switch (rule.type) {
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.MaxSpeed:
                return state.speed;
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.MinSpeed:
                return state.speed;
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.Presence:
                let zoneId = this.getZoneId(state, rule);
                let presence = _.find(state.zones, p => p.zone_id == zoneId);
                return presence && presence.duration ? presence.duration / 60 : state.online / 60;
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.Freeze:
                return state.freezed / 60;
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.Immobility:
                return state.immobile / 60;
            default:
                return null;
        }
    }
    getValueUnits(rule) {
        switch (rule.type) {
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.MinSpeed:
                return 'km/h';
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.MaxSpeed:
                return 'km/h';
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.Presence:
                return 'min';
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.Freeze:
                return 'min';
            case iqs_clients_eventrules_node_1.EventRuleTypeV1.Immobility:
                return 'min';
            default:
                return null;
        }
    }
    calculateActivations(state, organizationData) {
        let organization = organizationData.organization;
        let rules = this.getActiveRules(organizationData);
        let generations = [];
        for (let rule of rules) {
            if (this.checkRuleConditions(state, rule, organization)) {
                generations.push({
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
    checkEventGeneration(correlationId, generation, callback) {
        // Activate every time
        if (generation.rule.interval == 0) {
            callback(null, true);
            return;
        }
        this._dependencies.persistence.getExisting(correlationId, generation.org_id, generation.rule_id, generation.object_id, (err, lastActivation) => {
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
                id: lastActivation ? lastActivation.id : IdGenerator_1.IdGenerator.nextLong(),
                org_id: generation.org_id,
                rule_id: generation.rule_id,
                object_id: generation.object_id,
                time: generation.time
            };
            // Update last generation
            this._dependencies.persistence.createOrUpdate(correlationId, lastActivation, (err, item) => {
                callback(err, true);
            });
        });
    }
    generateEvents(correlationId, state, organizationData, callback) {
        // Calculate activated rules
        let generationsToCheck = this.calculateActivations(state, organizationData);
        let generations = [];
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
exports.RuleCalculator = RuleCalculator;
//# sourceMappingURL=RuleCalculator.js.map