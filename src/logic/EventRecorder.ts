let _ = require('lodash');
let async = require('async');

import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IdGenerator } from 'pip-services3-commons-node';

import { EventRuleV1 } from 'iqs-clients-eventrules-node';
import { EventRuleTypeV1 } from 'iqs-clients-eventrules-node';
import { EventRuleConditionParamV1 } from 'iqs-clients-eventrules-node';

import { SeverityV1 } from 'iqs-clients-opevents-node';
import { OperationalEventV1 } from 'iqs-clients-opevents-node';
import { OperationalEventTypeV1 } from 'iqs-clients-opevents-node';
import { IncidentV1 } from 'iqs-clients-incidents-node';
import { ZoneV1 } from 'iqs-clients-zones-node';

import { OrganizationData } from './OrganizationData';
import { ExternalDependencies } from './ExternalDependencies';
import { EventGenerationV1 } from '../data/version1/EventGenerationV1';

export class EventRecorder implements IConfigurable {
    private _dependencies: ExternalDependencies;

    public setDependencies(dependencies: ExternalDependencies) {
        this._dependencies = dependencies;
    }

    public configure(config: ConfigParams): void {
    }

    private getEventType(generation: EventGenerationV1): string {
        if (generation.rule.incident)
            return OperationalEventTypeV1.Incident;
        if (generation.rule.show_journal)
            return OperationalEventTypeV1.AutoRecord;
        return OperationalEventTypeV1.HiddenRecord;
    }

    private getEventPos(generation: EventGenerationV1): any {
        if (generation.lat && generation.lng) {
            return { type: 'Point', coordinates: [ generation.lng, generation.lat ] };
        }
        return null;
    }

    public generateEvent(generation: EventGenerationV1, organizationData: OrganizationData): OperationalEventV1 {
        return <OperationalEventV1>{
            id: IdGenerator.nextLong(),
            org_id: generation.org_id,
            create_time: new Date(),
            creator_id: null,
            
            type: this.getEventType(generation),
            rule_id: generation.rule_id,
            severity: generation.rule.severity,
            time: generation.time,
            pos: this.getEventPos(generation),

            group_id: generation.group_ids ? generation.group_ids[0] : null, // need to change OperationalEventV1 group_id to group_ids
            object_id: generation.object_id,
            assign_id: generation.assign_id,
            zone_id: generation.zone_id,

            description: generation.rule.name,
            expected_value: generation.expected_value,
            actual_value: generation.actual_value,
            value_units: generation.value_units
        };
    }

    public generateEvents(generations: EventGenerationV1[], organizationData: OrganizationData): OperationalEventV1[] {
        return _.map(generations, a => this.generateEvent(a, organizationData));
    }

    public generateIncident(event: OperationalEventV1): IncidentV1 {
        return <IncidentV1>{
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

    private checkIncident(event: OperationalEventV1, organizationData: OrganizationData): boolean {
        let rule = _.find(organizationData.rules, r => r.id == event.rule_id) || {};
        return rule.incident;
    }

    public generateIncidents(events: OperationalEventV1[], organizationData: OrganizationData): IncidentV1[] {
        events = _.filter(events, e => this.checkIncident(e, organizationData));
        return _.map(events, e => this.generateIncident(e));
    }

    private recordOperationalEvents(correlationId: string, events: OperationalEventV1[],
        callback: (err: any) => void): void {
        async.each(events, (event, callback) => {
            this._dependencies.eventsClient.logEvent(correlationId, event.org_id, event, callback);
        }, callback);
    }

    private recordIncidents(correlationId: string, incidents: IncidentV1[],
        callback: (err: any) => void): void {
        async.each(incidents, (incident, callback) => {
            this._dependencies.incidentsClient.createIncident(correlationId, incident.org_id, incident, callback);
        }, callback);
    }

    public recordEvents(correlationId: string, generations: EventGenerationV1[],
        organizationData: OrganizationData, callback: (err: any) => void): void {

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