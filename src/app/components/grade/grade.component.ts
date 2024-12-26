import { Component, OnInit } from '@angular/core';
import { GradeIngestionService } from '../../services/grade-ingestion.service';

@Component({
  selector: 'app-grade',
  standalone: true,
  imports: [],
  template: `
    ↗ {{ grade }}%
  `
})
export class GradeComponent implements OnInit {

  grade = 0

  constructor(private gradeIngestionService: GradeIngestionService) { }

  ngOnInit() {
    this.gradeIngestionService.gradeIngestionData$.subscribe((gradeIngestionData) => {
      this.grade = Math.round(gradeIngestionData.grade)
    });
  }
}
