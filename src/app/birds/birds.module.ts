import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BirdListComponent } from './bird-list/bird-list.component';
import { BirdQuizzComponent } from './bird-quizz/bird-quizz.component';
import { SharedModule } from '../shared/shared.module';
import { StatisticsComponent } from './statistics/statistics.component';
import { MapComponent } from './map/map.component';



@NgModule({
  declarations: [BirdListComponent, BirdQuizzComponent, StatisticsComponent, MapComponent],
  imports: [    
    CommonModule, 
    SharedModule
  ], 
  exports: [
    BirdListComponent, 
    BirdQuizzComponent, 
    StatisticsComponent, 
    MapComponent
  ]
})
export class BirdsModule { }
