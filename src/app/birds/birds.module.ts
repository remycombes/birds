import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BirdListComponent } from './bird-list/bird-list.component';
import { BirdQuizzComponent } from './bird-quizz/bird-quizz.component';
import { SharedModule } from '../shared/shared.module';
import { StatisticsComponent } from './statistics/statistics.component';



@NgModule({
  declarations: [BirdListComponent, BirdQuizzComponent, StatisticsComponent],
  imports: [    
    CommonModule, 
    SharedModule
  ], 
  exports: [
    BirdListComponent, 
    BirdQuizzComponent, 
    StatisticsComponent
  ]
})
export class BirdsModule { }
