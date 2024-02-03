import { Component } from '@angular/core';
import { FitnessMachineService } from 'src/app/services/fitness-machine.service';

@Component({
  selector: 'app-cadence',
  templateUrl: './cadence.component.html',
  styleUrls: ['./cadence.component.scss']
})
export class CadenceComponent {

  cadence: number = 0

  constructor(private fitnessMachineService: FitnessMachineService) {}

  ngOnInit() {
    this.fitnessMachineService.indoorBikeData$.subscribe((indoorBikeData) => {
      this.cadence = Math.round(indoorBikeData.instantaneousCadence)
    });
  }

}
