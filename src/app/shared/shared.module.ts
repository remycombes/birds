import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CapitalFirstPipe } from './pipe/capital-first.pipe';
import { ReactiveFormsModule } from '@angular/forms';





@NgModule({
  declarations: [CapitalFirstPipe],
  imports: [
    CommonModule, 
    ReactiveFormsModule
  ], 
  exports: [
    CapitalFirstPipe, 
    ReactiveFormsModule
  ]
})
export class SharedModule { }
