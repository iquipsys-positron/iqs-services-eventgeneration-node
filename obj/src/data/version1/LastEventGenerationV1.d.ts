import { IStringIdentifiable } from 'pip-services3-commons-node';
export declare class LastEventGenerationV1 implements IStringIdentifiable {
    id: string;
    org_id: string;
    rule_id: string;
    object_id: string;
    time: Date;
}
