import { Component, OnInit } from '@angular/core';
import { BirdService } from 'src/app/service/bird.service';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-bird-test',
  templateUrl: './bird-test.component.html'
})
export class BirdTestComponent implements OnInit {

  birds$: Observable<any>;
  form: FormGroup = new FormGroup({
    name: new FormControl('')
  }); 

  constructor(    
    private birdService: BirdService, 
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.birds$ = this.birdService.getBirds();     
  }

  addBird(){
    this.birdService
      .addBird({
        identifier: this.form.get('name').value + '111',
        name: this.form.get('name').value})
      .subscribe(bird=>console.log(bird)); 
  }

  deleteBird(identifier: string){

    this.birdService
      .deleteBird(identifier)
      .subscribe(bird=>console.log(bird));
  }


}
