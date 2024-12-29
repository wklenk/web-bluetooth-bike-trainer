import { Injectable, InjectionToken } from "@angular/core";
import { Observable } from "rxjs";
import { ElapsedTimeProcessorService } from "./elapsed-time-processor.service";
import { TotalDistanceProcessorService } from "./total-distance-processor.service";
import { GradeProcessorService } from "./grade-processor.service";


export interface Waypoint {
  distance: number // in m
  elevation: number // in m
}

// Define the InjectionToken for the interface
export const FITNESS_MACHINE_SERVICE = new InjectionToken<FitnessMachineService>('FitnessMachineService')

export interface FitnessMachineService {
    indoorBikeData$: Observable<IndoorBikeData>; // Observable of the indoor bike data

    connect(): Promise<void>; // Connect to the fitness machine
    disconnect(): void; // Disconnect from the fitness machine
    startNotifications(): Promise<void>; // Start receiving notifications
    stopNotifications(): Promise<void>; // Stop receiving notifications
}

export interface IndoorBikeData {
    instantaneousSpeedPresent: boolean,
    instantaneousSpeed: number, // km/h
    averageSpeedPresent: boolean,
    averageSpeed: number, // km/h
    instantaneousCadencePresent: boolean,
    instantaneousCadence: number, // rpm
    averageCadencePresent: boolean,
    averageCadence: number, // rpm
    instantaneousPowerPresent: boolean,
    instantaneousPower: number, // W
    averagePowerPresent: boolean,
    averagePower: number, // W
    expendedEnergyPresent: boolean,
    totalEnergy: number, // kcal
    energyPerHour: number, // kcal/hour
    energyPerMinute: number, // kcal/minute
    heartRatePresent: boolean,
    heartRate: number, // bpm
    metabolicEquivalentPresent: boolean,
    metabolicEquivalent: number,

    // KICKR doesn't send it
    nativeElapsedTimePresent: boolean,
    nativeElapsedTime: number, // s
    nativeTotalDistancePresent: boolean,
    nativeTotalDistance: number, // m
    nativeResistanceLevelPresent: boolean,
    nativeResistanceLevel: number,

    // Values calculated by this app
    calculatedElapsedTime: number, // s
    calculatedTotalDistance: number // m
    calculatedGrade: number // percent
}

// Process the input data and return augmented data.
export interface DataProcessor {
    process(data: IndoorBikeData): IndoorBikeData
    reset(): void
}

@Injectable({
    providedIn: 'root'
})
export class ProcessingPipeline {
    private processors: DataProcessor[] = [];

    constructor(
        private elapsedTimeProcessor: ElapsedTimeProcessorService,
        private totalDistanceProcessor: TotalDistanceProcessorService,
        private gradeProcessor: GradeProcessorService
    ) {
        this.addProcessor(elapsedTimeProcessor)
        this.addProcessor(totalDistanceProcessor)
        this.addProcessor(gradeProcessor)
    }



    reset(): void {
        this.processors.forEach(processor => processor.reset())
    }

    addProcessor(processor: DataProcessor): void {
        this.processors.push(processor);
    }

    process(data: IndoorBikeData): IndoorBikeData {
        return this.processors.reduce((currentData, processor) => {
            return processor.process(currentData);
        }, data);
    }
}
