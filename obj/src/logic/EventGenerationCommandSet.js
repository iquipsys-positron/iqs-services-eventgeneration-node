"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const pip_services3_commons_node_4 = require("pip-services3-commons-node");
const pip_services3_commons_node_5 = require("pip-services3-commons-node");
const EventGenerationStateV1Schema_1 = require("../data/version1/EventGenerationStateV1Schema");
class EventGenerationCommandSet extends pip_services3_commons_node_1.CommandSet {
    constructor(logic) {
        super();
        this._logic = logic;
        // Register commands to the database
        this.addCommand(this.makeGenerateEventsForStateCommand());
        this.addCommand(this.makeGenerateEventsForStatesCommand());
    }
    makeGenerateEventsForStateCommand() {
        return new pip_services3_commons_node_2.Command("generate_events_for_state", new pip_services3_commons_node_3.ObjectSchema(true)
            .withRequiredProperty('state', new EventGenerationStateV1Schema_1.EventGenerationStateV1Schema()), (correlationId, args, callback) => {
            let state = args.get("state");
            state.time = pip_services3_commons_node_5.DateTimeConverter.toNullableDateTime(state.time);
            this._logic.generateEventsForState(correlationId, state, callback);
        });
    }
    makeGenerateEventsForStatesCommand() {
        return new pip_services3_commons_node_2.Command("generate_events_for_states", new pip_services3_commons_node_3.ObjectSchema(true)
            .withRequiredProperty('states', new pip_services3_commons_node_4.ArraySchema(new EventGenerationStateV1Schema_1.EventGenerationStateV1Schema())), (correlationId, args, callback) => {
            let states = args.get("states");
            for (let state of states) {
                state.time = pip_services3_commons_node_5.DateTimeConverter.toNullableDateTime(state.time);
            }
            this._logic.generateEventsForStates(correlationId, states, callback);
        });
    }
}
exports.EventGenerationCommandSet = EventGenerationCommandSet;
//# sourceMappingURL=EventGenerationCommandSet.js.map