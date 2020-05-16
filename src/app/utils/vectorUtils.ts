import { V2 } from '../model/V2';

export function add (a: V2, b: V2): V2{return {x: a.x + b.x, y: a.y + b.y};}
export function sub(a: V2, b: V2): V2{return {x: a.x - b.x, y: a.y - b.y};}
export function mul(a: V2, valeur: number): V2{return {x: a.x * valeur, y: a.y * valeur};}
export function div(a: V2, valeur: number): V2{return {x: a.x / valeur, y: a.y / valeur};}
export function mag(a: V2) : number{return Math.sqrt(a.x*a.x + a.y*a.y);}
export function nor(a: V2): V2{
    let magnitude: number = mag(a);
    return div(a,magnitude);
}
