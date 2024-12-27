import { Component, Inject, OnInit } from '@angular/core';
import { NgxGaugeModule } from 'ngx-gauge';
import { FITNESS_MACHINE_SERVICE, FitnessMachineService } from '../../services/FitnessMachineService';

@Component({
  selector: 'app-power',
  standalone: true,
  imports: [NgxGaugeModule],
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
export class PowerComponent implements OnInit {
  power = 0

  constructor(@Inject(FITNESS_MACHINE_SERVICE) private fitnessMachineService: FitnessMachineService) { }

  ngOnInit() {
    this.fitnessMachineService.indoorBikeData$.subscribe((indoorBikeData) => {
      this.power = Math.round(indoorBikeData.instantaneousPower)
    });
  }
}
