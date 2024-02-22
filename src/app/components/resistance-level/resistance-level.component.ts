import { Component } from '@angular/core';
import { TargetPowerIngestionService } from 'src/app/services/target-power-ingestion.service';

@Component({
  selector: 'app-resistance-level',
  templateUrl: './resistance-level.component.html',
  styleUrls: ['./resistance-level.component.scss']
})
export class ResistanceLevelComponent {

  resistanceLevel: number = 0

  constructor(private targetPowerIngestionService: TargetPowerIngestionService) {}

  ngOnInit() {
    this.targetPowerIngestionService.targetPowerIngestionData$.subscribe((targetPowerIngestionData) => {
      this.resistanceLevel = targetPowerIngestionData.targetPower
    });
  }
}
