import { ConfigParams } from 'pip-services3-commons-node';

import { EventGenerationFilePersistence } from '../../src/persistence/EventGenerationFilePersistence';
import { EventGenerationPersistenceFixture } from './EventGenerationPersistenceFixture';

suite('EventGenerationFilePersistence', ()=> {
    let persistence: EventGenerationFilePersistence;
    let fixture: EventGenerationPersistenceFixture;
    
    setup((done) => {
        persistence = new EventGenerationFilePersistence('./data/event_generation.test.json');

        fixture = new EventGenerationPersistenceFixture(persistence);

        persistence.open(null, (err) => {
            persistence.clear(null, done);
        });
    });
    
    teardown((done) => {
        persistence.close(null, done);
    });
        
    test('Get and update event generation', (done) => {
        fixture.testGetAndUpdateEventGeneration(done);
    });

});