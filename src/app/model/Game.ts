import { Tree } from "./Tree";
import { Camera } from "./Camera";
import { V2 } from "./V2";

export interface Game {
    screenSize: V2;     
    data: {
        tree: Tree;
    }; 
    camera: Camera; 
    ui: {
        selection: string[]; 
    };     
}