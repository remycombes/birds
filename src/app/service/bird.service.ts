import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BirdService {

  constructor(private http: HttpClient) { }

  getBirds(): Observable<any>{
    return this.http.get('/assets/data/birds.json'); 

  }
}
