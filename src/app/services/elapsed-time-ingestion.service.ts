import { Inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FITNESS_MACHINE_SERVICE, FitnessMachineService, IndoorBikeData } from './FitnessMachineService';

export type ElapsedTimeIngestionData = {
  calculatedElapsedTime: number // s
} & IndoorBikeData

@Injectable({
  providedIn: 'root'
})
/**
 * This service keeps track of the elapsed time since the start of the workout,
 * adding the calculatedElapsedTime property to the IndoorBikeData notifications.
 */
export class ElapsedTimeIngestionService {

  private elapsedTimeIngestionDataSubject = new Subject<ElapsedTimeIngestionData>();
  elapsedTimeIngestionData$ = this.elapsedTimeIngestionDataSubject.asObservable();

  private startTime = 0;

  constructor(@Inject(FITNESS_MACHINE_SERVICE) private fitnessMachineService: FitnessMachineService) {
    this.fitnessMachineService.indoorBikeData$.subscribe((indoorBikeData) => {

      const calculatedElapsedTime = (Date.now() - this.startTime) / 1000 // In seconds

      this.elapsedTimeIngestionDataSubject.next({
        ...indoorBikeData,
        calculatedElapsedTime: calculatedElapsedTime
      })
    })
  }

  async connect(): Promise<void> {
    await this.fitnessMachineService.connect()
    this.startTime = Date.now()
  }

  disconnect(): void {
    return this.fitnessMachineService.disconnect()
  }
}
