import { Injectable } from "@angular/core";
import { DataProcessor, Waypoint, IndoorBikeData } from "./fitness-machine.service";

@Injectable({
    providedIn: 'root'
})
export class GradeProcessorService implements DataProcessor {

    reducedWaypoints: Waypoint[] = []

    process(indoorBikeData: IndoorBikeData): IndoorBikeData {
        if (!this.reducedWaypoints) {
            throw Error()
        }

        if (!indoorBikeData.calculatedTotalDistance) {
            indoorBikeData.calculatedTotalDistance = 0
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

    setReducedWaypoints(reducedWaypoints: Waypoint[]) {
        this.reducedWaypoints = reducedWaypoints
    }

    private findGradeByDistance(distance: number): number {
        if (!this.reducedWaypoints) {
            throw Error()
        }

        const closestWaypointIndex = this.findWaypointIndexClosestToDistance(distance)
        if (closestWaypointIndex === 0 || closestWaypointIndex === this.reducedWaypoints.length - 1) {
            return 0; // Start or end of track
        }

        const elevationData0 = this.reducedWaypoints[closestWaypointIndex - 1]
        const elevationData1 = this.reducedWaypoints[closestWaypointIndex + 1]

        const distanceDiff = elevationData1.distance - elevationData0.distance
        const elevationDiff = elevationData1.elevation - elevationData0.elevation

        const horizontalDiff = Math.sqrt(distanceDiff ** 2 - elevationDiff ** 2)

        return elevationDiff / horizontalDiff * 100 // in %
    }

    private findWaypointIndexClosestToDistance(distance: number): number {
        if (!this.reducedWaypoints) {
            throw Error()
        }

        let left = 0;
        let right = this.reducedWaypoints.length - 1;

        while (left <= right) {
            const mid = Math.floor((left + right) / 2)
            const midDistance = this.reducedWaypoints[mid].distance

            if (midDistance === distance) {
                return mid
            } else if (midDistance < distance) {
                left = mid + 1
            } else {
                right = mid - 1
            }
        }

        return left < this.reducedWaypoints.length ? left : this.reducedWaypoints.length - 1
    }
}
