import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Bird } from 'src/app/model/Bird';
import { Observable, Subject, merge } from 'rxjs';
import { BirdCollection } from 'src/app/model/BirdCollection';
import { map, scan } from 'rxjs/operators';
import { Quizz } from 'src/app/model/Quizz';
import { shuffle } from 'src/app/utils/array';
import { Statistics } from 'src/app/model/Statistics';

/////////////////////////////////////////////////////////////////////////////////////////
// SETTINGS /////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
const SPAN = 7 ; 

/////////////////////////////////////////////////////////////////////////////////////////
// QUIZZ ACTIONS TYPES //////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
enum QuizzActionTypes {
  ADD_BIRDS = 'Add birds', 
  GET_ANSWERS = 'Get answers', 
  GIVE_ANSWER = "Give answer", 
  INIT_QUIZZ = "Init quizz",
  UPDATE_QUIZZ = "Update quizz", 
  INIT_STATISTICS = "Init statistics", 
  SET_MODE= "Set mode"
}; 
class AddBirdsAction{ readonly type = QuizzActionTypes.ADD_BIRDS; constructor(public payload: {[key: string]: Bird}) {}}

class InitStatisticsAction{ readonly type = QuizzActionTypes.INIT_STATISTICS; constructor(public payload: Statistics) {}}

class GetAnswersAction{readonly type = QuizzActionTypes.GET_ANSWERS;}
class GiveAnswerAction{ readonly type = QuizzActionTypes.GIVE_ANSWER; constructor(public payload: string) {} }
class SetModeAction{ readonly type = QuizzActionTypes.SET_MODE; constructor(public payload: string) {} }
class InitQuizzAction{ readonly type = QuizzActionTypes.INIT_QUIZZ; }
class UpdateQuizzAction{ readonly type = QuizzActionTypes.UPDATE_QUIZZ; }
type QuizzActions = AddBirdsAction | InitStatisticsAction | GetAnswersAction | GiveAnswerAction | InitQuizzAction | UpdateQuizzAction | SetModeAction; 


/////////////////////////////////////////////////////////////////////////////////////////
// COMPONENT ////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
@Component({
  selector: 'app-bird-quizz',
  templateUrl: './bird-quizz.component.html'
})
export class BirdQuizzComponent implements OnInit {
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // INPUTS ////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  @Input() birds: any; 
  @Input() stats: Statistics; 
  @Output() onGetStats = new EventEmitter(); 
  @Output() onSetStats = new EventEmitter<Statistics>();   

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // QUIZZ INTERFACES //////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  setMode$: Subject<string> = new Subject(); 
  addBirds$: Subject<BirdCollection> = new Subject();
  initStatistics$: Subject<Statistics> = new Subject(); 
  initQuizz$: Subject<boolean> = new Subject();
  getAnswers$: Subject<boolean> = new Subject(); 
  giveAnswer$: Subject<string> = new Subject();
  updateQuizz$: Subject<boolean> = new Subject();

  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // QUIZZ ACTIONS /////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  addBirdsAction$ : Observable<AddBirdsAction> = this.addBirds$.pipe( map((birds)=>{return new AddBirdsAction(birds)}) );
  initStatisticsAction$ : Observable<InitStatisticsAction> = this.initStatistics$.pipe( map((stats)=>{return new InitStatisticsAction(stats)}) );
  setModeAction$: Observable<SetModeAction> = this.setMode$.pipe( map(mode=>{return new SetModeAction(mode)}) ); 
  initQuizzAction$: Observable<InitQuizzAction> = this.initQuizz$.pipe( map(()=>{return new InitQuizzAction()}) ); 
  getAnswersAction$: Observable<GetAnswersAction> = this.getAnswers$.pipe( map(()=>{return new GetAnswersAction()}) ); 
  giveAnswerAction$: Observable<GiveAnswerAction> = this.giveAnswer$.pipe( map(answer=>{return new GiveAnswerAction(answer)}) ); 
  updateQuizzAction$: Observable<UpdateQuizzAction> = this.updateQuizz$.pipe( map(()=>{return new UpdateQuizzAction()}) ); 
  quizzActions$: Observable<QuizzActions> = merge(
    this.addBirdsAction$, 
    this.initStatisticsAction$, 
    this.setModeAction$, 
    this.initQuizzAction$, 
    this.getAnswersAction$, 
    this.giveAnswerAction$, 
    this.updateQuizzAction$ 
  ); 

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
    responsesForBird: {}, 
    statistics: {}
  }
  //////////////////////////////////////////////////////////////////////////////////
  // REDUCER ///////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////
  quizz$ : Observable<Quizz> = this.quizzActions$.pipe(
    scan(
      (acc : Quizz, curr: QuizzActions)=>{
        console.log(curr.type); 
        let quizzCopy = JSON.parse(JSON.stringify(acc));
        switch(curr.type){
          ///////////////////////////////////////////////////////////////////////////          
          // ADD BIRDS //////////////////////////////////////////////////////////////
          ///////////////////////////////////////////////////////////////////////////
          case QuizzActionTypes.ADD_BIRDS:
            let birdsCopy = JSON.parse(JSON.stringify(curr.payload)); 
            let stats: Statistics = {};             
            for(let key of Object.keys(birdsCopy)){
              stats[key]=0; 
              birdsCopy[key].img = ""; 
              birdsCopy[key].img = ""+birdsCopy[key].genus.toLocaleLowerCase() + birdsCopy[key].species.charAt(0).toUpperCase() + birdsCopy[key].species.slice(1)+'.jpg'
            }
            return {...acc, 
              birds: birdsCopy, 
              current: null, 
              responsesForBird: {}, 
              statistics: {}
            };

          ///////////////////////////////////////////////////////////////////////////          
          // INIT STATISTICS ////////////////////////////////////////////////////////
          ///////////////////////////////////////////////////////////////////////////
          case QuizzActionTypes.INIT_STATISTICS:
            let statsCopy: any = {}; 

            if(curr.payload!=null){            
              statsCopy = JSON.parse(JSON.stringify(curr.payload)); 
            }

            for(let key of Object.keys(acc.birds)){
              if(statsCopy[key]==undefined){
                statsCopy[key]=0; 
              }
            }
            for (let key of Object.keys(statsCopy)){
              if(acc.birds[key]==undefined){
                delete statsCopy[key]; 
              }
            } 
            // SIDE EFFECT ! 
            this.onSetStats.next(statsCopy); 
            return {...acc,
              statistics: statsCopy
            };
            
          ///////////////////////////////////////////////////////////////////////////
          // SET MODE ///////////////////////////////////////////////////////////////          
          ///////////////////////////////////////////////////////////////////////////
          case QuizzActionTypes.SET_MODE:
            return {...acc, 
              mode: curr.payload
            };
          ///////////////////////////////////////////////////////////////////////////   
          // INIT QUIZZ /////////////////////////////////////////////////////////////
          ///////////////////////////////////////////////////////////////////////////
          case QuizzActionTypes.INIT_QUIZZ:
            quizzCopy.all = []; 
            quizzCopy.toLearn = []; 
            
            for(let bird of Object.keys(acc.birds)){quizzCopy.all.push(bird);}

            let all = JSON.parse(JSON.stringify(quizzCopy.all)); 
            for(let bird of all){
              if (acc.statistics[bird]==0){quizzCopy.toLearn.push(bird)}
            }
            // quizzCopy.toLearn = JSON.parse(JSON.stringify(quizzCopy.all)); 

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
            quizzCopy.responsesForBird = {}
            for (let bird of Object.keys(acc.birds)){
              quizzCopy.responsesForBird[bird]=[]; 
            }
            return quizzCopy;           
          ///////////////////////////////////////////////////////////////////////////
          // UPDATE QUIZZ ///////////////////////////////////////////////////////////
          ///////////////////////////////////////////////////////////////////////////
          case QuizzActionTypes.UPDATE_QUIZZ: 
            // remove all the known birds from toLearn and inProgress
            
            for (let i=quizzCopy.toLearn.length-1; i>=0; i--){              
              if(
                quizzCopy.responsesForBird[quizzCopy.toLearn[i]].length >= 2 
                && quizzCopy.responsesForBird[quizzCopy.toLearn[i]].indexOf(false)==-1) 
              {quizzCopy.toLearn.splice(i, 1) }
            }
            for (let i=quizzCopy.inProgress.length-1; i>=0; i--){
              if(
                quizzCopy.responsesForBird[quizzCopy.inProgress[i]].length >= 2 
                && quizzCopy.responsesForBird[quizzCopy.inProgress[i]].indexOf(false)==-1) 
              {quizzCopy.inProgress.splice(i, 1)}
            }
            quizzCopy.learned = [];             
            for (let bird of Object.keys(quizzCopy.responsesForBird)){
              if(
                quizzCopy.responsesForBird[bird].length >=2 
                && quizzCopy.responsesForBird[bird].indexOf(false)== -1){
                quizzCopy.learned.push(bird); 
              }
            }
            for(let learned of quizzCopy.learned){
              quizzCopy.statistics[learned]=1; 
            }

            // SIDE EFFECT !
            this.onSetStats.next(quizzCopy.statistics); 
            
            return quizzCopy; 
          ///////////////////////////////////////////////////////////////////////////
          // GET ANSWERS ///////////////////////////////////////////////////////////
          ///////////////////////////////////////////////////////////////////////////
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
          ///////////////////////////////////////////////////////////////////////////
          case QuizzActionTypes.GIVE_ANSWER:
            quizzCopy.givenAnswer = curr.payload; 
            quizzCopy.responsesForBird[acc.current].unshift(curr.payload==quizzCopy.current); 
            quizzCopy.responsesForBird[acc.current].splice(2);
            return quizzCopy; 
          default: return ; 
        }
      }, this.initialQuizzState
    )
  ); 
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // DISPLAYED DATA ////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  quizz: Quizz; 

  constructor() { }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // INIT //////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ngOnInit(): void {
    this.quizz$.subscribe(      // ERREUR ETRANGE ! Je peux pas utiliser pipe async ! 
      quizz=>this.quizz = quizz
    ); 
    this.setMode$.next("question");
    this.addBirds$.next(this.birds); 
    this.initStatistics$.next(this.stats); 
    this.initQuizz$.next(true); 
    this.updateQuizz$.next(true); 
    this.getAnswers$.next(true); 
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // METHODS ///////////////////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  giveAnswer(answer: string){
    this.giveAnswer$.next(answer);     
    this.setMode('answer'); 
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  nextQuestion(){
    this.updateQuizz$.next(true); 
    this.getAnswers$.next(true); 
    this.setMode('question'); 
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  setMode(mode: string){
    this.setMode$.next(mode); 
  }

}
