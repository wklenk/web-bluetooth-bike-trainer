import { Component } from '@angular/core';
import { GradeIngestionService } from 'src/app/services/grade-ingestion.service';

@Component({
  selector: 'app-grade',
  template: `
    ↗ {{ grade }}%
  `
})
export class GradeComponent {

  grade: number = 0

  constructor(private gradeIngestionService: GradeIngestionService) {}

  ngOnInit() {
    this.gradeIngestionService.gradeIngestionData$.subscribe((gradeIngestionData) => {
      this.grade = Math.round(gradeIngestionData.grade)
    });
  }
}
