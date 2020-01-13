import { EventGenerationZoneV1 } from './EventGenerationZoneV1';
import { EventGenerationDataValueV1 } from './EventGenerationDataValueV1';
export declare class EventGenerationStateV1 {
    org_id: string;
    object_id: string;
    assign_id?: string;
    device_id?: string;
    group_ids?: string[];
    time: Date;
    lat?: number;
    lng?: number;
    alt?: number;
    angle?: number;
    speed?: number;
    expected?: boolean;
    connected?: boolean;
    online: number;
    offline: number;
    freezed: number;
    immobile: number;
    pressed?: boolean;
    long_pressed?: boolean;
    power_changed?: boolean;
    params?: EventGenerationDataValueV1[];
    events?: EventGenerationDataValueV1[];
    commands?: EventGenerationDataValueV1[];
    states?: EventGenerationDataValueV1[];
    zones?: EventGenerationZoneV1[];
}
