import { Component, OnInit, AfterViewInit } from '@angular/core';
import { shuffle } from './utils/array'; 
import { Observable, Subject, merge } from 'rxjs';
import { map, scan } from "rxjs/operators";
import { BIRDS_DATA } from 'src/assets/data/birdsData';
import { Quizz } from './model/Quizz';
import { BirdCollection } from './model/BirdCollection';
import { Library } from './model/library';
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
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  // INIT VALUES
  
  
  // INTERFACES ///////////////////////////////////////////////////////////////////////////////////////////
  
  
  

  addBirdsToLibrary$: Subject<BirdCollection> = new Subject();   
  selectBirdInLibrary$: Subject<string> = new Subject(); 

  

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // LIBRARY ///////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////

  addBirdsToLibraryAction$ : Observable<AddBirdsToLibraryAction> = this.addBirdsToLibrary$.pipe( map((birds)=>{return new AddBirdsToLibraryAction(birds)}) );
  selectBirdInLibraryAction$: Observable<SelectBirdInLibraryAction> = this.selectBirdInLibrary$.pipe( map(key=>{return new SelectBirdInLibraryAction(key)}) );
  libraryActions$: Observable<LibraryActions> = merge(
    this.addBirdsToLibraryAction$, 
    this.selectBirdInLibraryAction$
  ); 

  library$: Observable<Library> = this.libraryActions$.pipe(
    scan(
      (acc : Library, curr: LibraryActions)=>{
        let libraryCopy = JSON.parse(JSON.stringify(acc));        
        switch(curr.type){
          ///////////////////////////////////////////////////////////////////////////
          // ADD BIRDS TO LIBRARY ///////////////////////////////////////////////////
          case LibraryActionTypes.ADD_BIRDS:
            libraryCopy.birds = curr.payload;            
            libraryCopy.positions = []; 
            let birds = libraryCopy.birds; 
            let phylo: any = {}; 
            for (let key of Object.keys(birds)){
              if(phylo[birds[key].order] == undefined) {phylo[birds[key].order] = {}; }
              if(phylo[birds[key].order][birds[key].family] == undefined) {phylo[birds[key].order][birds[key].family] = {}; }
              phylo[birds[key].order][birds[key].family][birds[key].genus+birds[key].species]={
                name: birds[key].name,
                genus: birds[key].genus,
                species: birds[key].species, 
                img: birds[key].genus.toLocaleLowerCase() + birds[key].species.charAt(0).toUpperCase() + birds[key].species.slice(1) + '.jpg'
              }; 
            }
            libraryCopy.phylo = phylo;
            return libraryCopy; 
          case LibraryActionTypes.SELECT_BIRD:
            libraryCopy.current = curr.payload; 
            return {...acc, current: curr.payload};
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
        current: ""
      }
      )
    );   

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // VIEWBOX ///////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  viewBox: string = "0 0 21 21"; 

  // DISPLAYED DATA //////////////////////////////////////////////////////////////////////
  rawBirds: BirdCollection = {}; 
  
  library: Library; 

  // NAVIGATION //////////////////////////////////////////////////////////////////////////
  page: string = "menu"; 
  fullScreen: boolean = false; 

  ////////////////////////////////////////////////////////////////////////////////////////
  // INIT ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ngOnInit(){
    

    this.library$.subscribe(
      library=>this.library = library
    ); 

    

    for(let bird of Object.keys(BIRDS_DATA)){
      this.rawBirds[bird]={        
        order: BIRDS_DATA[bird].order, 
        family: BIRDS_DATA[bird].family, 
        genus: BIRDS_DATA[bird].genus, 
        species: BIRDS_DATA[bird].species, 
        name: BIRDS_DATA[bird].name, 
        img: BIRDS_DATA[bird].genus + BIRDS_DATA[bird].species.charAt(0).toUpperCase() + BIRDS_DATA[bird].species.slice(1) + '.jpg'
      }
    }
    


    // for (let bird of BIRDS_DATA){
    //   let philogeny: string[] = bird.classification.split(' '); 

    //   this.rawBirds[philogeny[2].toLocaleLowerCase() + philogeny[3].charAt(0).toUpperCase() + philogeny[3].slice(1)] = {
    //     name: bird.name, 
    //     order: philogeny[0], 
    //     family: philogeny[1], 
    //     genus: philogeny[2], 
    //     species: philogeny[3], 
    //     img: philogeny[2].toLocaleLowerCase() + philogeny[3].charAt(0).toUpperCase() + philogeny[3].slice(1)+'.jpg'
    //   }
    // }

    this.addBirdsToLibrary$.next(this.rawBirds);
  }

  // FUNCTIONS ///////////////////////////////////////////////////////////////////////////

  

  deselectBird(){
    this.selectBirdInLibrary$.next(''); 
  }

  selectBirdInLibrary(genus: string, species: string){
    this.selectBirdInLibrary$.next(genus + '_' + species); 
  }  

  // FULL SCREEN /////////////////////////////////////////////////////////////////////////////////////////////////////////
  openFullScreen() {
    // Trigger fullscreen
    const docElmWithBrowsersFullScreenFunctions = document.documentElement as HTMLElement & {
      mozRequestFullScreen(): Promise<void>;
      webkitRequestFullscreen(): Promise<void>;
      msRequestFullscreen(): Promise<void>;
    };
   
    if (docElmWithBrowsersFullScreenFunctions.requestFullscreen) {
      docElmWithBrowsersFullScreenFunctions.requestFullscreen();
    } else if (docElmWithBrowsersFullScreenFunctions.mozRequestFullScreen) { /* Firefox */
      docElmWithBrowsersFullScreenFunctions.mozRequestFullScreen();
    } else if (docElmWithBrowsersFullScreenFunctions.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      docElmWithBrowsersFullScreenFunctions.webkitRequestFullscreen();
    } else if (docElmWithBrowsersFullScreenFunctions.msRequestFullscreen) { /* IE/Edge */
      docElmWithBrowsersFullScreenFunctions.msRequestFullscreen();
    }
    this.fullScreen = true;
  }
   
  closeFullScreen(){
    const docWithBrowsersExitFunctions = document as Document & {
      mozCancelFullScreen(): Promise<void>;
      webkitExitFullscreen(): Promise<void>;
      msExitFullscreen(): Promise<void>;
    };
    if (docWithBrowsersExitFunctions.exitFullscreen) {
      docWithBrowsersExitFunctions.exitFullscreen();
    } else if (docWithBrowsersExitFunctions.mozCancelFullScreen) { /* Firefox */
      docWithBrowsersExitFunctions.mozCancelFullScreen();
    } else if (docWithBrowsersExitFunctions.webkitExitFullscreen) { /* Chrome, Safari and Opera */
      docWithBrowsersExitFunctions.webkitExitFullscreen();
    } else if (docWithBrowsersExitFunctions.msExitFullscreen) { /* IE/Edge */
      docWithBrowsersExitFunctions.msExitFullscreen();
    }
    this.fullScreen = false;
  }

  getRandomSuccessMessage(): string{
    let messages = ['BRAVO !', 'EXCEPTIONNEL !', 'CORRECT !', 'JUDICIEUX !', 'PERTINENT !', 'MONUMENTAL !', 'VRAI !', 'CONGRATULATIONS !', 'VOUS ETES UN GENIE !', 'BRAVO EINSTEIN !']; 
    shuffle(messages); 
    return messages[0]; 
  }

}
