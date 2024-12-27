import { Injectable } from '@angular/core';
import { FitnessMachineService, IndoorBikeData } from './FitnessMachineService';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class DemoFitnessMachineService implements FitnessMachineService {

  private indoorBikeDataSubject = new Subject<IndoorBikeData>()
  indoorBikeData$ = this.indoorBikeDataSubject.asObservable()

  intervalId: any | undefined;

  constructor(private toastrService: ToastrService) { }

  connect(): Promise<void> {
    this.toastrService.success('Demo connected.')
    return Promise.resolve()
  }

  disconnect(): void {
    this.toastrService.success('Demo disconnected.')
  }

  startNotifications(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.intervalId = setInterval(() => {
        const indoorBikeData: IndoorBikeData = {
          instantaneousSpeedPresent: true,
          instantaneousSpeed: Math.random() * 50,
          averageSpeedPresent: false,
          averageSpeed: 0,
          instantaneousCadencePresent: true,
          instantaneousCadence: Math.random() * 100,
          averageCadencePresent: false,
          averageCadence: 0,
          instantaneousPowerPresent: true,
          instantaneousPower: Math.random() * 300,
          averagePowerPresent: false,
          averagePower: 0,
          expendedEnergyPresent: false,
          totalEnergy: 0,
          energyPerHour: 0,
          energyPerMinute: 0,
          heartRatePresent: false,
          heartRate: 0,
          metabolicEquivalentPresent: false,
          metabolicEquivalent: 0,
          nativeElapsedTimePresent: false,
          nativeElapsedTime: 0,
          nativeResistanceLevelPresent: false,
          nativeResistanceLevel: 0,
          nativeTotalDistancePresent: false,
          nativeTotalDistance: 0, // in m
        };
        this.indoorBikeDataSubject.next(indoorBikeData);
      }, 500);
      resolve()
    })
  }

  stopNotifications(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.intervalId) {
        clearInterval(this.intervalId)
        this.intervalId = undefined
        resolve()
      } else {
        reject()
      }
    })
  }

  setIndoorBikeSimulationParameters(windSpeed: number, grade: number, crr: number, cw: number): Promise<void> {
    return Promise.resolve()
  }
}
