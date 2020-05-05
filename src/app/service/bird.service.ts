import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { BIRDS_DATA } from 'src/assets/data/birdsData';

@Injectable({
  providedIn: 'root'
})
export class BirdService {

  constructor(private http: HttpClient) { }

  getBirds(): Observable<any>{
    return of(BIRDS_DATA); 
    // return this.http.get('/assets/data/birds.json');
  }
}
