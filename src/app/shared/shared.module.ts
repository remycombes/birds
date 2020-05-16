import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CapitalFirstPipe } from './pipe/capital-first.pipe';
import { ReactiveFormsModule } from '@angular/forms';
import { TreeComponent } from './tree/tree.component';


@NgModule({
  declarations: [
    CapitalFirstPipe, 
    TreeComponent
  ],
  imports: [
    CommonModule, 
    ReactiveFormsModule
  ], 
  exports: [
    CapitalFirstPipe, 
    ReactiveFormsModule, 
    TreeComponent
  ]
})
export class SharedModule { }
