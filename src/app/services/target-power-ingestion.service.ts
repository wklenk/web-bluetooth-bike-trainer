import { Injectable, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { InclinationIngestionData, InclinationIngestionService } from './inclination-ingestion.service';
import { FitnessMachineService } from './fitness-machine.service';
import { ToastrService } from 'ngx-toastr';

export type TargetPowerIngestionData = {
  targetPower: number // W
} & InclinationIngestionData

@Injectable({
  providedIn: 'root'
})
export class TargetPowerIngestionService {

  private targetPowerIngestionDataSubject = new Subject<TargetPowerIngestionData>();
  targetPowerIngestionData$ = this.targetPowerIngestionDataSubject.asObservable();

  private currentTargetPower = 0.0

  constructor(
    private toastrService: ToastrService,
    private inclinationIngestionService: InclinationIngestionService, 
    private fitnessMachineService: FitnessMachineService,
    ) {
    this.inclinationIngestionService.inclinationIngestionData$.subscribe((inclinationIngestionData) => {

      const inclinationPercent = inclinationIngestionData.inclination
      const inclinationDecimal = inclinationPercent / 100;
      const angleRadians = Math.atan(inclinationDecimal);
      const velocityMS = inclinationIngestionData.instantaneousSpeed / 3.6

      const targetPower = this.calculatePower(100, angleRadians, velocityMS)

      if (this.currentTargetPower != targetPower) {
        this.toastrService.info("New target power", `${targetPower} W`)
        this.fitnessMachineService.requestControl()
          .then(() => {
            this.fitnessMachineService.setTargetPower(targetPower)
          })
          .then(() => {
            this.currentTargetPower = targetPower
          })
      }

      this.targetPowerIngestionDataSubject.next({
        ...inclinationIngestionData,
        targetPower: targetPower
      })
    })
  }

  private calculatePower(mass: number, inclinationRadians: number, velocity: number): number {
    const g = 9.81; // Acceleration due to gravity in m/s^2
    const sinTheta = Math.sin(inclinationRadians);
    const power = mass * g * sinTheta * velocity;

    return power;
}

  connect(): Promise<string> {
    return this.inclinationIngestionService.connect()
  }

  disconnect(): Promise<void> {
    return this.inclinationIngestionService.disconnect()
  }
}
