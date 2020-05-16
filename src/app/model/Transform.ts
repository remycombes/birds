import { V2 } from "./V2";

export interface Transform {
    pos: V2;  
    sca: V2;            // Size (w,h)
    rot: number;        // Rotation in degrees
}
