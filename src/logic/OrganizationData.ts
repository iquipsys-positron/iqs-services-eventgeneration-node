import { OrganizationV1 } from 'pip-clients-organizations-node';
import { EventRuleV1 } from 'iqs-clients-eventrules-node';

export class OrganizationData {
    public org_id: string;

    public update_time: Date;
    public organization: OrganizationV1;
    public rules: EventRuleV1[];
}