import { Component, OnInit } from '@angular/core';
import { ElapsedTimeIngestionService } from '../../services/elapsed-time-ingestion.service';

@Component({
  selector: 'app-elapsed-time',
  standalone: true,
  imports: [],
  template: `
    ⏱ {{ elapsedTime }}
  `
})
export class ElapsedTimeComponent implements OnInit {
  elapsedTime = "00:00:00";

  constructor(private elapsedTimeIngestionService: ElapsedTimeIngestionService) { }

  ngOnInit() {
    this.elapsedTimeIngestionService.elapsedTimeIngestionData$.subscribe((elapsedTimeIngestionData) => {
      this.elapsedTime = this.formatSecondsToHHMMSS(elapsedTimeIngestionData.calculatedElapsedTime)
    });
  }

  private formatSecondsToHHMMSS(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.round(seconds % 60);
    return [hours, minutes, secs]
      .map((val) => String(val).padStart(2, '0'))
      .join(':');
  }
}
