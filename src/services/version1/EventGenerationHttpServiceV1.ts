import { Descriptor } from 'pip-services3-commons-node';
import { CommandableHttpService } from 'pip-services3-rpc-node';

export class EventGenerationHttpServiceV1 extends CommandableHttpService {
    public constructor() {
        super('v1/event_generation');
        this._dependencyResolver.put('controller', new Descriptor('iqs-services-eventgeneration', 'controller', 'default', '*', '1.0'));
    }
}