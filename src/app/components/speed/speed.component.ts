import { Component } from '@angular/core';
import { FitnessMachineService } from 'src/app/services/fitness-machine.service';

@Component({
  selector: 'app-speed',
  templateUrl: './speed.component.html',
  styleUrls: ['./speed.component.scss']
})
export class SpeedComponent {
  speed: number = 0

  constructor(private fitnessMachineService: FitnessMachineService) {}

  ngOnInit() {
    this.fitnessMachineService.indoorBikeData$.subscribe((indoorBikeData) => {
      this.speed = Math.round(indoorBikeData.instantaneousSpeed)
    });
  }

}
