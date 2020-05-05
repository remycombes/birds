import { BirdCollection } from './BirdCollection';

export interface Quizz{
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