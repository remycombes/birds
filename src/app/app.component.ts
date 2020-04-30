import { Component, OnInit, AfterViewInit } from '@angular/core';
import { shuffle } from './utils/array'; 
import { Observable, Subject, merge } from 'rxjs';
import { map, scan } from "rxjs/operators";
import { BIRDS_DATA } from"../assets/data/birdsData"; 
import { analyzeAndValidateNgModules } from '@angular/compiler';

/////////////////////////////////////////////////////////////////////////////////////////
// MODELS ///////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
interface Order{description: string[]}; 
interface Family{description: string[], order: string}; 
interface Genus{family: string}; 
interface Species{genus: string}; 

interface Bird{  
  name: string; 
  order: string; 
  family: string; 
  genus: string; 
  species: string; 
  img: string; 
}

interface BirdCollection {
  [key: string]: {
    order: string, 
    family: string, 
    genus: string, 
    species: string, 
    name: string, 
    img: string
  }
}

interface Library{
  birds: BirdCollection;
  phylo: any; 
  positions?: {[key: string]: {x: number, y: number}}, 
  available: {    
    orders: {[key: string]: Order}, 
    families: {[key: string]: Family}, 
    genus: {[key: string]: Genus}, 
    species: {[key: string]: Species}
  }; 
  current: {
    type: string; // order, damily, genus, species
    value: string;     
  };
}

interface Quizz{
  mode: string; // loading, question, response
  birds: BirdCollection; 
  all: string[], 
  toLearn: string[], 
  inProgress: string[]; 
  learned: string[]; 
  current: string; 
  previous: null; 
  previous2: null; 
  givenAnswer: string; 
  answers: string[]; 
  statistics: {[key:string]: [boolean]}
}

/////////////////////////////////////////////////////////////////////////////////////////
// QUIZZ ACTIONS ////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
enum QuizzActionTypes {
  ADD_BIRDS = 'Add birds', 
  GET_ANSWERS = 'Get answers', 
  GIVE_ANSWER = "Give answer", 
  INIT_QUIZZ = "Init quizz",
  UPDATE_QUIZZ = "Update quizz", 
  INIT_STATISTICS = "", 
  SET_MODE= "Set mode"
}; 

class AddBirdsAction{ readonly type = QuizzActionTypes.ADD_BIRDS; constructor(public payload: {[key: string]: Bird}) {}}
class GetAnswersAction{readonly type = QuizzActionTypes.GET_ANSWERS;}
class GiveAnswerAction{ readonly type = QuizzActionTypes.GIVE_ANSWER; constructor(public payload: string) {} }
class SetModeAction{ readonly type = QuizzActionTypes.SET_MODE; constructor(public payload: string) {} }
class InitQuizzAction{ readonly type = QuizzActionTypes.INIT_QUIZZ; }
class UpdateQuizzAction{ readonly type = QuizzActionTypes.UPDATE_QUIZZ; }

type QuizzActions = AddBirdsAction | GetAnswersAction | GiveAnswerAction | InitQuizzAction | UpdateQuizzAction | SetModeAction; 

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
class NextBirdAction{ readonly type = LibraryActionTypes.NEXT_BIRD;}
class PreviousBirdAction{ readonly type = LibraryActionTypes.PREVIOUS_BIRD;}

type LibraryActions = AddBirdsToLibraryAction | SelectBirdInLibraryAction | NextBirdAction | PreviousBirdAction ; 


const SPAN = 7 ; 
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{

  // INIT VALUES
  initialQuizzState: Quizz = {
    mode: "question", 
    birds: {},
    all: [], 
    toLearn: [], 
    inProgress: [], 
    learned: [], 
    current: null, 
    previous: null, 
    previous2: null, 
    givenAnswer: null, 
    answers: [], 
    statistics: {}
  }
  
  // INTERFACES ///////////////////////////////////////////////////////////////////////////////////////////
  addBirds$: Subject<BirdCollection> = new Subject(); 
  setMode$: Subject<string> = new Subject(); 
  initQuizz$: Subject<boolean> = new Subject();
  getAnswers$: Subject<boolean> = new Subject(); 
  giveAnswer$: Subject<string> = new Subject();
  updateQuizz$: Subject<boolean> = new Subject();

  addBirdsToLibrary$: Subject<BirdCollection> = new Subject();   
  selectBirdInLibrary$: Subject<string> = new Subject(); 

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // QUIZZ /////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  addBirdsAction$ : Observable<AddBirdsAction> = this.addBirds$.pipe( map((birds)=>{return new AddBirdsAction(birds)}) );
  setModeAction$: Observable<SetModeAction> = this.setMode$.pipe( map(mode=>{return new SetModeAction(mode)}) ); 
  initQuizzAction$: Observable<InitQuizzAction> = this.initQuizz$.pipe( map(()=>{return new InitQuizzAction()}) ); 
  getAnswersAction$: Observable<GetAnswersAction> = this.getAnswers$.pipe( map(()=>{return new GetAnswersAction()}) ); 
  giveAnswerAction$: Observable<GiveAnswerAction> = this.giveAnswer$.pipe( map(answer=>{return new GiveAnswerAction(answer)}) ); 
  updateQuizzAction$: Observable<UpdateQuizzAction> = this.updateQuizz$.pipe( map(()=>{return new UpdateQuizzAction()}) ); 
  quizzActions$: Observable<QuizzActions> = merge(
    this.addBirdsAction$, 
    this.setModeAction$, 
    this.initQuizzAction$, 
    this.getAnswersAction$, 
    this.giveAnswerAction$, 
    this.updateQuizzAction$ 
  ); 
  
  quizz$ : Observable<Quizz> = this.quizzActions$.pipe(
    scan(
      (acc : Quizz, curr: QuizzActions)=>{
        let quizzCopy = JSON.parse(JSON.stringify(acc));
        switch(curr.type){
          ///////////////////////////////////////////////////////////////////////////
          // ADD BIRDS //////////////////////////////////////////////////////////////
          case QuizzActionTypes.ADD_BIRDS:
            let birdsCopy = JSON.parse(JSON.stringify(curr.payload)); 
            console.log(birdsCopy); 
            for(let key of Object.keys(birdsCopy)){
              birdsCopy[key].img = ""; 
              
              console.log(birdsCopy[key].species); 
              birdsCopy[key].img = ""+birdsCopy[key].genus.toLocaleLowerCase() + birdsCopy[key].species.charAt(0).toUpperCase() + birdsCopy[key].species.slice(1)+'.jpg'
            }
            return {...acc, 
              birds: birdsCopy, 
              current: null
            };
          ///////////////////////////////////////////////////////////////////////////
          // SET MODE ///////////////////////////////////////////////////////////////          
          case QuizzActionTypes.SET_MODE:
            return {...acc, 
              mode: curr.payload
            };
          ///////////////////////////////////////////////////////////////////////////   
          // INIT QUIZZ /////////////////////////////////////////////////////////////
          case QuizzActionTypes.INIT_QUIZZ:
            quizzCopy.all = []; 
            for(let bird of Object.keys(acc.birds)){quizzCopy.all.push(bird);}
            quizzCopy.toLearn = JSON.parse(JSON.stringify(quizzCopy.all)); 
            quizzCopy.inProgress = [];
            while((quizzCopy.inProgress.length < SPAN)&& this.pickItemFromToLearn(quizzCopy.toLearn, quizzCopy.inProgress)!=null){
              quizzCopy.inProgress.push(this.pickItemFromToLearn(quizzCopy.all, quizzCopy.inProgress));
            } 
            quizzCopy.learned = []; 
            quizzCopy.current = quizzCopy.inProgress[0]?quizzCopy.inProgress[0]:null; 
            quizzCopy.previous = null; 
            quizzCopy.previous2 = null; 
            quizzCopy.givenAnswer = null; 
            quizzCopy.answer = []; 
            quizzCopy.statistics = {}
            for (let bird of Object.keys(acc.birds)){
              quizzCopy.statistics[bird]=[]; 
            }
            return quizzCopy;           
          ///////////////////////////////////////////////////////////////////////////
          // UPDATE QUIZZ ///////////////////////////////////////////////////////////
          case QuizzActionTypes.UPDATE_QUIZZ: 
            // all the known bird must be removed from toLearn, and inProgress
            for (let i=quizzCopy.toLearn.length-1; i>=0; i--){
              if(quizzCopy.statistics[quizzCopy.toLearn[i]].length >= 2 && quizzCopy.statistics[quizzCopy.toLearn[i]].indexOf(false)==-1) 
              {quizzCopy.toLearn.splice(i, 1) }
            }
            for (let i=quizzCopy.inProgress.length-1; i>=0; i--){
              if(quizzCopy.statistics[quizzCopy.inProgress[i]].length >= 2 && quizzCopy.statistics[quizzCopy.inProgress[i]].indexOf(false)==-1) 
              {quizzCopy.inProgress.splice(i, 1)}
            }
            quizzCopy.learned = [];             
            for (let bird of Object.keys(quizzCopy.statistics)){
              if(quizzCopy.statistics[bird].length >=2 && quizzCopy.statistics[bird].indexOf(false)== -1){
                quizzCopy.learned.push(bird); 
              }
            }
            return quizzCopy; 
          ///////////////////////////////////////////////////////////////////////////
          // GET ANSWERS ///////////////////////////////////////////////////////////
          case QuizzActionTypes.GET_ANSWERS:
            while(quizzCopy.inProgress.length<SPAN && this.pickItemFromToLearn(quizzCopy.toLearn, quizzCopy.inProgress)!=null){
              quizzCopy.inProgress.push(this.pickItemFromToLearn(quizzCopy.toLearn, quizzCopy.inProgress)); 
            }
            quizzCopy.previous2 = quizzCopy.previous; 
            quizzCopy.previous = quizzCopy.current; 
            quizzCopy.current = this.pickItemFromStack(acc.current, acc.inProgress, acc.previous, acc.previous2); 
            quizzCopy.answers = this.generateAnswers(quizzCopy.current, quizzCopy.all, 4);
            return quizzCopy;     
          ///////////////////////////////////////////////////////////////////////////
          // GIVE ANSWER ////////////////////////////////////////////////////////////
          case QuizzActionTypes.GIVE_ANSWER:
            quizzCopy.givenAnswer = curr.payload; 
            quizzCopy.statistics[acc.current].unshift(curr.payload==quizzCopy.current); 
            quizzCopy.statistics[acc.current].splice(2);
            return quizzCopy; 
          default: return ; 
        }
      }, this.initialQuizzState
    )
  ); 

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
            // let i: number = 0; 
            // let j: number = 0; 

            let birds = libraryCopy.birds; 
            let phylo: any = {}; 

            // for (let key of Object.keys(libraryCopy.birds)){
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
              


                            
              
              // let ord = libraryCopy.birds[key].order; 
              // let fam = libraryCopy.birds[key].family; 
              // let gen = libraryCopy.birds[key].genus; 
              // let spe = libraryCopy.birds[key].species; 

              // libraryCopy.available.orders[ord]={name: ord}; 
              // libraryCopy.available.families[fam]={name: fam, order: ord}; 
              // libraryCopy.available.genus[gen]={name: gen, family: fam}; 
              // libraryCopy.available.species[spe]={name: spe, genus: gen}; 

              // libraryCopy.positions[key] = {x: i, y: j};

              // i++; 
              // if(i>20){j++; i=0;}
              
            
            
            // libraryCopy.birds = curr.payload; 
            // libraryCopy.orders = []; 
            // libraryCopy.families = []; 
            // libraryCopy.genus = []; 
            // libraryCopy.species = []; 
            // for (let key of Object.keys(curr.payload)){
            //   if(libraryCopy.orders.indexOf(curr.payload[key].order) == -1) libraryCopy.orders.push(curr.payload[key].order); 
            //   if(libraryCopy.families.indexOf(curr.payload[key].family) == -1) libraryCopy.families.push(curr.payload[key].family); 
            //   if(libraryCopy.genus.indexOf(curr.payload[key].genus) == -1) libraryCopy.genus.push(curr.payload[key].genus); 
            //   if(libraryCopy.species.indexOf(curr.payload[key].species) == -1) libraryCopy.species.push(curr.payload[key].species);               
            // }
            // libraryCopy.orders.sort(); 
            // libraryCopy.families.sort(); 
            // libraryCopy.genus.sort(); 
            // libraryCopy.species.sort(); 
            // console.log(libraryCopy); 
            return libraryCopy; 
          case LibraryActionTypes.SELECT_BIRD: 
            libraryCopy.current = curr.payload; 
            return libraryCopy;
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
        current: {
          type: null, 
          value: null
        }
      }
      )
    );   

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // VIEWBOX ///////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  viewBox: string = "0 0 21 21"; 

  // DISPLAYED DATA //////////////////////////////////////////////////////////////////////
  rawBirds: BirdCollection = {}; 
  quizz: Quizz; 
  library: Library; 

  // NAVIGATION //////////////////////////////////////////////////////////////////////////
  page: string = "menu"; 
  fullScreen: boolean = false; 

  ////////////////////////////////////////////////////////////////////////////////////////
  // INIT ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ngOnInit(){
    this.quizz$.subscribe(      // ERREUR ETRANGE ! Je peux pas utiliser pipe async ! 
      quizz=>this.quizz = quizz
    ); 

    this.library$.subscribe(
      library=>this.library = library
    ); 

    this.setMode$.next("question"); 

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
    this.addBirds$.next(this.rawBirds); 
    this.initQuizz$.next(true); 
    this.updateQuizz$.next(true); 
    this.getAnswers$.next(true); 
  }

  // FUNCTIONS ///////////////////////////////////////////////////////////////////////////

  generateAnswers(expected: string, items: string[], nbOfAnswers: number): string[]{
    let answers: string[] = []; 
    let shallowItems : string[] = JSON.parse(JSON.stringify(items)); 

    // remove existing expected response.
    shallowItems.splice(shallowItems.indexOf(expected), 1);     
    shuffle(shallowItems);
    shallowItems.splice(nbOfAnswers - 1); 
    answers.push(expected);
    answers = answers.concat(shallowItems); 
    shuffle(answers); 
    return answers; 
  }

  pickItemFromToLearn(toLearn: string[], inProgress: string[]): string{

    let items: string[] = [];
    for(let item of toLearn){
      let notInProgress = inProgress.indexOf(item)==-1; 
      if(notInProgress){
        items.push(item); 
      }
    }
    shuffle(items);     
    return items.length>0?items[0]:null; 
    
  }

  pickItemFromStack(current: string, stack: string[], previous?: string, previous2?: string): string{
    let shallowStack = JSON.parse(JSON.stringify(stack)); 
    if(shallowStack.length > 1){
      while(shallowStack[0]==current || shallowStack[0]==previous || shallowStack[0]==previous2){shuffle(shallowStack);}  ///WARNING : shoudl cause a bug at the end of the quizz
      return shallowStack[0];
    }
    else if(shallowStack.length == 1){
      return shallowStack[0]; 
    }
    else {return null; }
  }

  giveAnswer(answer: string){
    this.giveAnswer$.next(answer);     
    this.setMode('answer'); 
  }

  nextQuestion(){
    this.updateQuizz$.next(true); 
    this.getAnswers$.next(true); 
    this.setMode('question'); 
  }

  setMode(mode: string){
    this.setMode$.next(mode); 
  }

  selectBirdInLibrary(key: string){
    this.selectBirdInLibrary$.next(key); 
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

}
