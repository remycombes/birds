import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, fromEvent, merge, combineLatest, Subject } from "rxjs";
import { filter, withLatestFrom, map, tap, scan, startWith } from "rxjs/operators";
import { V2 } from '../model/V2';
import { CameraZoomAction, CameraMoveAction } from '../model/CameraAction';
import { CameraPosition } from '../model/CameraPosition';
import { Camera } from '../model/Camera';

import * as VECTOR from "src/app/utils/vectorUtils";

const CAMERA_INIT_PIXEL_PER_UNIT: number = 30;

@Injectable({
  providedIn: "root"
})
export class CameraService {

  // INTERFACE ///////////////////////////////////////////////////////////////////  
  // position
  public setCameraUnitPosition$: BehaviorSubject<V2> = new BehaviorSubject({x: 0, y: 0});
  public addCameraRawPosition$: BehaviorSubject<V2> = new BehaviorSubject({x: 0, y: 0});
  public recordCameraRawPosition$: BehaviorSubject<V2> = new BehaviorSubject({x: 0, y: 0});
  // zoom
  public setCameraZoom$: BehaviorSubject<number> = new BehaviorSubject(15); 
  public addCameraZoom$: BehaviorSubject<number> = new BehaviorSubject(0);

  // CAMERA ZOOM 
  private cameraSetZoom$: Observable<CameraZoomAction> = this.setCameraZoom$.pipe(
    map((zoom: number)=>{return {value: zoom, type: 'set'}})
  ); 

  private cameraAddZoom$: Observable<CameraZoomAction> = this.addCameraZoom$.pipe(
    map((zoom: number)=>{return {value: zoom, type: 'add'}})
  ); 

  private cameraZoomActions$: Observable<CameraZoomAction> = merge(this.cameraSetZoom$, this.cameraAddZoom$);      

  cameraZoom$: Observable<number> = this.cameraZoomActions$.pipe(
    scan(
      (acc: number, cur: CameraZoomAction) => {
        switch(cur.type){
          case 'set' : return cur.value; 
          case 'add' : return Math.min(Math.max(acc + (acc * cur.value) / 100, 10), 300); 
          default: return 15; 
        }
      },15
    )
  );

  // CAMERA POSITION
  private cameraSetUnitPosition$: Observable<CameraMoveAction> = this.setCameraUnitPosition$.pipe(
    map((position: V2)=>({vector: {x: position.x, y: position.y}, type: 'set' }))
  );
  
  private cameraAddUnitPosition$: Observable<CameraMoveAction> = this.addCameraRawPosition$.pipe(    // = drag
    withLatestFrom(this.cameraZoom$),
    map(([position, zoom]: [V2, number])=>({vector: {x: (position.x/zoom), y: (position.y/zoom)}, type: 'add' }))
  ); 

  private cameraRecordUnitPosition$: Observable<CameraMoveAction> = this.recordCameraRawPosition$.pipe(  // = dragEnd
    withLatestFrom(this.cameraZoom$),
    map(([position, zoom]: [V2, number])=>({vector: {x: (position.x/zoom), y: (position.y/zoom)}, type: 'record' }))
  ); 

  private cameraMoveActions$: Observable<CameraMoveAction> = 
    merge(this.cameraSetUnitPosition$, this.cameraAddUnitPosition$, this.cameraRecordUnitPosition$);    
  
  private cameraPosition$: Observable<V2> = this.cameraMoveActions$
    .pipe(
      scan(
        (acc: CameraPosition, curr: CameraMoveAction) => {
          console.log(curr.type); 
          switch (curr.type) {
            case "set":     return { stored: curr.vector, current: { x: 0, y: 0 } };
            case "record":  return { stored: VECTOR.add(acc.stored, acc.current), current: { x: 0, y: 0 } };
            case "add":     return { stored: acc.stored, current: curr.vector };
            default:        return { stored: { x: 10, y: 10 }, current: { x: 0, y: 0 } };
          }
        },
        { stored: { x: 0, y: 0 }, current: { x: 0, y: 0 } }
      )
    )
    .pipe(
      map(data => {
        return VECTOR.add(data.current, data.stored);
      })
    );

  // CAMERA ////////////////////////////////////////////////////////////
  camera$: Observable<Camera> = combineLatest(
    this.cameraPosition$,
    this.cameraZoom$, 
    (position: V2, zoom: number) => {
      return {
        t: {
          pos: {x: position.x, y: position.y}, 
          sca: null, 
          rot: null
        },
        size: zoom,        
      };
    }
  );

  constructor() {}
}
