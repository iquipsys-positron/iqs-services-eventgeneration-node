import { IStringIdentifiable } from 'pip-services3-commons-node';

export class LastEventGenerationV1 implements IStringIdentifiable {
    public id: string;
    public org_id: string;
    public rule_id: string;
    public object_id: string;
    public time: Date;
}