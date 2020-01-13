"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const iqs_clients_opevents_node_1 = require("iqs-clients-opevents-node");
class EventRecorder {
    setDependencies(dependencies) {
        this._dependencies = dependencies;
    }
    configure(config) {
    }
    getEventType(generation) {
        if (generation.rule.incident)
            return iqs_clients_opevents_node_1.OperationalEventTypeV1.Incident;
        if (generation.rule.show_journal)
            return iqs_clients_opevents_node_1.OperationalEventTypeV1.AutoRecord;
        return iqs_clients_opevents_node_1.OperationalEventTypeV1.HiddenRecord;
    }
    getEventPos(generation) {
        if (generation.lat && generation.lng) {
            return { type: 'Point', coordinates: [generation.lng, generation.lat] };
        }
        return null;
    }
    generateEvent(generation, organizationData) {
        return {
            id: pip_services3_commons_node_1.IdGenerator.nextLong(),
            org_id: generation.org_id,
            create_time: new Date(),
            creator_id: null,
            type: this.getEventType(generation),
            rule_id: generation.rule_id,
            severity: generation.rule.severity,
            time: generation.time,
            pos: this.getEventPos(generation),
            group_id: generation.group_ids ? generation.group_ids[0] : null,
            object_id: generation.object_id,
            assign_id: generation.assign_id,
            zone_id: generation.zone_id,
            description: generation.rule.name,
            expected_value: generation.expected_value,
            actual_value: generation.actual_value,
            value_units: generation.value_units
        };
    }
    generateEvents(generations, organizationData) {
        return _.map(generations, a => this.generateEvent(a, organizationData));
    }
    generateIncident(event) {
        return {
            id: null,
            org_id: event.org_id,
            create_time: event.create_time,
            creator_id: null,
            type: event.type,
            rule_id: event.rule_id,
            event_id: event.id,
            severity: event.severity,
            time: event.time,
            pos: event.pos,
            object_id: event.object_id,
            group_id: event.group_id,
            assign_id: event.assign_id,
            zone_id: event.zone_id,
            description: event.description,
            expected_value: event.expected_value,
            actual_value: event.actual_value,
            value_units: event.value_units
        };
    }
    checkIncident(event, organizationData) {
        let rule = _.find(organizationData.rules, r => r.id == event.rule_id) || {};
        return rule.incident;
    }
    generateIncidents(events, organizationData) {
        events = _.filter(events, e => this.checkIncident(e, organizationData));
        return _.map(events, e => this.generateIncident(e));
    }
    recordOperationalEvents(correlationId, events, callback) {
        async.each(events, (event, callback) => {
            this._dependencies.eventsClient.logEvent(correlationId, event.org_id, event, callback);
        }, callback);
    }
    recordIncidents(correlationId, incidents, callback) {
        async.each(incidents, (incident, callback) => {
            this._dependencies.incidentsClient.createIncident(correlationId, incident.org_id, incident, callback);
        }, callback);
    }
    recordEvents(correlationId, generations, organizationData, callback) {
        // Create events and incidents to record
        let events = this.generateEvents(generations, organizationData);
        let incidents = this.generateIncidents(events, organizationData);
        // Skip if nothing to record
        if (events.length == 0 && incidents.length == 0) {
            callback(null);
            return;
        }
        async.parallel([
            (callback) => {
                this.recordOperationalEvents(correlationId, events, callback);
            },
            (callback) => {
                this.recordIncidents(correlationId, incidents, callback);
            },
        ], callback);
    }
}
exports.EventRecorder = EventRecorder;
//# sourceMappingURL=EventRecorder.js.map