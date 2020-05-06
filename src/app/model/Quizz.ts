import { BirdCollection } from './BirdCollection';
import { Statistics } from './Statistics';

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
    responsesForBird: {[key:string]: [boolean]}
    statistics: Statistics
  }