import { Factory } from 'pip-services3-components-node';
import { Descriptor } from 'pip-services3-commons-node';

import { EventGenerationMongoDbPersistence } from '../persistence/EventGenerationMongoDbPersistence';
import { EventGenerationFilePersistence } from '../persistence/EventGenerationFilePersistence';
import { EventGenerationMemoryPersistence } from '../persistence/EventGenerationMemoryPersistence';
import { EventGenerationController } from '../logic/EventGenerationController';
import { EventGenerationHttpServiceV1 } from '../services/version1/EventGenerationHttpServiceV1';

export class EventGenerationServiceFactory extends Factory {
	public static Descriptor = new Descriptor("iqs-services-eventgeneration", "factory", "default", "default", "1.0");
	public static MemoryPersistenceDescriptor = new Descriptor("iqs-services-eventgeneration", "persistence", "memory", "*", "1.0");
	public static FilePersistenceDescriptor = new Descriptor("iqs-services-eventgeneration", "persistence", "file", "*", "1.0");
	public static MongoDbPersistenceDescriptor = new Descriptor("iqs-services-eventgeneration", "persistence", "mongodb", "*", "1.0");
	public static ControllerDescriptor = new Descriptor("iqs-services-eventgeneration", "controller", "default", "*", "1.0");
	public static HttpServiceDescriptor = new Descriptor("iqs-services-eventgeneration", "service", "http", "*", "1.0");
	
	constructor() {
		super();
		this.registerAsType(EventGenerationServiceFactory.MemoryPersistenceDescriptor, EventGenerationMemoryPersistence);
		this.registerAsType(EventGenerationServiceFactory.FilePersistenceDescriptor, EventGenerationFilePersistence);
		this.registerAsType(EventGenerationServiceFactory.MongoDbPersistenceDescriptor, EventGenerationMongoDbPersistence);
		this.registerAsType(EventGenerationServiceFactory.ControllerDescriptor, EventGenerationController);
		this.registerAsType(EventGenerationServiceFactory.HttpServiceDescriptor, EventGenerationHttpServiceV1);
	}
	
}
