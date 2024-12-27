import { Component, Inject, OnInit } from '@angular/core';
import { FITNESS_MACHINE_SERVICE, FitnessMachineService } from '../../services/FitnessMachineService';

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

  constructor(@Inject(FITNESS_MACHINE_SERVICE) private fitnessMachineService: FitnessMachineService) { }

  ngOnInit() {
    this.fitnessMachineService.indoorBikeData$.subscribe(indoorBikeData => {
      this.elapsedTime = this.formatSecondsToHHMMSS(indoorBikeData.calculatedElapsedTime)
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
