import { OrganizationV1 } from 'pip-clients-organizations-node';
import { EventRuleV1 } from 'iqs-clients-eventrules-node';
export declare class OrganizationData {
    org_id: string;
    update_time: Date;
    organization: OrganizationV1;
    rules: EventRuleV1[];
}
