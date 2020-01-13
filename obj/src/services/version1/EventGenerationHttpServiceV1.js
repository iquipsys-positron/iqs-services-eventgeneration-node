"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_rpc_node_1 = require("pip-services3-rpc-node");
class EventGenerationHttpServiceV1 extends pip_services3_rpc_node_1.CommandableHttpService {
    constructor() {
        super('v1/event_generation');
        this._dependencyResolver.put('controller', new pip_services3_commons_node_1.Descriptor('iqs-services-eventgeneration', 'controller', 'default', '*', '1.0'));
    }
}
exports.EventGenerationHttpServiceV1 = EventGenerationHttpServiceV1;
//# sourceMappingURL=EventGenerationHttpServiceV1.js.map