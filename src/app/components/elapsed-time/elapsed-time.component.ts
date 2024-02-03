import { Component, Input } from '@angular/core';
import { FitnessMachineService } from 'src/app/services/fitness-machine.service';

@Component({
  selector: 'app-elapsed-time',
  templateUrl: './elapsed-time.component.html',
  styleUrls: ['./elapsed-time.component.scss']
})
export class ElapsedTimeComponent {
  constructor(private fitnessMachineService: FitnessMachineService) {}

  elapsedTime: number = 0;

  ngOnInit() {
    this.fitnessMachineService.indoorBikeData$.subscribe((indoorBikeData) => {
      this.elapsedTime = indoorBikeData.elapsedTime * 1000 // convert to ms
    });
  }
}
