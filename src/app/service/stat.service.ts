import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Statistics } from '../model/Statistics';

@Injectable({
  providedIn: 'root'
})
export class StatService {

  constructor(private http: HttpClient) { }

  getStats(): Observable<Statistics>{    
    console.log(JSON.parse(localStorage.getItem('stats'))); 
    return of(JSON.parse(localStorage.getItem('stats')));
  }

  setStats(stats: Statistics){
    localStorage.setItem('stats', JSON.stringify(stats)); 
  }

}
