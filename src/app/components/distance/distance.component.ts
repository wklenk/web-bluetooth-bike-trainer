import { Component } from '@angular/core';
import { FitnessMachineService } from 'src/app/services/fitness-machine.service';

@Component({
  selector: 'app-distance',
  templateUrl: './distance.component.html',
  styleUrls: ['./distance.component.scss']
})
export class DistanceComponent {
  distance: number = 0
  speed: number = 0

  constructor(private fitnessMachineService: FitnessMachineService) {}

  ngOnInit() {
    this.fitnessMachineService.indoorBikeData$.subscribe((indoorBikeData) => {
      this.speed = Math.round(indoorBikeData.instantaneousSpeed)
    });
  }
}
