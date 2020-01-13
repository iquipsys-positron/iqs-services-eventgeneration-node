"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
class EventGenerationZoneV1Schema extends pip_services3_commons_node_1.ObjectSchema {
    constructor() {
        super();
        this.withRequiredProperty('zone_id', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('duration', pip_services3_commons_node_2.TypeCode.Float);
        this.withOptionalProperty('entered', pip_services3_commons_node_2.TypeCode.Boolean);
        this.withOptionalProperty('exited', pip_services3_commons_node_2.TypeCode.Boolean);
    }
}
exports.EventGenerationZoneV1Schema = EventGenerationZoneV1Schema;
//# sourceMappingURL=EventGenerationZoneV1Schema.js.map