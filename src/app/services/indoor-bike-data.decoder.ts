import { decodeIndoorBikeData } from '@deancochran/ftms';
import { IndoorBikeData } from './fitness-machine.service';

const decoderOptions = { resistanceFormat: 'signed16Tenths' } as const;

/**
 * Adapts the published FTMS Indoor Bike codec to this application's established
 * data shape. A complete notification is required because the processing and
 * control pipeline must not consume partial measurements.
 */
export function decodeIndoorBikeDataView(data: DataView): IndoorBikeData | null {
  // Web Bluetooth DataViews can be a window into a larger buffer. The codec must
  // receive the notification span, never the full backing buffer.
  const bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  const decoded = decodeIndoorBikeData(bytes, decoderOptions);
  if (decoded.diagnostics.truncated || decoded.diagnostics.flags === null) {
    return null;
  }

  const { measurement, raw } = decoded;
  const present = (value: number | null): boolean => value !== null;
  const value = (field: number | null): number => field ?? 0;

  return {
    instantaneousSpeedPresent: present(raw.speedHundredthsKph),
    instantaneousSpeed: value(measurement.speedKph),
    averageSpeedPresent: present(raw.averageSpeedHundredthsKph),
    averageSpeed: value(measurement.averageSpeedKph),
    instantaneousCadencePresent: present(raw.cadenceHalfRpm),
    instantaneousCadence: value(measurement.cadenceRpm),
    averageCadencePresent: present(raw.averageCadenceHalfRpm),
    averageCadence: value(measurement.averageCadenceRpm),
    instantaneousPowerPresent: present(raw.powerWatts),
    instantaneousPower: value(measurement.powerWatts),
    averagePowerPresent: present(raw.averagePowerWatts),
    averagePower: value(measurement.averagePowerWatts),
    // This legacy boolean describes the whole block, whose three values can
    // independently carry an unavailable sentinel.
    expendedEnergyPresent: (decoded.diagnostics.flags & 0x0100) !== 0,
    totalEnergy: value(measurement.energyKcal),
    energyPerHour: value(measurement.energyPerHourKcal),
    energyPerMinute: value(measurement.energyPerMinuteKcal),
    heartRatePresent: present(raw.heartRateBpm),
    heartRate: value(measurement.heartRateBpm),
    metabolicEquivalentPresent: present(raw.metabolicEquivalentTenths),
    metabolicEquivalent: value(measurement.metabolicEquivalent),
    nativeElapsedTimePresent: present(raw.elapsedTimeSeconds),
    nativeElapsedTime: value(measurement.elapsedTimeSeconds),
    nativeTotalDistancePresent: present(raw.distanceMeters),
    nativeTotalDistance: value(measurement.distanceMeters),
    // Existing trainer integrations use the signed 16-bit raw level rather
    // than the normalized tenths level exposed by the codec.
    nativeResistanceLevelPresent: present(raw.resistance),
    nativeResistanceLevel: value(raw.resistance),
    calculatedElapsedTime: 0,
    calculatedTotalDistance: 0,
    calculatedGrade: 0,
  };
}
