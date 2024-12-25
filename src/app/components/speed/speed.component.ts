import { Component } from '@angular/core';
import { FitnessMachineService } from 'src/app/services/fitness-machine.service';

@Component({
  selector: 'app-speed',
  template: `
    <ngx-gauge
        [value]="speed"
        [min]="0"
        [max]="100"
        [type]="'arch'"
        [thick]="10"
        [cap]="'round'"
        [label]="'Speed'"
        [append]="'km/h'"
        [foregroundColor]="'#ff0000'"
        >
    </ngx-gauge>  
  `
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
