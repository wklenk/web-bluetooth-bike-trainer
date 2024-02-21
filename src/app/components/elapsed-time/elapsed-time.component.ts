import { Component } from '@angular/core';
import { ElapsedTimeIngestionService } from 'src/app/services/elapsed-time-ingestion.service';

@Component({
  selector: 'app-elapsed-time',
  templateUrl: './elapsed-time.component.html',
  styleUrls: ['./elapsed-time.component.scss']
})
export class ElapsedTimeComponent {
  constructor(private elapsedTimeIngestionService: ElapsedTimeIngestionService) {}

  elapsedTime: number = 0;

  ngOnInit() {
    this.elapsedTimeIngestionService.elapsedTimeIngestionData$.subscribe((elapsedTimeIngestionData) => {
      this.elapsedTime = elapsedTimeIngestionData.calculatedElapsedTime * 1000 // convert to ms
    });
  }
}
