import { Injectable } from '@angular/core';
import { FitnessMachineService, IndoorBikeData } from './fitness-machine.service';
import { Subject } from 'rxjs';

export type ElapsedTimeIngestionData = {
  calculatedElapsedTime: number // s
} & IndoorBikeData

@Injectable({
  providedIn: 'root'
})
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

  connect(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.fitnessMachineService.connect()
        .then((deviceName) => {
          this.startTime = Date.now()
          resolve(deviceName)
        })
    })
  }

  disconnect(): Promise<void> {
    return this.fitnessMachineService.disconnect()
  }
}
