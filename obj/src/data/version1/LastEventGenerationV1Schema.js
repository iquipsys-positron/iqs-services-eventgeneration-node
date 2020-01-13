"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
class LastEventGenerationV1Schema extends pip_services3_commons_node_1.ObjectSchema {
    constructor() {
        super();
        this.withOptionalProperty('id', pip_services3_commons_node_2.TypeCode.String);
        this.withRequiredProperty('org_id', pip_services3_commons_node_2.TypeCode.String);
        this.withRequiredProperty('rule_id', pip_services3_commons_node_2.TypeCode.String);
        this.withRequiredProperty('object_id', pip_services3_commons_node_2.TypeCode.String);
        this.withOptionalProperty('time', null); //TypeCode.DateTime);
    }
}
exports.LastEventGenerationV1Schema = LastEventGenerationV1Schema;
//# sourceMappingURL=LastEventGenerationV1Schema.js.map