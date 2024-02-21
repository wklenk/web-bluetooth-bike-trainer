import { Component } from '@angular/core';
import { InclinationIngestionService } from 'src/app/services/inclination-ingestion.service';

@Component({
  selector: 'app-inclination',
  templateUrl: './inclination.component.html',
  styleUrls: ['./inclination.component.scss']
})
export class InclinationComponent {

  inclination: number = 0

  constructor(private inclinationIngestionService: InclinationIngestionService) {}

  ngOnInit() {
    this.inclinationIngestionService.inclinationIngestionData$.subscribe((inclinationIngestionData) => {
      this.inclination = Math.round(inclinationIngestionData.inclination)
    });
  }
}
