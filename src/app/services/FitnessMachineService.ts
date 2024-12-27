import { InjectionToken } from "@angular/core";
import { Observable } from "rxjs";


// Define the InjectionToken for the interface
export const FITNESS_MACHINE_SERVICE = new InjectionToken<FitnessMachineService>('FitnessMachineService')

export interface FitnessMachineService {
    indoorBikeData$: Observable<IndoorBikeData>; // Observable of the indoor bike data

    connect(): Promise<void>; // Connect to the fitness machine
    disconnect(): void; // Disconnect from the fitness machine
    startNotifications(): Promise<void>; // Start receiving notifications
    stopNotifications(): Promise<void>; // Stop receiving notifications

    setIndoorBikeSimulationParameters(windSpeed: number, grade: number, crr: number, cw: number): Promise<void>
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
}
