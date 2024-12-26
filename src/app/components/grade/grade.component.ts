import { Component } from '@angular/core';
import { GradeIngestionService } from '../../services/grade-ingestion.service';

@Component({
  selector: 'app-grade',
  standalone: true,
  imports: [],
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
