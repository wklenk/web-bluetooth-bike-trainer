import { Injectable, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { InclinationIngestionData, InclinationIngestionService } from './inclination-ingestion.service';
import { FitnessMachineService } from './fitness-machine.service';

export type ResistanceLevelIngestionData = {
  calculatedResistanceLevel: number // 0.0 to 10.0
} & InclinationIngestionData

@Injectable({
  providedIn: 'root'
})
export class ResistanceLevelIngestionService {

  private resistanceLevelIngestionDataSubject = new Subject<ResistanceLevelIngestionData>();
  resistanceLevelIngestionData$ = this.resistanceLevelIngestionDataSubject.asObservable();

  private currentResistanceLevel = 0.1

  constructor(private inclinationIngestionService: InclinationIngestionService, private fitnessMachineService: FitnessMachineService) { 
    this.inclinationIngestionService.inclinationIngestionData$.subscribe((inclinationIngestionData) => {

      // TODO: Find resistance level by total weight, speed and inclination
      const resistanceLevel = 0.1

      if (this.currentResistanceLevel != resistanceLevel) {
        this.fitnessMachineService.setTargetResistanceLevel(resistanceLevel)
          .then(() => {
            this.currentResistanceLevel = resistanceLevel
          })
      }

      this.resistanceLevelIngestionDataSubject.next({
        ...inclinationIngestionData,
        calculatedResistanceLevel: resistanceLevel
      })
    })
  }

  connect(): Promise<string> {
    return this.inclinationIngestionService.connect()
  }

  disconnect(): Promise<void> {
    return this.inclinationIngestionService.disconnect()
  }
}
