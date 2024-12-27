import { Component, Inject, OnInit } from '@angular/core';
import { FITNESS_MACHINE_SERVICE, FitnessMachineService } from '../../services/FitnessMachineService';

@Component({
  selector: 'app-grade',
  standalone: true,
  imports: [],
  template: `
    {{ icon }} {{ grade }}%
  `
})
export class GradeComponent implements OnInit {

  grade = "0.0"
  icon = '⟶'

  constructor(@Inject(FITNESS_MACHINE_SERVICE) private fitnessMachineService: FitnessMachineService) { }

  ngOnInit() {
    this.fitnessMachineService.indoorBikeData$.subscribe(indoorBikeData => {
      this.grade = indoorBikeData.calculatedGrade.toFixed(1)

      if (indoorBikeData.calculatedGrade > 0.1) {
        this.icon = '↗'
      } else if (indoorBikeData.calculatedGrade < -0.1) {
        this.icon = '↘'
      } else {
        this.icon = '⟶'
      }
    });
  }
}
