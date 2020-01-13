"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const EventGenerationZoneV1Schema_1 = require("./EventGenerationZoneV1Schema");
const EventGenerationDataValueV1Schema_1 = require("./EventGenerationDataValueV1Schema");
class EventGenerationStateV1Schema extends pip_services3_commons_node_1.ObjectSchema {
    constructor() {
        super();
        this.withRequiredProperty('org_id', pip_services3_commons_node_3.TypeCode.String);
        this.withRequiredProperty('object_id', pip_services3_commons_node_3.TypeCode.String);
        this.withOptionalProperty('assign_id', pip_services3_commons_node_3.TypeCode.String);
        this.withOptionalProperty('device_id', pip_services3_commons_node_3.TypeCode.String);
        this.withOptionalProperty('group_ids', new pip_services3_commons_node_2.ArraySchema(pip_services3_commons_node_3.TypeCode.String));
        this.withRequiredProperty('time', null); //TypeCode.DateTime);
        this.withOptionalProperty('lat', pip_services3_commons_node_3.TypeCode.Float);
        this.withOptionalProperty('lng', pip_services3_commons_node_3.TypeCode.Float);
        this.withOptionalProperty('alt', pip_services3_commons_node_3.TypeCode.Float);
        this.withOptionalProperty('angle', pip_services3_commons_node_3.TypeCode.Float);
        this.withOptionalProperty('speed', pip_services3_commons_node_3.TypeCode.Float);
        this.withOptionalProperty('expected', pip_services3_commons_node_3.TypeCode.Boolean);
        this.withOptionalProperty('connected', pip_services3_commons_node_3.TypeCode.Boolean);
        this.withOptionalProperty('online', pip_services3_commons_node_3.TypeCode.Float);
        this.withOptionalProperty('offline', pip_services3_commons_node_3.TypeCode.Float);
        this.withOptionalProperty('freezed', pip_services3_commons_node_3.TypeCode.Float);
        this.withOptionalProperty('immobile', pip_services3_commons_node_3.TypeCode.Float);
        this.withOptionalProperty('pressed', pip_services3_commons_node_3.TypeCode.Boolean);
        this.withOptionalProperty('long_pressed', pip_services3_commons_node_3.TypeCode.Boolean);
        this.withOptionalProperty('power_changed', pip_services3_commons_node_3.TypeCode.Boolean);
        this.withOptionalProperty('params', new pip_services3_commons_node_2.ArraySchema(new EventGenerationDataValueV1Schema_1.EventGenerationDataValueV1Schema()));
        this.withOptionalProperty('events', new pip_services3_commons_node_2.ArraySchema(new EventGenerationDataValueV1Schema_1.EventGenerationDataValueV1Schema()));
        this.withOptionalProperty('commands', new pip_services3_commons_node_2.ArraySchema(new EventGenerationDataValueV1Schema_1.EventGenerationDataValueV1Schema()));
        this.withOptionalProperty('states', new pip_services3_commons_node_2.ArraySchema(new EventGenerationDataValueV1Schema_1.EventGenerationDataValueV1Schema()));
        this.withOptionalProperty('zones', new pip_services3_commons_node_2.ArraySchema(new EventGenerationZoneV1Schema_1.EventGenerationZoneV1Schema()));
    }
}
exports.EventGenerationStateV1Schema = EventGenerationStateV1Schema;
//# sourceMappingURL=EventGenerationStateV1Schema.js.map