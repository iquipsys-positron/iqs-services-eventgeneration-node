import { CommandSet } from 'pip-services3-commons-node';
import { IEventGenerationController } from './IEventGenerationController';
export declare class EventGenerationCommandSet extends CommandSet {
    private _logic;
    constructor(logic: IEventGenerationController);
    private makeGenerateEventsForStateCommand;
    private makeGenerateEventsForStatesCommand;
}
