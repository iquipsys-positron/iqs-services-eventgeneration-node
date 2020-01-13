"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
class EventGenerationDataValueV1Schema extends pip_services3_commons_node_1.ObjectSchema {
    constructor() {
        super();
        this.withRequiredProperty('id', pip_services3_commons_node_2.TypeCode.Integer);
        this.withRequiredProperty('typ', pip_services3_commons_node_2.TypeCode.Integer);
        this.withRequiredProperty('val', pip_services3_commons_node_2.TypeCode.Float);
    }
}
exports.EventGenerationDataValueV1Schema = EventGenerationDataValueV1Schema;
//# sourceMappingURL=EventGenerationDataValueV1Schema.js.map