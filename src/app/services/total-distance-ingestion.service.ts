import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ElapsedTimeIngestionData, ElapsedTimeIngestionService } from './elapsed-time-ingestion.service';

export type TotalDistanceIngestionData = {
  calculatedTotalDistance: number // m
} & ElapsedTimeIngestionData

@Injectable({
  providedIn: 'root'
})
export class TotalDistanceIngestionService {

  private totalDistanceIngestionDataSubject = new Subject<TotalDistanceIngestionData>();
  totalDistanceIngestionData$ = this.totalDistanceIngestionDataSubject.asObservable();

  private lastElapsedTime: number = 0;
  private totalDistance: number = 0;

  constructor(private elapsedTimeIngestionService: ElapsedTimeIngestionService) { 
    this.elapsedTimeIngestionService.elapsedTimeIngestionData$.subscribe((elapsedTimeIngestionData) => {

      const timeDelta = elapsedTimeIngestionData.calculatedElapsedTime - this.lastElapsedTime
      const distanceDelta = timeDelta * elapsedTimeIngestionData.instantaneousSpeed / 3600
      this.totalDistance += distanceDelta

      this.lastElapsedTime = elapsedTimeIngestionData.calculatedElapsedTime

      this.totalDistanceIngestionDataSubject.next({
        ...elapsedTimeIngestionData,
        calculatedTotalDistance: this.totalDistance
      })
    })
  }

  connect(): Promise<string> {
    return this.elapsedTimeIngestionService.connect()
  }

  disconnect(): Promise<void> {
    return this.elapsedTimeIngestionService.disconnect()
  }

}
