import { Injectable, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { DistanceAndElevation } from '../components/altitude-profile/altitude-profile.component';
import { TotalDistanceIngestionData, TotalDistanceIngestionService } from './total-distance-ingestion.service';

export type InclinationIngestionData = {
  inclination: number // percent
} & TotalDistanceIngestionData

@Injectable({
  providedIn: 'root'
})
/**
 * This service keeps track of the inclination of the path based on the distance covered since the start of the workout,
 * adding the inclination property to the TotalDistanceIngestionData notifications.
 */
export class InclinationIngestionService {

  private inclinationIngestionDataSubject = new Subject<InclinationIngestionData>();
  inclinationIngestionData$ = this.inclinationIngestionDataSubject.asObservable();

  simplifiedElevationData: DistanceAndElevation[] = []

  constructor(private totalDistanceIngestionService: TotalDistanceIngestionService) {
    this.totalDistanceIngestionService.totalDistanceIngestionData$.subscribe((totalDistanceIngestionData) => {

      // Based on the distance, find the current elevation
      const inclination = this.findInclinationByDistance(totalDistanceIngestionData.calculatedTotalDistance)

      this.inclinationIngestionDataSubject.next({
        ...totalDistanceIngestionData,
        inclination: inclination
      })
    })
  }

   // In the altitude-profile component, the user has to create a simplified altitude profile
  setSimplifiedElevationData(simplifiedElevationData: DistanceAndElevation[]) {
    this.simplifiedElevationData = simplifiedElevationData
  }

  async connect(): Promise<void> {
    await this.totalDistanceIngestionService.connect()
  }

  disconnect(): void {
    this.totalDistanceIngestionService.disconnect()
  }

  private findInclinationByDistance(distance: number): number {

    if (!this.simplifiedElevationData) {
      return 0
    }

    for (let i = 0; i < this.simplifiedElevationData.length - 1; i++) {
      const elevationData0 = this.simplifiedElevationData[i]
      const elevationData1 = this.simplifiedElevationData[i+1]

      if (distance >= elevationData0.distance && distance < elevationData1.distance) {
        const distanceDiff = elevationData1.distance - elevationData0.distance
        const elevationDiff = elevationData1.elevation - elevationData0.elevation

        const horizontalDiff = Math.sqrt(distanceDiff ** 2 - elevationDiff ** 2)

        return elevationDiff / horizontalDiff * 100 // in %
      }
    }

    return 0
  }
}
