import { Component, OnInit, OnDestroy } from "@angular/core";
import { TreeService } from "src/app/service/tree.service";
import { Observable, combineLatest, BehaviorSubject, Subscription, fromEvent, merge, of, zip, interval, animationFrameScheduler, Subject } from "rxjs";

import { map, scan, filter, withLatestFrom, pluck, throttleTime, tap, takeUntil } from "rxjs/operators";

// import { CameraMove } from "src/class/CameraMove";
import { CameraService } from "src/app/service/camera.service";
import { ControlService, GameMouseEvent } from "src/app/service/control.service";
import { Game } from 'src/app/model/Game';
import { V2 } from 'src/app/model/V2';


// SETTINGS
const CAMERA_INIT_POSITION: V2 = {x: 15,y: 15};
const ZOOM_PACE: number = 15; 

interface Debug{
  mousePos: boolean, 
  cameraPos: boolean, 
  viewBox: boolean,
  fps: boolean
}

const DEFAULT_DEBUG: Debug = {
  mousePos: true, 
  cameraPos: true, 
  viewBox: true,
  fps: true
}

@Component({
  selector: "app-tree",
  templateUrl: "./tree.component.html",
  styleUrls: ["./tree.component.scss"]
})
export class TreeComponent implements OnInit, OnDestroy {
  game: Game = {
    screenSize: {x:window.innerWidth, y:window.innerHeight}, 
    data: {
      tree: {
        nodes: null, 
        links: [], 
        selectedNode: null
      }
    }, 
    camera: {
      t: {
        pos: {x:0, y:0},
        sca: null,
        rot: null
      }, 
      size: 15
    }, 
    ui: null
  }; 
  destroy$ : Subject<boolean> = new Subject(); 


  // TICKER ////////////////////////////////////////////////////////////
  ticker$ = interval(17, animationFrameScheduler)
    .pipe(
      map(()=>({time: Date.now(), deltaTime: null})), 
      scan((previous, current)=>({time: current.time, deltaTime: (current.time - previous.time)/1000}))
    );  

  fps$ : Observable<number> = this.ticker$.pipe(
    pluck('deltaTime'), 
    map((deltaTime: number)=>Math.floor(1/deltaTime)),
    throttleTime(500)
  ); 
  
  // GAME ////////////////////////////////////////////////////////////
  game$: Observable<Game> = combineLatest(
    this.controlService.resize$,
    this.treeService.tree$,
    this.cameraService.camera$,
    (displayArea, tree, camera) => {
      // console.log(displayArea, tree, camera); 
      return {      
        screenSize: displayArea,
        data: { tree: tree },
        camera: camera,
        ui: null
    }}
  );


  constructor(
    private treeService: TreeService, 
    private cameraService: CameraService, 
    private controlService: ControlService
    ) {}

  ngOnInit() {
    this.cameraService.setCameraUnitPosition$.next({x: 15, y: 15}); 

    this.controlService.drag$.pipe(takeUntil(this.destroy$)).subscribe(
      (data: GameMouseEvent)=>{
        if(data==null){
          console.log('data null'); 
          this.cameraService.recordCameraRawPosition$.next({x: 0, y: 0});
        }
        else{
          this.cameraService.addCameraRawPosition$.next({x: -data.position.x, y: -data.position.y});
        }
      }
    );

    this.controlService.scroll$.pipe(takeUntil(this.destroy$)).subscribe(
      (event: MouseWheelEvent)=> this.cameraService.addCameraZoom$.next(event.deltaY>0?-ZOOM_PACE:ZOOM_PACE)
    ); 
    this.game$.pipe(takeUntil(this.destroy$)).subscribe(game=> this.game=game); 
  }


  ngOnDestroy() {
    this.destroy$.next(true);
  }


  addNode(){
    this.treeService.addTreeNode$.next({id: 'pouet' + Math.floor(Math.random() * Math.floor(15)), x: Math.floor(Math.random() * Math.floor(15)), y: Math.floor(Math.random() * Math.floor(15)), skin: 'robot'})
  }

  getPosition(event: MouseEvent): V2{
    return {
      x: this.game.camera.t.pos.x - ((window.innerWidth / 2) - event.x) / this.game.camera.size, 
      y: this.game.camera.t.pos.y - ((window.innerHeight / 2) - event.y) / this.game.camera.size
    }
  }

  getViewBox(): string{
    return (this.game.camera.t.pos.x - (this.game.screenSize.x/this.game.camera.size) / 2) + ' ' +
    (this.game.camera.t.pos.y - (this.game.screenSize.y/this.game.camera.size) / 2) + ' ' +
    (this.game.screenSize.x / this.game.camera.size) + ' ' +
    (this.game.screenSize.y / this.game.camera.size)
  }
}
