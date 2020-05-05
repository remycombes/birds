import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BirdQuizzComponent } from './bird-quizz.component';

describe('BirdQuizzComponent', () => {
  let component: BirdQuizzComponent;
  let fixture: ComponentFixture<BirdQuizzComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BirdQuizzComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BirdQuizzComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
