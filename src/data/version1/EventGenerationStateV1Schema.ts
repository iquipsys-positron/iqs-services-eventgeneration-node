import { ObjectSchema } from 'pip-services3-commons-node';
import { ArraySchema } from 'pip-services3-commons-node';
import { TypeCode } from 'pip-services3-commons-node';

import { EventGenerationZoneV1Schema } from './EventGenerationZoneV1Schema';
import { EventGenerationDataValueV1Schema } from './EventGenerationDataValueV1Schema';

export class EventGenerationStateV1Schema extends ObjectSchema {
    public constructor() {
        super();
        this.withRequiredProperty('org_id', TypeCode.String);
        this.withRequiredProperty('object_id', TypeCode.String);
        this.withOptionalProperty('assign_id', TypeCode.String);
        this.withOptionalProperty('device_id', TypeCode.String);
        this.withOptionalProperty('group_ids', new ArraySchema(TypeCode.String));
        this.withRequiredProperty('time', null); //TypeCode.DateTime);
        this.withOptionalProperty('lat', TypeCode.Float);
        this.withOptionalProperty('lng', TypeCode.Float);
        this.withOptionalProperty('alt', TypeCode.Float);
        this.withOptionalProperty('angle', TypeCode.Float);
        this.withOptionalProperty('speed', TypeCode.Float);
        this.withOptionalProperty('expected', TypeCode.Boolean);
        this.withOptionalProperty('connected', TypeCode.Boolean);
        this.withOptionalProperty('online', TypeCode.Float);
        this.withOptionalProperty('offline', TypeCode.Float);
        this.withOptionalProperty('freezed', TypeCode.Float);
        this.withOptionalProperty('immobile', TypeCode.Float);
        this.withOptionalProperty('pressed', TypeCode.Boolean);
        this.withOptionalProperty('long_pressed', TypeCode.Boolean);
        this.withOptionalProperty('power_changed', TypeCode.Boolean);

        this.withOptionalProperty('params', new ArraySchema(new EventGenerationDataValueV1Schema()));
        this.withOptionalProperty('events', new ArraySchema(new EventGenerationDataValueV1Schema()));
        this.withOptionalProperty('commands', new ArraySchema(new EventGenerationDataValueV1Schema()));
        this.withOptionalProperty('states', new ArraySchema(new EventGenerationDataValueV1Schema()));

        this.withOptionalProperty('zones', new ArraySchema(new EventGenerationZoneV1Schema()));
    }
}
