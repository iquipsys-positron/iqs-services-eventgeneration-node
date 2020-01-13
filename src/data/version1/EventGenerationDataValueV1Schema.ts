import { ObjectSchema } from 'pip-services3-commons-node';
import { TypeCode } from 'pip-services3-commons-node';

export class EventGenerationDataValueV1Schema extends ObjectSchema {
    public constructor() {
        super();
        this.withRequiredProperty('id', TypeCode.Integer);
        this.withRequiredProperty('typ', TypeCode.Integer);
        this.withRequiredProperty('val', TypeCode.Float);
    }
}
