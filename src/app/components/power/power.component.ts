import { Component } from '@angular/core';
import { FitnessMachineService } from 'src/app/services/fitness-machine.service';

@Component({
  selector: 'app-power',
  template: `
    <ngx-gauge
        [value]="power"
        [min]="0"
        [max]="500"
        [type]="'arch'"
        [thick]="10"
        [cap]="'round'"
        [label]="'Power'"
        [append]="'W'"
        [foregroundColor]="'#ff0000'"
        >
    </ngx-gauge>  
  `
})
export class PowerComponent {
  power: number = 0

  constructor(private fitnessMachineService: FitnessMachineService) {}

  ngOnInit() {
    this.fitnessMachineService.indoorBikeData$.subscribe((indoorBikeData) => {
      this.power = Math.round(indoorBikeData.instantaneousPower)
    });
  }

}
