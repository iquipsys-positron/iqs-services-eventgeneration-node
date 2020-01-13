import { ObjectSchema } from 'pip-services3-commons-node';
import { ArraySchema } from 'pip-services3-commons-node';
import { TypeCode } from 'pip-services3-commons-node';

export class EventGenerationZoneV1Schema extends ObjectSchema {
    public constructor() {
        super();
        this.withRequiredProperty('zone_id', TypeCode.String);
        this.withOptionalProperty('duration', TypeCode.Float);
        this.withOptionalProperty('entered', TypeCode.Boolean);
        this.withOptionalProperty('exited', TypeCode.Boolean);
    }
}
