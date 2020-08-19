import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { ORDERS, FAMILIES, SPECIES } from 'src/assets/data/birdsData';
import { ORDERS_POSITIONS, FAMILIES_POSITIONS, SPECIES_POSITIONS } from 'src/assets/data/mapData';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class BirdService {

  constructor(private http: HttpClient) { }

  getBirds(): Observable<any>{
    return this.http.get(environment.apiUrl+'/bird')
    .pipe(catchError((error: HttpErrorResponse)=>{return throwError('Erreur récupération oiseaux')}));; 
    // return of(null); 
  }

  addBird(bird: any): Observable<any>{
    return this.http.post(environment.apiUrl+'/bird', bird, httpOptions)
    .pipe(catchError((error: HttpErrorResponse)=>{return throwError('Erreur ajout oiseau')}));
  }

  deleteBird(identifier: any): Observable<any>{
    return this.http.delete(environment.apiUrl+'/bird/' + identifier)
    .pipe(catchError((error: HttpErrorResponse)=>{return throwError('Erreur suppression oiseau')}));
  }

  setBird(bird: any): Observable<any>{
    return this.http.put(environment.apiUrl+'/bird/' + bird.identifier, bird)
    .pipe(catchError((error: HttpErrorResponse)=>{return throwError('Erreur edition oiseau')}));
  }

  // getBirds(): Observable<any>{
  //   let birds: any = {
  //     orders: {}, 
  //     families: {}, 
  //     species: {}
  //   }; 

  //   for (let orderKey of Object.keys(ORDERS)){
  //     birds.orders[orderKey]={
  //       name: ORDERS[orderKey].name, 
  //       x: ORDERS_POSITIONS[orderKey][0], 
  //       y: ORDERS_POSITIONS[orderKey][1]
  //     };

  //     for (let familyKey of ORDERS[orderKey].families){
  //       birds.families[familyKey]={          
  //         name: FAMILIES[familyKey].name, 
  //         x: FAMILIES_POSITIONS[familyKey][0], 
  //         y: FAMILIES_POSITIONS[familyKey][1], 
  //         family: familyKey
  //       };

  //       for (let speciesKey of FAMILIES[familyKey].species){
  //         birds.species[speciesKey]={
  //           name: SPECIES[speciesKey].name, 
  //           x: SPECIES_POSITIONS[speciesKey][0], 
  //           y: SPECIES_POSITIONS[speciesKey][1], 
  //           family: familyKey, 
  //           order: orderKey, 
  //           img: SPECIES[speciesKey].img
  //       }
  //     }


  //     }

  //   }
  //   console.log(birds); 
    
  //   return of(birds); 
  // }
}
