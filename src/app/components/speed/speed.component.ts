import { Component, Inject, OnInit } from '@angular/core';
import { NgxGaugeModule } from 'ngx-gauge';
import { FITNESS_MACHINE_SERVICE, FitnessMachineService } from '../../services/fitness-machine.service';

@Component({
  selector: 'app-speed',
  standalone: true,
  imports: [NgxGaugeModule],
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
export class SpeedComponent implements OnInit {
  speed = 0

  constructor(@Inject(FITNESS_MACHINE_SERVICE) private fitnessMachineService: FitnessMachineService) { }

  ngOnInit() {
    this.fitnessMachineService.indoorBikeData$.subscribe((indoorBikeData) => {
      this.speed = Math.round(indoorBikeData.instantaneousSpeed)
    });
  }
}
