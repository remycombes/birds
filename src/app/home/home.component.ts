import { Component, OnInit} from '@angular/core';
import { BIRDS_DATA } from 'src/assets/data/birdsData';
import { BirdCollection } from '../model/BirdCollection';
import { shuffle } from '../utils/array';
import { StatService } from '../service/stat.service';
import { Statistics } from '../model/Statistics';
import { BirdService } from '../service/bird.service';

@Component({
  selector: 'home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit{  

  // DISPLAYED DATA //////////////////////////////////////////////////////////////////////
  rawBirds: BirdCollection = {};
  stats: Statistics = {}; 

  // NAVIGATION //////////////////////////////////////////////////////////////////////////
  page: string = "menu"; 
  fullScreen: boolean = false; 
  navigationExtended: boolean = false; 

  ////////////////////////////////////////////////////////////////////////////////////////
  // CONSTRUCTOR /////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  constructor(
    private statsService: StatService, 
    private birdService: BirdService
  ){}

  ////////////////////////////////////////////////////////////////////////////////////////
  // INIT ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  ngOnInit(){    
    this.getStats(); 
    
    // for(let bird of Object.keys(BIRDS_DATA)){
    //   this.rawBirds[bird]={        
    //     order: BIRDS_DATA[bird].order, 
    //     family: BIRDS_DATA[bird].family, 
    //     genus: BIRDS_DATA[bird].genus, 
    //     species: BIRDS_DATA[bird].species, 
    //     name: BIRDS_DATA[bird].name, 
    //     img: BIRDS_DATA[bird].genus + BIRDS_DATA[bird].species.charAt(0).toUpperCase() + BIRDS_DATA[bird].species.slice(1) + '.jpg'
    //   }
    // }
  }
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
  // METHODS ///////////////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////////////////////////
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

  getStats(): void{    
    this.stats =  JSON.parse(localStorage.getItem('stats')); 
    console.log(this.stats); 
  }

  setStats(stats: Statistics): void{
    localStorage.setItem('stats', JSON.stringify(stats))
  }

  getBirds(): void{

  }

}
