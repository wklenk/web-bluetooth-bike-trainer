import { Injectable } from '@angular/core';
import { FitnessMachineService, IndoorBikeData, ProcessingPipeline } from './FitnessMachineService';
import { Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ElapsedTimeProcessorService } from './elapsed-time-processor.service';
import { TotalDistanceProcessorService } from './total-distance-processor.service';
import { GradeProcessorService } from './grade-processor.service';

@Injectable({
  providedIn: 'root'
})
export class DemoFitnessMachineService implements FitnessMachineService {

  private indoorBikeDataSubject = new Subject<IndoorBikeData>()
  indoorBikeData$ = this.indoorBikeDataSubject.asObservable()

  intervalId: any | undefined;

  constructor(
    private toastrService: ToastrService,
    private processingPipeline: ProcessingPipeline<IndoorBikeData>,
    private elapsedTimeProcessor: ElapsedTimeProcessorService,
    private totalDistanceProcessor: TotalDistanceProcessorService,
    private gradeProcessor: GradeProcessorService
  ) { 
    processingPipeline.addProcessor( elapsedTimeProcessor)
    processingPipeline.addProcessor( totalDistanceProcessor)
    processingPipeline.addProcessor( gradeProcessor )
  }

  connect(): Promise<void> {
    this.toastrService.success('Demo connected.')

    this.processingPipeline.reset()
    return Promise.resolve()
  }

  disconnect(): void {
    this.toastrService.success('Demo disconnected.')
  }

  startNotifications(): Promise<void> {
    return new Promise(resolve => {
      this.intervalId = setInterval(() => {
        let indoorBikeData: IndoorBikeData = {
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

          calculatedElapsedTime: 0,
          calculatedTotalDistance: 0, // m
          calculatedGrade: 0 // %
        };

        // Apply all processors that augment the data.
        indoorBikeData = this.processingPipeline.process(indoorBikeData)

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
}
