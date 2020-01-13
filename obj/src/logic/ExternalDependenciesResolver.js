"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const ExternalDependencies_1 = require("./ExternalDependencies");
class ExternalDependenciesResolver extends pip_services3_commons_node_1.DependencyResolver {
    constructor() {
        super(ExternalDependenciesResolver._defaultConfig);
    }
    resolve() {
        let dependencies = new ExternalDependencies_1.ExternalDependencies();
        dependencies.messageDistributionClient = this.getOneRequired('msgdistribution');
        dependencies.organizationsClient = this.getOneRequired('organizations');
        dependencies.objectsClient = this.getOneRequired('control-objects');
        dependencies.zonesClient = this.getOneRequired('zones');
        dependencies.eventRulesClient = this.getOneRequired('event-rules');
        dependencies.eventsClient = this.getOneRequired('operational-events');
        dependencies.incidentsClient = this.getOneRequired('incidents');
        dependencies.signalsClient = this.getOneRequired('signals');
        dependencies.statisticsClient = this.getOneRequired('statistics');
        dependencies.persistence = this.getOneRequired('persistence');
        return dependencies;
    }
}
exports.ExternalDependenciesResolver = ExternalDependenciesResolver;
ExternalDependenciesResolver._defaultConfig = pip_services3_commons_node_2.ConfigParams.fromTuples('dependencies.msgdistribution', 'pip-services-msgdistribution:client:*:*:1.0', 'dependencies.organizations', 'pip-services-organizations:client:*:*:1.0', 'dependencies.control-objects', 'iqs-services-controlobjects:client:*:*:1.0', 'dependencies.zones', 'iqs-services-zones:client:*:*:1.0', 'dependencies.event-rules', 'iqs-services-eventrules:client:*:*:1.0', 'dependencies.operational-events', 'iqs-services-opevents:client:*:*:1.0', 'dependencies.incidents', 'iqs-services-incidents:client:*:*:1.0', 'dependencies.signals', 'iqs-services-signals:client:*:*:1.0', 'dependencies.statistics', 'pip-services-statistics:client:*:*:1.0', 'dependencies.persistence', 'iqs-services-eventgeneration:persistence:*:*:1.0');
//# sourceMappingURL=ExternalDependenciesResolver.js.map