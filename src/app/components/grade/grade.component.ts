import { Component, OnInit } from '@angular/core';
import { GradeIngestionService } from '../../services/grade-ingestion.service';

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

  constructor(private gradeIngestionService: GradeIngestionService) { }

  ngOnInit() {
    this.gradeIngestionService.gradeIngestionData$.subscribe((gradeIngestionData) => {
      this.grade = gradeIngestionData.grade.toFixed(1)

      if (gradeIngestionData.grade > 0.1) {
        this.icon = '↗'
      } else if (gradeIngestionData.grade < -0.1) {
        this.icon = '↘'
      } else {
        this.icon = '⟶'
      }
    });
  }
}
