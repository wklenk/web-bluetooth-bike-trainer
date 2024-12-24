import { Injectable } from '@angular/core';
import { FitnessMachineService, IndoorBikeData } from './fitness-machine.service';
import { Subject } from 'rxjs';

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

  private startTime: number = 0;

  constructor(private fitnessMachineService: FitnessMachineService) {
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
