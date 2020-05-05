import { BirdCollection } from './BirdCollection';
import { Order } from './Order';
import { Family } from './Family';
import { Genus } from './Genus';
import { Species } from './Species';

export interface Library{
    birds: BirdCollection;
    phylo: any; 
    available: {    
      orders: {[key: string]: Order}, 
      families: {[key: string]: Family}, 
      genus: {[key: string]: Genus},  
      species: {[key: string]: Species}
    }; 
    current: string, 
    searchString: string, 
    searchedBirds: string[]
  }