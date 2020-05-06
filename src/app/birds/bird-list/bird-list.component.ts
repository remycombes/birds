import { Component, OnInit, Input } from '@angular/core';
import { Subject, Observable, merge } from 'rxjs';
import { BirdCollection } from 'src/app/model/BirdCollection';
import { Library } from 'src/app/model/Library';
import { scan, map } from 'rxjs/operators';
import { Bird } from 'src/app/model/Bird';
import { FormControl } from '@angular/forms';

/////////////////////////////////////////////////////////////////////////////////////////
// SETTINGS /////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////
// LIBRARY ACTIONS TYPES ////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
enum LibraryActionTypes {
  ADD_BIRDS = 'Add birds', 
  SELECT_BIRD = 'Select bird', 
  SEARCH_BIRD = 'Search bird'
};

class AddBirdsAction{ readonly type = LibraryActionTypes.ADD_BIRDS; constructor(public payload: {[key: string]: Bird}){} }
class SelectBirdAction{ readonly type = LibraryActionTypes.SELECT_BIRD; constructor(public payload: string){} }
class SearchBirdAction{ readonly type = LibraryActionTypes.SEARCH_BIRD; constructor(public payload: string){} }

type LibraryActions = AddBirdsAction | SelectBirdAction | SearchBirdAction; 

/////////////////////////////////////////////////////////////////////////////////////////
// COMPONENT ////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
@Component({
  selector: 'app-bird-list',
  templateUrl: './bird-list.component.html'
})
export class BirdListComponent implements OnInit {

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // INPUTS ////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  @Input() birds: any; 

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // LIBRARY INTERFACES ////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  addBirds$: Subject<BirdCollection> = new Subject();   
  selectBird$: Subject<string> = new Subject(); 
  searchBird$: Subject<string> = new Subject(); 

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // LIBRARY ACTIONS ///////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  addBirdsAction$ : Observable<AddBirdsAction> = this.addBirds$.pipe( map((birds)=>{return new AddBirdsAction(birds)}) );
  selectBirdAction$: Observable<SelectBirdAction> = this.selectBird$.pipe( map(key=>{return new SelectBirdAction(key)}) );
  searchBirdAction$: Observable<SearchBirdAction> = this.searchBird$.pipe( map(value=>{return new SearchBirdAction(value)}));
  libraryActions$: Observable<LibraryActions> = merge(
    this.addBirdsAction$, 
    this.selectBirdAction$, 
    this.searchBirdAction$
  );


  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // REDUCER ///////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  library$: Observable<Library> = this.libraryActions$.pipe(
    scan(
      (acc : Library, curr: LibraryActions)=>{
        let libraryCopy = JSON.parse(JSON.stringify(acc));        
        switch(curr.type){
          
          ///////////////////////////////////////////////////////////////////////////
          // ADD BIRDS  /////////////////////////////////////////////////////////////
          ///////////////////////////////////////////////////////////////////////////
          case LibraryActionTypes.ADD_BIRDS:
            libraryCopy.birds = curr.payload;            
            libraryCopy.positions = []; 
            let birds = libraryCopy.birds; 
            let phylo: any = {}; 
            for (let key of Object.keys(birds)){
              if(phylo[birds[key].order] == undefined) {phylo[birds[key].order] = {}; }
              if(phylo[birds[key].order][birds[key].family] == undefined) {phylo[birds[key].order][birds[key].family] = {}; }
              phylo[birds[key].order][birds[key].family][birds[key].genus+birds[key].species]={
                key: key, 
                name: birds[key].name,
                genus: birds[key].genus,
                species: birds[key].species, 
                img: birds[key].genus.toLocaleLowerCase() + birds[key].species.charAt(0).toUpperCase() + birds[key].species.slice(1) + '.jpg'
              }; 
            }
            libraryCopy.phylo = phylo;
            return libraryCopy; 
          ///////////////////////////////////////////////////////////////////////////
          // ADD BIRDS  /////////////////////////////////////////////////////////////
          ///////////////////////////////////////////////////////////////////////////
          case LibraryActionTypes.SELECT_BIRD:
            libraryCopy.current = curr.payload; 
            return {...acc, current: curr.payload};
          ///////////////////////////////////////////////////////////////////////////
          // ADD BIRDS  /////////////////////////////////////////////////////////////
          ///////////////////////////////////////////////////////////////////////////
          case LibraryActionTypes.SEARCH_BIRD:            
            libraryCopy.searchString = curr.payload.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            libraryCopy.searchedBirds = [];
            let number = 0;
            if(libraryCopy.searchString!=''){
              for(let key of Object.keys(libraryCopy.birds)){
                let normalisedName = libraryCopy.birds[key].name.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                if(normalisedName.indexOf(libraryCopy.searchString)!= -1){
                  libraryCopy.searchedBirds.push(key); 
                  number++; 
                }              
                if(number>=10){break;}
              }
            }
            return {...acc, searchString: libraryCopy.searchString, searchedBirds: libraryCopy.searchedBirds};
          default: return ; 
        }
      }, 
      {
        birds: {},  
        phylo: {}, 
        available: {    
          orders: {}, 
          families: {}, 
          genus: {}, 
          species: {}
        }, 
        current: "", 
        searchString: "", 
        searchedBirds: []
      }
      )
    );   


  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // DISPLAYED DATA ////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  library: Library; 
  search= new FormControl(''); 

  constructor() { }

  ngOnInit(): void {
    this.library$.subscribe(
      library=>this.library = library
    ); 

    this.addBirds$.next(this.birds);

    this.search.valueChanges.subscribe(
      value=>{
        this.searchBird$.next(value); 
      }
    ); 
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // METHODS ///////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////

  deselectBird(){
    this.selectBird$.next(''); 
  }

  selectBirdInLibrary(genus: string, species: string){
    this.selectBird$.next(genus + '_' + species); 
  }  

  searchBird(value: string){    
    this.searchBird$.next(value);
  }

  scrollTo(elementId: string) {    
    this.search.setValue(''); 

    var list = document.getElementById('list');    
    var species = document.getElementById(elementId);
    var familySpecies = species.parentElement; 

    list.scrollTo({
      top: species.offsetTop + familySpecies.offsetTop,
      behavior: 'auto'
    });
  }

}
