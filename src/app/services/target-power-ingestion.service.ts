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

  private currentTargetPower = -1

  constructor(
    private toastrService: ToastrService,
    private inclinationIngestionService: InclinationIngestionService,
    private fitnessMachineService: FitnessMachineService,
  ) {
    this.inclinationIngestionService.inclinationIngestionData$.subscribe((inclinationIngestionData) => {

      const inclinationPercent = inclinationIngestionData.inclination
      const inclinationDecimal = inclinationPercent / 100;
      const angleRadians = Math.atan(inclinationDecimal);

      const targetPower = this.calculatePower(100, angleRadians, 10 / 3.6) // Power for velocity of 10 km/h 

      if (targetPower != this.currentTargetPower) {
        this.fitnessMachineService.requestControl()
          .then(() => {
            this.toastrService.error("Power up", `${targetPower}`)
            this.currentTargetPower = targetPower
            return this.fitnessMachineService.setTargetPower(targetPower)
          })
          .catch((error) => {
            this.toastrService.error("Error", error)
          })
      }
      /*
      if (targetPower > this.currentTargetPower) {
        const diffTargetPower = Math.min(targetPower - this.currentTargetPower, 20)
        this.fitnessMachineService.requestControl()
          .then(() => {
            const newTargetPower = Math.min(this.currentTargetPower + diffTargetPower, 50)
            this.toastrService.error("Power up", `${newTargetPower}`)
            this.currentTargetPower = newTargetPower
            return this.fitnessMachineService.setTargetPower(newTargetPower)
          })
          .catch((error) => {
            this.toastrService.error("Error", error)
          })
      } else if (targetPower < this.currentTargetPower) {
        const diffTargetPower = Math.min(this.currentTargetPower - targetPower, 20)
        this.fitnessMachineService.requestControl()
          .then(() => {
            const newTargetPower = Math.min(this.currentTargetPower - diffTargetPower, 50)
            this.currentTargetPower = newTargetPower
            return this.fitnessMachineService.setTargetPower(newTargetPower)
          })
          .catch((error) => {
            this.toastrService.error("Error", error)
          })
      }
      */

      this.targetPowerIngestionDataSubject.next({
        ...inclinationIngestionData,
        targetPower: this.currentTargetPower
      })
    })
  }

  private calculatePower(mass: number, inclinationRadians: number, velocity: number): number {
    const g = 9.81; // Acceleration due to gravity in m/s^2
    const sinTheta = Math.sin(inclinationRadians);
    let power = mass * g * sinTheta * velocity;

    if (power < 10) {
      return 10
    }

    power = Math.round(power / 5) * 5;

    return power;
  }

  connect(): Promise<string> {
    return this.inclinationIngestionService.connect()
  }

  disconnect(): Promise<void> {
    return this.inclinationIngestionService.disconnect()
  }
}
