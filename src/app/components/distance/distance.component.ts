import { Component } from '@angular/core';
import { TotalDistanceIngestionService } from 'src/app/services/total-distance-ingestion.service';

@Component({
  selector: 'app-distance',
  templateUrl: './distance.component.html',
  styleUrls: ['./distance.component.scss']
})
export class DistanceComponent {
  distance: number = 0

  constructor(private totalDistanceIngestionService: TotalDistanceIngestionService) { }

  ngOnInit() {
    this.totalDistanceIngestionService.totalDistanceIngestionData$.subscribe((totalDistanceIngestionData) => {
      this.distance = Math.round(totalDistanceIngestionData.calculatedTotalDistance)
    });
  }
}
