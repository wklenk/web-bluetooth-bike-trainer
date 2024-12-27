import { Injectable } from "@angular/core";
import { DataProcessor, IndoorBikeData } from "./FitnessMachineService";
import { DistanceAndElevation } from "../components/altitude-profile/altitude-profile.component";

@Injectable({
    providedIn: 'root'
})
export class GradeProcessorService implements DataProcessor {

    reducedWaypoints: DistanceAndElevation[] = []

    process(indoorBikeData: IndoorBikeData): IndoorBikeData {
        if (!indoorBikeData.calculatedTotalDistance || !this.reducedWaypoints) {
            throw Error()
        }

        // Based on the distance, find the current elevation
        const grade = Math.round(this.findGradeByDistance(indoorBikeData.calculatedTotalDistance) * 10) / 10

        return {
            ...indoorBikeData,
            calculatedGrade: grade
        }
    }

    reset(): void {
        // Nothing to reset
    }

    setReducedWaypoints(reducedWaypoints: DistanceAndElevation[]) {
        this.reducedWaypoints = reducedWaypoints
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