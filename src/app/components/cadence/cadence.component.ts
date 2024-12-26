import { Component, OnInit } from '@angular/core';
import { NgxGaugeModule } from 'ngx-gauge';
import { FitnessMachineService } from '../../services/fitness-machine.service';

@Component({
  selector: 'app-cadence',
  standalone: true,
  imports: [NgxGaugeModule],
  template: `
    <ngx-gauge
        [value]="cadence"
        [min]="0"
        [max]="200"
        [type]="'arch'"
        [thick]="10"
        [cap]="'round'"
        [label]="'Cadence'"
        [append]="'RPM'"
        [foregroundColor]="'#ff0000'"
        >
    </ngx-gauge>  
  `
})
export class CadenceComponent implements OnInit {

  cadence = 0

  constructor(private fitnessMachineService: FitnessMachineService) { }

  ngOnInit() {
    this.fitnessMachineService.indoorBikeData$.subscribe((indoorBikeData) => {
      this.cadence = Math.round(indoorBikeData.instantaneousCadence)
    });
  }
}
