import { Component, OnInit } from '@angular/core';
import { shuffle } from './utils/array'; 
import { Observable, Subject, merge } from 'rxjs';
import { map, scan } from "rxjs/operators";
import { BIRDS_DATA } from"../assets/data/birdsData"; 

/////////////////////////////////////////////////////////////////////////////////////////
// MODELS ///////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////

interface Bird{  
  name: string; 
  order: string; 
  family: string; 
  genus: string; 
  species: string; 
  img: string; 
}

interface Library{
  birds: {[key:string]: Bird}; 
  current: string;   
}

interface Quizz{
  mode: string; // loading, question, response
  birds: {[key:string]: Bird}; 
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

  // full screen
  fullScreen: boolean = false; 

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
  addBirds$: Subject<{[key: string]: Bird}> = new Subject(); 
  setMode$: Subject<string> = new Subject(); 
  initQuizz$: Subject<boolean> = new Subject();
  getAnswers$: Subject<boolean> = new Subject(); 
  giveAnswer$: Subject<string> = new Subject();
  updateQuizz$: Subject<boolean> = new Subject();

  addBirdsToLibrary$: Subject<{[key: string]: Bird}> = new Subject();   
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
            return {...acc, 
              birds: curr.payload, 
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
            return libraryCopy; 
          case LibraryActionTypes.SELECT_BIRD: 
            libraryCopy.current = curr.payload; 
            return libraryCopy;
          default: return ; 
        }
      }, 
      {birds: [], current: null}
      )
    ); 

  //       let libraryCopy = JSON.parse(JSON.stringify(acc));
  //       switch(curr.type){
  //         ///////////////////////////////////////////////////////////////////////////
  //         // ADD BIRDS TO LIBRARY ///////////////////////////////////////////////////
  //         case LibraryActionTypes.ADD_BIRDS:
  //           return {...acc, 
  //             birds: curr.payload, 
  //             current: null
  //           }
  //         default: return ; 
  //       }
  //     }, {birds: [], current: ""}
  //   )
  // );

  // DISPLAYED DATA //////////////////////////////////////////////////////////////////////
  rawBirds: any = {}; 
  quizz: Quizz; 
  library: Library; 

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

    for (let bird of BIRDS_DATA){
      let philogeny: string[] = bird.classification.split(' '); 

      this.rawBirds[philogeny[2].toLocaleLowerCase() + philogeny[3].charAt(0).toUpperCase() + philogeny[3].slice(1)] = {
        name: bird.name, 
        order: philogeny[0], 
        family: philogeny[1], 
        genus: philogeny[2], 
        species: philogeny[3], 
        img: philogeny[2].toLocaleLowerCase() + philogeny[3].charAt(0).toUpperCase() + philogeny[3].slice(1)+'.jpg'
      }
    }

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
