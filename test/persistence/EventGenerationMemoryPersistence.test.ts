import { ConfigParams } from 'pip-services3-commons-node';

import { EventGenerationMemoryPersistence } from '../../src/persistence/EventGenerationMemoryPersistence';
import { EventGenerationPersistenceFixture } from './EventGenerationPersistenceFixture';

suite('EventGenerationMemoryPersistence', ()=> {
    let persistence: EventGenerationMemoryPersistence;
    let fixture: EventGenerationPersistenceFixture;
    
    setup((done) => {
        persistence = new EventGenerationMemoryPersistence();
        persistence.configure(new ConfigParams());
        
        fixture = new EventGenerationPersistenceFixture(persistence);
        
        persistence.open(null, done);
    });
    
    teardown((done) => {
        persistence.close(null, done);
    });
        
    test('Get and update event generation', (done) => {
        fixture.testGetAndUpdateEventGeneration(done);
    });

});