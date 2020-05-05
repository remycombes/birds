import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html'
})
export class NavComponent implements OnInit {

  @Output() onChangePage = new EventEmitter<string>(); 
  @Output() onFullScreen = new EventEmitter<boolean>(); 
  @Input() extended: boolean = false; 
  @Input() isFullScreen: boolean = false; 
  @Input() currentPage: string = ""; 

  constructor() { }

  ngOnInit(): void {
  }

  goTo(page: string){
    this.onChangePage.emit(page); 
  }

  fullScreen(){
    this.onFullScreen.emit(true); 
  }

}
