import { Component, OnInit, AfterViewInit } from '@angular/core';
import { shuffle } from './utils/array'; 
import { Observable, Subject, merge } from 'rxjs';
import { map, scan } from "rxjs/operators";
import { BIRDS_DATA } from 'src/assets/data/birdsData';
import { Quizz } from './model/Quizz';
import { BirdCollection } from './model/BirdCollection';
import { Library } from './model/Library';
import { Bird } from './model/Bird';



/////////////////////////////////////////////////////////////////////////////////////////
// LIBRARY ACTIONS //////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
enum LibraryActionTypes {
  ADD_BIRDS = 'Add birds', 
  SELECT_BIRD = 'Select bird', 
  NEXT_BIRD = 'Next bird', 
  PREVIOUS_BIRD = 'Previous bird', 

};

class AddBirdsToLibraryAction{ readonly type = LibraryActionTypes.ADD_BIRDS; constructor(public payload: {[key: string]: Bird}){} }
class SelectBirdInLibraryAction{ readonly type = LibraryActionTypes.SELECT_BIRD; constructor(public payload: string){} }

type LibraryActions = AddBirdsToLibraryAction | SelectBirdInLibraryAction ; 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent{  
}
