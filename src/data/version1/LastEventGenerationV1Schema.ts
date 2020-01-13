import { ObjectSchema } from 'pip-services3-commons-node';
import { ArraySchema } from 'pip-services3-commons-node';
import { TypeCode } from 'pip-services3-commons-node';

export class LastEventGenerationV1Schema extends ObjectSchema {
    public constructor() {
        super();
        this.withOptionalProperty('id', TypeCode.String);
        this.withRequiredProperty('org_id', TypeCode.String);
        this.withRequiredProperty('rule_id', TypeCode.String);
        this.withRequiredProperty('object_id', TypeCode.String);
        this.withOptionalProperty('time', null); //TypeCode.DateTime);
    }
}
