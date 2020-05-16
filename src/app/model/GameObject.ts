import { BoxCollider } from "./BoxCollider";
import { Transform } from "./Transform";

export interface GameObject {
    t: Transform; 
    sprite?: string; 
    collider?: BoxCollider;
}
