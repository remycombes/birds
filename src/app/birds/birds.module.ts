import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BirdListComponent } from './bird-list/bird-list.component';
import { BirdQuizzComponent } from './bird-quizz/bird-quizz.component';
import { SharedModule } from '../shared/shared.module';



@NgModule({
  declarations: [BirdListComponent, BirdQuizzComponent],
  imports: [    
    CommonModule, 
    SharedModule
  ], 
  exports: [
    BirdListComponent, 
    BirdQuizzComponent

  ]
})
export class BirdsModule { }
