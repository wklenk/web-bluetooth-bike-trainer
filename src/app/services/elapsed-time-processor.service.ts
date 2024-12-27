import { Injectable } from "@angular/core";
import { DataProcessor, IndoorBikeData } from "./FitnessMachineService";

@Injectable({
  providedIn: 'root'
})
export class ElapsedTimeProcessorService implements DataProcessor {
    
    private startTime = 0

    reset(): void {
        this.startTime = Date.now()
    }
    
    process(indoorBikeData: IndoorBikeData): IndoorBikeData {
        const calculatedElapsedTime = (Date.now() - this.startTime) / 1000 // In seconds

      return {
        ...indoorBikeData,
        calculatedElapsedTime: calculatedElapsedTime
      }
    }
}
