import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject, Subject, merge, combineLatest, fromEvent } from "rxjs";
import { map, scan, startWith } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { V2 } from '../model/V2';

export interface GameMouseEvent{
    type: string, 
    target: SVGElement, 
    position: V2
}

@Injectable({
  providedIn: "root"
})
export class ControlService {

    // RESIZE ///////////////////////////////////////////////////////////////////////////////////////////
    public resize$: Observable<V2> = merge(fromEvent(window, "load"),fromEvent(window, "resize")).pipe(
        map(() => ({x: Math.floor(window.innerWidth - 1),y: Math.floor(window.innerHeight - 1)})));

    // SCROLL ///////////////////////////////////////////////////////////////////////////////////////////
    public scroll$: Observable<Event> = fromEvent(document, "mousewheel");

    // MOUSE ///////////////////////////////////////////////////////////////////////////////////////////
    public click$: Observable<GameMouseEvent> = fromEvent(window, 'click').pipe(
        map((mouseclick: MouseEvent)=>{
            return {
                type: 'click', 
                target:<SVGElement>mouseclick.target, 
                position: {x: mouseclick.x, y: mouseclick.y}
            }
        })
    )

    public mouseup$: Observable<GameMouseEvent> = fromEvent(window, 'touchend').pipe(
        map((mouseup: TouchEvent)=>{
            console.log(mouseup); 
            return {
                type: 'mouseup', 
                target:<SVGElement>mouseup.target, 
                position: {x: mouseup.changedTouches[0].clientX, y: mouseup.changedTouches[0].clientY}
            }
        })
    )

    public mousedown$: Observable<GameMouseEvent> = fromEvent(window, 'touchstart').pipe(
        map((mousedown: TouchEvent)=>{
            console.log(mousedown);
            return {
                type: 'mousedown', 
                target:<SVGElement>mousedown.target, 
                position: {x: mousedown.touches[0].clientX, y: mousedown.touches[0].clientY}
            }
        })
    )

    public mousemove$: Observable<GameMouseEvent> = fromEvent(window, 'touchmove').pipe(
        map((mousemove: TouchEvent)=>{
            return {
                type: 'move', 
                target:<SVGElement>mousemove.target, 
                position: {x: mousemove.touches[0].clientX, y: mousemove.touches[0].clientY}
            }
        })
    )

    public dragStart$: Observable<GameMouseEvent> = merge(this.mousedown$, this.mouseup$).pipe(
        map((event: GameMouseEvent)=>{
            if(event.type=='mousedown') return event; 
            else if(event.type=='mouseup') return null; 
        }), 
        startWith(null)
    );

    public drag$ : Observable<GameMouseEvent> = combineLatest(this.dragStart$, this.mousemove$).pipe(
        map(([start, current]: [GameMouseEvent, GameMouseEvent])=>{
            if(start){
                return {
                    type: 'drag', 
                    target: start.target, 
                    position: {x: current.position.x - start.position.x, y: current.position.y - start.position.y}
                }
            }
            // return null; 
        }), 

    ); 
    

}
