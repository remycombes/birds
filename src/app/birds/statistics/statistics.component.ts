import { Component, OnInit, Input } from '@angular/core';
import { Statistics } from 'src/app/model/Statistics';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html'
})
export class StatisticsComponent implements OnInit {
  @Input() stats: Statistics;
  constructor() { }

  ngOnInit(): void {
  }

}
