import { Component, OnInit } from '@angular/core';
import { TotalDistanceIngestionService } from '../../services/total-distance-ingestion.service';

@Component({
  selector: 'app-distance',
  standalone: true,
  imports: [],
  template: `
    ⟷ {{ distance }}m
  `
})
export class DistanceComponent implements OnInit {
  distance = 0

  constructor(private totalDistanceIngestionService: TotalDistanceIngestionService) { }

  ngOnInit() {
    this.totalDistanceIngestionService.totalDistanceIngestionData$.subscribe((totalDistanceIngestionData) => {
      this.distance = Math.round(totalDistanceIngestionData.calculatedTotalDistance)
    });
  }
}
