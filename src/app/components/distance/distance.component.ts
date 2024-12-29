import { Component, Inject, OnInit } from '@angular/core';
import { FITNESS_MACHINE_SERVICE, FitnessMachineService } from '../../services/fitness-machine.service';

@Component({
  selector: 'app-distance',
  standalone: true,
  imports: [],
  template: `
    ⟷ {{ distance }}m
  `
})
export class DistanceComponent implements OnInit {
  distance = 0

  constructor(@Inject(FITNESS_MACHINE_SERVICE) private fitnessMachineService: FitnessMachineService) { }

  ngOnInit() {
    this.fitnessMachineService.indoorBikeData$.subscribe(indoorBikeData => {
      this.distance = Math.round(indoorBikeData.calculatedTotalDistance)
    });
  }
}
