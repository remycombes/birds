import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { StatService } from '../service/stat.service';
import { BirdService } from '../service/bird.service';

@NgModule({  
  imports: [ CommonModule,  HttpClientModule], 
  providers: [ BirdService, StatService ], 
})
export class CoreModule { }
