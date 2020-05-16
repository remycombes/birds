import { V2 } from "./V2";

export interface CameraMoveAction {
  vector: V2;
  type: string; // 'store', 'add', 'set',
}

export interface CameraZoomAction {
  value: number;
  type: string; // 'store', 'add', 'set',
}
