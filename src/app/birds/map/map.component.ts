import { Component, OnInit, Input } from '@angular/core';

import { fromEvent, Observable, merge, Subject } from 'rxjs';
import { map, scan, takeLast } from 'rxjs/operators';

interface V2{x: number; y: number}

interface Camera{
  position: V2; 
  storedPosition: V2; 
  zoom: number; 
  storedZoom: number; 
  mag: number; 
  storedMag: number; 
}

interface DragAction {
  fingers: number; 
  action: string; 
  0: {start: V2; end: V2;}  
  1: {start: V2; end: V2;}
}



@Component({
  selector: 'app-map',
  templateUrl: './map.component.html'
})
export class MapComponent implements OnInit {

  @Input() birds: any; 

  dragounet: any = null; 
  laMag: number= 0; 

  // debug
  log$ : Subject<string> = new Subject();
  logs$: Observable<string[]> = this.log$.pipe(
    scan((acc: string[], curr: string)=>{
      acc.push(curr); 
      return acc.slice(Math.max(0, acc.length - 5));
    },[])
  ); 

  // touch
  screenTouchStart$ : Subject<Event> = new Subject(); 
  screenTouchMove$ : Subject<Event> = new Subject(); 
  screenTouchEnd$ : Subject<Event> = new Subject();
  screenTouchEvents$ : Observable<Event> = merge(this.screenTouchStart$, this.screenTouchMove$, this.screenTouchEnd$);

  // world   

  drag$: Observable<DragAction> = this.screenTouchEvents$.pipe(
    scan((acc: DragAction, curr: TouchEvent)=>{
      let dragCopy = JSON.parse(JSON.stringify(acc));       
      dragCopy.fingers = curr.touches.length;       
      
      switch(curr.type){
        case 'touchstart' :
          if(dragCopy.fingers==1){
            dragCopy.action = 'moveStart'; 
            dragCopy[0] = {}; 
            dragCopy[1] = null; 
            dragCopy[0].start = {
              x:  curr.touches[0].clientX, 
              y: curr.touches[0].clientY}; 
            dragCopy[0].end = {
              x: curr.touches[0].clientX, 
              y: curr.touches[0].clientY}; 
          }
          if(dragCopy.fingers==2){
            dragCopy.action = 'zoomStart'; 
            dragCopy[0] = {}; 
            dragCopy[1] = {}; 
            dragCopy[0].start = {
              x: curr.touches[0].clientX, 
              y: curr.touches[0].clientY}; 
            dragCopy[0].end = {
              x: curr.touches[0].clientX, 
              y: curr.touches[0].clientY}; 
            dragCopy[1].start = {
              x: curr.touches[1].clientX, 
              y: curr.touches[1].clientY}; 
            dragCopy[1].end = {
              x: curr.touches[1].clientX, 
              y: curr.touches[1].clientY}; 
          }
          break; 
        case 'touchmove' :
          if(dragCopy.fingers==1){
            dragCopy.action = 'move'; 
            dragCopy[0].end = {x: curr.touches[0].clientX, y: curr.touches[0].clientY}
          }
          if(dragCopy.fingers==2){
            dragCopy.action = 'zoom'; 
            dragCopy[0].end = {
              x: curr.touches[0].clientX, 
              y: curr.touches[0].clientY}; 
            dragCopy[1].end = {
              x: curr.touches[1].clientX, 
              y: curr.touches[1].clientY}; 
          }
          break; 
        case 'touchend' : 
          if(dragCopy.fingers==0){
            dragCopy.action = 'moveEnd'; 
            dragCopy[0] = null; 
            dragCopy[1] = null; 
          }
          if(dragCopy.fingers==1){
            dragCopy.action = 'zoomEnd'; 
            dragCopy[0] = {}; dragCopy[1] = null; 
            dragCopy[0].start = {x: curr.touches[0].clientX, y: curr.touches[0].clientY}
          }
          if(dragCopy.fingers==2){
            dragCopy.action = 'zoomStart'; 
            dragCopy[0] = {}; dragCopy[1] = {}; 
            dragCopy[0].start = {x: curr.touches[0].clientX, y: curr.touches[0].clientY}; 
            dragCopy[1].start = {x: curr.touches[1].clientX, y: curr.touches[1].clientY}; 
          }
          break;           
        default: break 
      }      
      this.dragounet = dragCopy; 
      return dragCopy; 
    }, {
      fingers: 0, 
      action: 'nothing', 
      0: null, 
      1: null
    })
  ); 

  camera$: Observable<any> = this.drag$.pipe(
    scan((acc: Camera, curr: DragAction)=>{
      let cam : Camera = JSON.parse(JSON.stringify(acc)); 
      let newPosition: V2; 
      switch(curr.action){
        case 'moveStart': 
          newPosition = JSON.parse(JSON.stringify(acc.position)); 
          cam = {
            position: newPosition, 
            storedPosition: {x: 0, y: 0}, 
            zoom: acc.zoom, 
            storedZoom: acc.storedZoom, 
            mag: acc.mag, 
            storedMag: acc.storedMag
          }; 
          break;         
        case 'move': 
          newPosition = JSON.parse(JSON.stringify(acc.position)); 
          cam = {
            position: newPosition, 
            storedPosition: {x: (curr[0].end.x - curr[0].start.x) / acc.zoom, y: (curr[0].end.y - curr[0].start.y) / acc.zoom}, 
            zoom: acc.zoom, 
            storedZoom: acc.storedZoom, 
            mag: acc.mag, 
            storedMag: acc.storedMag
          }; 
          break; 
        case 'moveEnd': 
          newPosition = JSON.parse(JSON.stringify({x: acc.position.x + acc.storedPosition.x, y: acc.position.y + acc.storedPosition.y})); 
          cam = {
            position: newPosition, 
            storedPosition: {x: 0, y: 0}, 
            zoom: acc.zoom, 
            storedZoom: acc.storedZoom, 
            mag: acc.mag, 
            storedMag: acc.storedMag
          }; 
          break; 

        case 'zoomStart':          
          let screenZoomVectorStart: V2 = {
            x: (curr[1].start.x ) - (curr[0].start.x ), 
            y: (curr[1].start.y ) - (curr[0].start.y ), 
          }; 
          cam = {
            position: {x: acc.position.x + acc.storedPosition.x, y: acc.position.y + acc.storedPosition.y}, 
            storedPosition: {x: 0, y: 0}, 
            zoom: acc.zoom, 
            storedZoom: acc.zoom, 
            mag: Math.sqrt(screenZoomVectorStart.x * screenZoomVectorStart.x + screenZoomVectorStart.y * screenZoomVectorStart.y), 
            storedMag: Math.sqrt(screenZoomVectorStart.x * screenZoomVectorStart.x + screenZoomVectorStart.y * screenZoomVectorStart.y), 
          }; 
          break;
        case 'zoom': 
          let screenZoomVector: V2 = {
            x: curr[1].end.x  - curr[0].end.x , 
            y: curr[1].end.y  - curr[0].end.y , 
          }; 
          let positionVector: V2 = {
            x: ((curr[0].end.x - curr[0].start.x) / 2 + (curr[1].end.x - curr[1].start.x) / 2) / acc.zoom, 
            y: ((curr[0].end.y - curr[0].start.y) / 2 + (curr[1].end.y - curr[1].start.y) / 2) / acc.zoom 
          }
          let newMag = Math.sqrt(screenZoomVector.x * screenZoomVector.x + screenZoomVector.y * screenZoomVector.y); 
          
          cam = {
            position: acc.position, 
            storedPosition: positionVector, 
            zoom: acc.storedZoom * (newMag / acc.storedMag), 
            storedZoom: acc.storedZoom, 
            mag: newMag, 
            storedMag: acc.storedMag
          }; 
          break;           
          
        
        case 'zoomEnd': 
        newPosition = JSON.parse(JSON.stringify({x: acc.position.x + acc.storedPosition.x, y: acc.position.y + acc.storedPosition.y})); 
        cam = {
          position: newPosition, 
          storedPosition: {x: 0, y: 0}, 
          zoom: acc.zoom, 
          storedZoom: acc.storedZoom, 
          mag: 1, 
          storedMag: 1
        }; 
        break; 
      }
      return cam
    }, {
      position: {x: 0, y: 0}, 
      storedPosition: {x: 0, y: 0}, 
      zoom: 2, 
      storedZoom: 2, 
      mag: 1,
      storedMag: 1
    })
  ); 

  camera: Camera = {
    position: {x: 0, y: 0}, 
    storedPosition: {x: 0, y: 0}, 
    zoom: 2, 
    storedZoom: 2, 
    mag: 1,
    storedMag: 1 
  }; 

  // worldTouchEvents$ : Observable<Event> = this.screenTouchEvents$.pipe(map(
    
  // )); 


  // camera: Camera = {
  //   position: {x: 0, y: 0}, 
  //   scale: 1
  // }

  ngOnInit(){    
    // this.drag$.subscribe();
    this.camera$.subscribe(
      data=>{
        this.camera = data; 
      }
    ); 
  }

  screenToWorld(screen: V2, zoom: number, position: V2): V2{
    console.log({x: screen.x - position.x / zoom, y: screen.y - position.y / zoom}); 
    return {x: screen.x - position.x / zoom, y: screen.y - position.y / zoom}; 
  }

  // worldToScreen(worldX: number, worldY: number): V2{
  //   return {x: worldX - this., y: 0}
  // }
  



  // @Input() birds: any; 

  // storedPosition: V2 = {x: 0, y: 0 };
  // initMagnitude: number = 1; 
  // currentMagnitude: number = 1; 

  // touch1: {
  //   start: V2, 
  //   end: V2
  // } = null; 

  // touch2: {
  //   start: V2, 
  //   end: V2
  // } = null;   
  
  // zoom: number = 1; 

  // event: TouchEvent; 

  // constructor() { }

  // ngOnInit(): void {
  // }

  // touchStart(event: TouchEvent){    
  //   if(event.touches.length==1){
  //     this.currentMagnitude = 1; 
  //     this.initMagnitude = 1; 

  //     this.savePosition(); 
  //     this.touch1 = {
  //       start: {x: event.touches[0].clientX, y: event.touches[0].clientY}, 
  //       end: {x: event.touches[0].clientX, y: event.touches[0].clientY}
  //     }
  //     this.touch2 = null; 
  //   }    
  //   if(event.touches.length==2){
  //     this.currentMagnitude = 1; 
  //     this.initMagnitude = 1; 
  //     this.savePosition(); 
  //     this.touch1 = {
  //       start: {x: event.touches[0].clientX, y: event.touches[0].clientY}, 
  //       end: {x: event.touches[0].clientX, y: event.touches[0].clientY}
  //     }; 
  //     this.touch2 = {
  //       start: {x: event.touches[1].clientX, y: event.touches[1].clientY}, 
  //       end: {x: event.touches[1].clientX, y: event.touches[1].clientY}
  //     }

  //     this.initMagnitude = Math.sqrt(
  //       (this.touch2.end.x - this.touch1.end.x) * (this.touch2.end.x - this.touch1.end.x) 
  //       + (this.touch2.end.y - this.touch1.end.y) * (this.touch2.end.y - this.touch1.end.y)
  //     );

  //     this.currentMagnitude = Math.sqrt(
  //       (this.touch2.end.x - this.touch1.end.x) * (this.touch2.end.x - this.touch1.end.x) 
  //       + (this.touch2.end.y - this.touch1.end.y) * (this.touch2.end.y - this.touch1.end.y)
  //     );
  //   }    
  // }

  // touchEnd(event: TouchEvent){    
  //   if(event.touches.length==0){
  //     this.savePosition(); 
  //     this.touch1 = null; 
  //     this.touch2 = null; 
  //     this.currentMagnitude = 1; 
  //     this.initMagnitude = 1; 
  //   }
  //   if(event.touches.length==1){
  //     this.savePosition(); 
  //     this.touch1 = {
  //       start: {x: event.touches[0].clientX, y: event.touches[0].clientY}, 
  //       end: {x: event.touches[0].clientX, y: event.touches[0].clientY}        
  //     }; 
  //     this.touch2 = null; 
  //     this.currentMagnitude = 1; 
  //     this.initMagnitude = 1; 
  //   }    
    
  // }

  // touchMove(event: TouchEvent){
  //   if(event.touches.length==1){
  //     this.touch1.end = {
  //       x: event.touches[0].clientX, 
  //       y: event.touches[0].clientY
  //     }
  //   }

  //   if(event.touches.length==2){      

  //     this.touch1.end = {
  //       x: event.touches[0].clientX, 
  //       y: event.touches[0].clientY
  //     }

  //     this.touch2.end = {
  //       x: event.touches[1].clientX, 
  //       y: event.touches[1].clientY
  //     }

  //     this.currentMagnitude = Math.sqrt(
  //       (this.touch2.end.x - this.touch1.end.x) * (this.touch2.end.x - this.touch1.end.x) 
  //       + (this.touch2.end.y - this.touch1.end.y) * (this.touch2.end.y - this.touch1.end.y)
  //     );
  //   }
  // }

  // getZoom(){
  //   if(this.initMagnitude == 1 && this.currentMagnitude==1){
  //     return this.zoom
  //   }else{
  //     return this.zoom * (this.currentMagnitude / this.initMagnitude); 
  //   }
  // }

  // position(): {x: number, y: number}{
  //   if(this.touch1!= null && this.touch2!=null){
  //     return {
  //       x: (this.storedPosition.x + ((this.touch1.end.x - this.touch1.start.x) + (this.touch2.end.x - this.touch2.start.x)) / 2), 
  //       y: (this.storedPosition.y + ((this.touch1.end.y - this.touch1.start.y) + (this.touch2.end.y - this.touch2.start.y)) / 2), 
  //     }
  //   }
  //   if(this.touch1!= null && this.touch2==null){
  //     return {
  //       x: (this.storedPosition.x + (this.touch1.end.x - this.touch1.start.x)),
  //       y: (this.storedPosition.y + (this.touch1.end.y - this.touch1.start.y)) 
  //     }
  //   }
  //   else{
  //     return {
  //       x: this.storedPosition.x, 
  //       y: this.storedPosition.y
  //     }
  //   }    
  // }  

  // savePosition(){

  //   this.zoom = this.zoom * (this.currentMagnitude / this.initMagnitude); 

  //   if(this.touch1!=null && (this.touch2==null)){
  //     this.storedPosition = {
  //       x: this.storedPosition.x + (this.touch1.end.x - this.touch1.start.x), 
  //       y : this.storedPosition.y + (this.touch1.end.y - this.touch1.start.y)
  //     }
  //   }    

  //   if(this.touch1!=null && (this.touch2!=null)){
  //     this.storedPosition = {
  //       x: this.storedPosition.x + (((this.touch1.end.x - this.touch1.start.x) + (this.touch2.end.x - this.touch2.start.x)) / 2)/ this.getZoom(), 
  //       y: this.storedPosition.y + (((this.touch1.end.y - this.touch1.start.y) + (this.touch2.end.y - this.touch2.start.y)) / 2)/ this.getZoom()
  //     }
  //   }  
    
  // }

}
