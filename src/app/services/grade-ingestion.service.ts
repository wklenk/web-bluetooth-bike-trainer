import { Inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { DistanceAndElevation } from '../components/altitude-profile/altitude-profile.component';
import { TotalDistanceIngestionData, TotalDistanceIngestionService } from './total-distance-ingestion.service';
import { ToastrService } from 'ngx-toastr';
import { FITNESS_MACHINE_SERVICE, FitnessMachineService } from './FitnessMachineService';

export type GradeIngestionData = {
  grade: number // percent
} & TotalDistanceIngestionData

@Injectable({
  providedIn: 'root'
})
/**
 * This service keeps track of the grade of the path based on the distance covered since the start of the workout,
 * adding the grade property to the TotalDistanceIngestionData notifications.
 */
export class GradeIngestionService {

  private gradeIngestionDataSubject = new Subject<GradeIngestionData>();
  gradeIngestionData$ = this.gradeIngestionDataSubject.asObservable();

  reducedWaypoints: DistanceAndElevation[] = []
  private currentGrade: number | undefined = undefined

  constructor(
    private toastrService: ToastrService,
    private totalDistanceIngestionService: TotalDistanceIngestionService,
    @Inject(FITNESS_MACHINE_SERVICE) private fitnessMachineService: FitnessMachineService,
  ) {
    this.totalDistanceIngestionService.totalDistanceIngestionData$.subscribe((totalDistanceIngestionData) => {

      // Based on the distance, find the current elevation
      const grade = Math.round(this.findGradeByDistance(totalDistanceIngestionData.calculatedTotalDistance) * 10) / 10

      if (this.currentGrade != grade) {
        this.currentGrade = grade

        this.fitnessMachineService.setIndoorBikeSimulationParameters(0, grade, 0, 0)
          .then(() => {
            this.toastrService.info(`Grade now ${grade}%`)
          })
      }

      this.gradeIngestionDataSubject.next({
        ...totalDistanceIngestionData,
        grade: grade
      })
    })
  }

  // In the altitude-profile component, the user has to create a simplified altitude profile
  setReducedWaypoints(reducedWaypoints: DistanceAndElevation[]) {
    this.reducedWaypoints = reducedWaypoints
  }

  async connect(): Promise<void> {
    await this.totalDistanceIngestionService.connect()
  }

  disconnect(): void {
    this.totalDistanceIngestionService.disconnect()
  }

  private findGradeByDistance(distance: number): number {

    if (!this.reducedWaypoints) {
      return 0
    }

    for (let i = 0; i < this.reducedWaypoints.length - 1; i++) {
      const elevationData0 = this.reducedWaypoints[i]
      const elevationData1 = this.reducedWaypoints[i + 1]

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
