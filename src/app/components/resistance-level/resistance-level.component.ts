import { Component } from '@angular/core';
import { ResistanceLevelIngestionService } from 'src/app/services/restistance-level-ingestion.service';

@Component({
  selector: 'app-resistance-level',
  templateUrl: './resistance-level.component.html',
  styleUrls: ['./resistance-level.component.scss']
})
export class ResistanceLevelComponent {

  resistanceLevel: number = 0

  constructor(private resistanceLevelIngestionService: ResistanceLevelIngestionService) {}

  ngOnInit() {
    this.resistanceLevelIngestionService.resistanceLevelIngestionData$.subscribe((resistanceLevelIngestionData) => {
      this.resistanceLevel = resistanceLevelIngestionData.calculatedResistanceLevel
    });
  }
}
