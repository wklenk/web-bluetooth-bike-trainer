import { Injectable } from "@angular/core";
import { DataProcessor, IndoorBikeData } from "./fitness-machine.service";

@Injectable({
    providedIn: 'root'
})
export class TotalDistanceProcessorService implements DataProcessor {

    private lastElapsedTime = 0;
    private totalDistance = 0;

    process(indoorBikeData: IndoorBikeData): IndoorBikeData {
        if (!indoorBikeData.calculatedElapsedTime) {
            throw Error()
        }

        const timeDelta = indoorBikeData.calculatedElapsedTime - this.lastElapsedTime
        const distanceDelta = timeDelta * indoorBikeData.instantaneousSpeed / 3.6
        this.totalDistance += distanceDelta
  
        this.lastElapsedTime = indoorBikeData.calculatedElapsedTime
  
        return {
          ...indoorBikeData,
          calculatedTotalDistance: this.totalDistance
        }
    }

    reset(): void {
        this.lastElapsedTime = 0
        this.totalDistance = 0
    }
}