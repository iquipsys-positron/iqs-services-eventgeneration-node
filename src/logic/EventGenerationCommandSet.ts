import { CommandSet } from 'pip-services3-commons-node';
import { ICommand } from 'pip-services3-commons-node';
import { Command } from 'pip-services3-commons-node';
import { Schema } from 'pip-services3-commons-node';
import { Parameters } from 'pip-services3-commons-node';
import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { ObjectSchema } from 'pip-services3-commons-node';
import { ArraySchema } from 'pip-services3-commons-node';
import { TypeCode } from 'pip-services3-commons-node';
import { FilterParamsSchema } from 'pip-services3-commons-node';
import { PagingParamsSchema } from 'pip-services3-commons-node';
import { DateTimeConverter } from 'pip-services3-commons-node';

import { EventGenerationStateV1Schema } from '../data/version1/EventGenerationStateV1Schema';
import { IEventGenerationController } from './IEventGenerationController';

export class EventGenerationCommandSet extends CommandSet {
    private _logic: IEventGenerationController;

    constructor(logic: IEventGenerationController) {
        super();

        this._logic = logic;

        // Register commands to the database
		this.addCommand(this.makeGenerateEventsForStateCommand());
		this.addCommand(this.makeGenerateEventsForStatesCommand());
    }

	private makeGenerateEventsForStateCommand(): ICommand {
		return new Command(
			"generate_events_for_state",
			new ObjectSchema(true)
				.withRequiredProperty('state', new EventGenerationStateV1Schema()),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let state = args.get("state");
				state.time = DateTimeConverter.toNullableDateTime(state.time);
                this._logic.generateEventsForState(correlationId, state, callback);
            }
		);
	}

	private makeGenerateEventsForStatesCommand(): ICommand {
		return new Command(
			"generate_events_for_states",
			new ObjectSchema(true)
				.withRequiredProperty('states', new ArraySchema(new EventGenerationStateV1Schema())),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let states = args.get("states");
                for (let state of states) {
                    state.time = DateTimeConverter.toNullableDateTime(state.time);
                }
                this._logic.generateEventsForStates(correlationId, states, callback);
            }
		);
	}
    
}