"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_container_node_1 = require("pip-services3-container-node");
const pip_clients_msgdistribution_node_1 = require("pip-clients-msgdistribution-node");
const pip_clients_statistics_node_1 = require("pip-clients-statistics-node");
const pip_clients_organizations_node_1 = require("pip-clients-organizations-node");
const iqs_clients_signals_node_1 = require("iqs-clients-signals-node");
const iqs_clients_controlobjects_node_1 = require("iqs-clients-controlobjects-node");
const iqs_clients_eventrules_node_1 = require("iqs-clients-eventrules-node");
const iqs_clients_zones_node_1 = require("iqs-clients-zones-node");
const iqs_clients_opevents_node_1 = require("iqs-clients-opevents-node");
const iqs_clients_incidents_node_1 = require("iqs-clients-incidents-node");
const pip_services3_rpc_node_1 = require("pip-services3-rpc-node");
const EventGenerationServiceFactory_1 = require("../build/EventGenerationServiceFactory");
class EventGenerationProcess extends pip_services3_container_node_1.ProcessContainer {
    constructor() {
        super("event_generation", "Event generation microservice");
        this._factories.add(new EventGenerationServiceFactory_1.EventGenerationServiceFactory);
        this._factories.add(new pip_clients_organizations_node_1.OrganizationsClientFactory());
        this._factories.add(new iqs_clients_signals_node_1.SignalsClientFactory());
        this._factories.add(new pip_clients_msgdistribution_node_1.MessageDistributionClientFactory());
        this._factories.add(new iqs_clients_controlobjects_node_1.ControlObjectsClientFactory());
        this._factories.add(new iqs_clients_eventrules_node_1.EventRulesClientFactory());
        this._factories.add(new iqs_clients_zones_node_1.ZonesClientFactory());
        this._factories.add(new iqs_clients_opevents_node_1.OperationalEventsClientFactory());
        this._factories.add(new iqs_clients_incidents_node_1.IncidentsClientFactory());
        this._factories.add(new pip_clients_statistics_node_1.StatisticsClientFactory());
        this._factories.add(new pip_services3_rpc_node_1.DefaultRpcFactory);
    }
}
exports.EventGenerationProcess = EventGenerationProcess;
//# sourceMappingURL=EventGenerationProcess.js.map