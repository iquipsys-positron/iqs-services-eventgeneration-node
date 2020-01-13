"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_components_node_1 = require("pip-services3-components-node");
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const EventGenerationMongoDbPersistence_1 = require("../persistence/EventGenerationMongoDbPersistence");
const EventGenerationFilePersistence_1 = require("../persistence/EventGenerationFilePersistence");
const EventGenerationMemoryPersistence_1 = require("../persistence/EventGenerationMemoryPersistence");
const EventGenerationController_1 = require("../logic/EventGenerationController");
const EventGenerationHttpServiceV1_1 = require("../services/version1/EventGenerationHttpServiceV1");
class EventGenerationServiceFactory extends pip_services3_components_node_1.Factory {
    constructor() {
        super();
        this.registerAsType(EventGenerationServiceFactory.MemoryPersistenceDescriptor, EventGenerationMemoryPersistence_1.EventGenerationMemoryPersistence);
        this.registerAsType(EventGenerationServiceFactory.FilePersistenceDescriptor, EventGenerationFilePersistence_1.EventGenerationFilePersistence);
        this.registerAsType(EventGenerationServiceFactory.MongoDbPersistenceDescriptor, EventGenerationMongoDbPersistence_1.EventGenerationMongoDbPersistence);
        this.registerAsType(EventGenerationServiceFactory.ControllerDescriptor, EventGenerationController_1.EventGenerationController);
        this.registerAsType(EventGenerationServiceFactory.HttpServiceDescriptor, EventGenerationHttpServiceV1_1.EventGenerationHttpServiceV1);
    }
}
exports.EventGenerationServiceFactory = EventGenerationServiceFactory;
EventGenerationServiceFactory.Descriptor = new pip_services3_commons_node_1.Descriptor("iqs-services-eventgeneration", "factory", "default", "default", "1.0");
EventGenerationServiceFactory.MemoryPersistenceDescriptor = new pip_services3_commons_node_1.Descriptor("iqs-services-eventgeneration", "persistence", "memory", "*", "1.0");
EventGenerationServiceFactory.FilePersistenceDescriptor = new pip_services3_commons_node_1.Descriptor("iqs-services-eventgeneration", "persistence", "file", "*", "1.0");
EventGenerationServiceFactory.MongoDbPersistenceDescriptor = new pip_services3_commons_node_1.Descriptor("iqs-services-eventgeneration", "persistence", "mongodb", "*", "1.0");
EventGenerationServiceFactory.ControllerDescriptor = new pip_services3_commons_node_1.Descriptor("iqs-services-eventgeneration", "controller", "default", "*", "1.0");
EventGenerationServiceFactory.HttpServiceDescriptor = new pip_services3_commons_node_1.Descriptor("iqs-services-eventgeneration", "service", "http", "*", "1.0");
//# sourceMappingURL=EventGenerationServiceFactory.js.map