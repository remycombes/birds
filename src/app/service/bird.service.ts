import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ORDERS, FAMILIES, SPECIES } from 'src/assets/data/birdsData';
import { ORDERS_POSITIONS, FAMILIES_POSITIONS, SPECIES_POSITIONS } from 'src/assets/data/mapData';

@Injectable({
  providedIn: 'root'
})
export class BirdService {

  constructor(private http: HttpClient) { }

  getBirds(): Observable<any>{
    let birds: any = {
      orders: {}
    }; 
    for (let orderKey of Object.keys(ORDERS)){
      for (let familyKey of ORDERS[orderKey].families){
        for(let speciesKey of FAMILIES[familyKey].species){
          if(birds.orders[orderKey]==undefined) 
            birds.orders[orderKey] = {name: ORDERS[orderKey].name, families: {} };
          if(birds.orders[orderKey].families[familyKey]==undefined) 
            birds.orders[orderKey].families[familyKey] = {name: FAMILIES[familyKey].name, species: {}}
          if(birds.orders[orderKey].families[familyKey].species[speciesKey]==undefined) 
            birds.orders[orderKey].families[familyKey].species[speciesKey] = {
              name: SPECIES[speciesKey].name, 
              x: ORDERS_POSITIONS[orderKey][0] + FAMILIES_POSITIONS[familyKey][0] + SPECIES_POSITIONS[speciesKey][0], 
              y: ORDERS_POSITIONS[orderKey][1] + FAMILIES_POSITIONS[familyKey][1] + SPECIES_POSITIONS[speciesKey][1], 
              img:SPECIES[speciesKey].img
            }
        }
      }
    }
    console.log(birds); 
    
    return of(birds); 
    // return this.http.get('/assets/data/birds.json');
  }
}
