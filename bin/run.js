let EventGenerationProcess = require('../obj/src/container/EventGenerationProcess').EventGenerationProcess;

try {
    new EventGenerationProcess().run(process.argv);
} catch (ex) {
    console.error(ex);
}
