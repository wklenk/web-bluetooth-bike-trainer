import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ElapsedTimeIngestionData, ElapsedTimeIngestionService } from './elapsed-time-ingestion.service';

export type TotalDistanceIngestionData = {
  calculatedTotalDistance: number // m
} & ElapsedTimeIngestionData

@Injectable({
  providedIn: 'root'
})
/**
 * This service keeps track of the total distance covered since the start of the workout,
 * adding the calculatedTotalDistance property to the ElapsedTimeIngestionData notifications.
 */
export class TotalDistanceIngestionService {

  private totalDistanceIngestionDataSubject = new Subject<TotalDistanceIngestionData>();
  totalDistanceIngestionData$ = this.totalDistanceIngestionDataSubject.asObservable();

  private lastElapsedTime: number = 0;
  private totalDistance: number = 0;

  constructor(private elapsedTimeIngestionService: ElapsedTimeIngestionService) { 
    this.elapsedTimeIngestionService.elapsedTimeIngestionData$.subscribe((elapsedTimeIngestionData) => {

      const timeDelta = elapsedTimeIngestionData.calculatedElapsedTime - this.lastElapsedTime
      const distanceDelta = timeDelta * elapsedTimeIngestionData.instantaneousSpeed / 3.6
      this.totalDistance += distanceDelta

      this.lastElapsedTime = elapsedTimeIngestionData.calculatedElapsedTime

      this.totalDistanceIngestionDataSubject.next({
        ...elapsedTimeIngestionData,
        calculatedTotalDistance: this.totalDistance
      })
    })
  }

  async connect(): Promise<void> {
    await this.elapsedTimeIngestionService.connect()
  }

  disconnect(): void {
   this.elapsedTimeIngestionService.disconnect()
  }
}
