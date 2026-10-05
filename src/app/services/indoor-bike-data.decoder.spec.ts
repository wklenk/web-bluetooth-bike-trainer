import { decodeIndoorBikeDataView } from './indoor-bike-data.decoder';

function view(...bytes: number[]): DataView {
  return new DataView(Uint8Array.of(...bytes).buffer);
}

describe('decodeIndoorBikeDataView', () => {
  it('adapts every supported FTMS field while preserving application units and defaults', () => {
    const decoded = decodeIndoorBikeDataView(view(
      0xfe, 0x1f, 0x10, 0x0e, // speed: 36 km/h
      0xb4, 0x0c, // average speed: 32.52 km/h
      0xb5, 0x00, // cadence: 90.5 rpm
      0x78, 0x00, // average cadence: 60 rpm
      0x03, 0x02, 0x01, // distance: 66051 m
      0xd3, 0xff, // signed resistance: -45 (legacy application unit)
      0xfa, 0xff, // instantaneous power: -6 W
      0xfa, 0x00, // average power: 250 W
      0xf4, 0x01, 0x58, 0x02, 0x0a, // energy values
      0x96, 0x55, 0x10, 0x0e, 0x58, 0x02,
    ));

    expect(decoded).toEqual({
      instantaneousSpeedPresent: true, instantaneousSpeed: 36,
      averageSpeedPresent: true, averageSpeed: 32.52,
      instantaneousCadencePresent: true, instantaneousCadence: 90.5,
      averageCadencePresent: true, averageCadence: 60,
      instantaneousPowerPresent: true, instantaneousPower: -6,
      averagePowerPresent: true, averagePower: 250,
      expendedEnergyPresent: true, totalEnergy: 500, energyPerHour: 600, energyPerMinute: 10,
      heartRatePresent: true, heartRate: 150,
      metabolicEquivalentPresent: true, metabolicEquivalent: 8.5,
      nativeElapsedTimePresent: true, nativeElapsedTime: 3600,
      nativeTotalDistancePresent: true, nativeTotalDistance: 66051,
      nativeResistanceLevelPresent: true, nativeResistanceLevel: -45,
      calculatedElapsedTime: 0, calculatedTotalDistance: 0, calculatedGrade: 0,
    });
  });

  it('uses only a DataView span, not its backing-buffer prefix or suffix', () => {
    const bytes = Uint8Array.of(0xff, 0x00, 0x00, 0x34, 0x12, 0xff);
    const decoded = decodeIndoorBikeDataView(new DataView(bytes.buffer, 1, 4));

    expect(decoded).toEqual(jasmine.objectContaining({
      instantaneousSpeedPresent: true,
      instantaneousSpeed: 46.6,
      nativeResistanceLevelPresent: false,
      nativeResistanceLevel: 0,
    }));
  });

  it('returns zero defaults for absent optional fields and drops malformed packets', () => {
    const noOptionals = decodeIndoorBikeDataView(view(0x00, 0x00, 0x34, 0x12));
    expect(noOptionals).toEqual(jasmine.objectContaining({
      averageSpeedPresent: false, averageSpeed: 0,
      instantaneousPowerPresent: false, instantaneousPower: 0,
      nativeElapsedTimePresent: false, nativeElapsedTime: 0,
    }));

    expect(decodeIndoorBikeDataView(view())).toBeNull();
    expect(decodeIndoorBikeDataView(view(0x00, 0x00))).toBeNull();
    expect(decodeIndoorBikeDataView(view(0x04, 0x00, 0x34, 0x12, 0x01))).toBeNull();
  });

  it('keeps the energy-block flag when total energy alone is unavailable', () => {
    const decoded = decodeIndoorBikeDataView(view(
      0x00, 0x01, 0x10, 0x0e, 0xff, 0xff, 0x58, 0x02, 0x0a,
    ));
    expect(decoded).toEqual(jasmine.objectContaining({
      expendedEnergyPresent: true, totalEnergy: 0, energyPerHour: 600, energyPerMinute: 10,
    }));
  });

  it('maps unavailable energy values to defaults without losing block presence', () => {
    const decoded = decodeIndoorBikeDataView(view(
      0x00, 0x01, 0x10, 0x0e, 0xff, 0xff, 0xff, 0xff, 0xff,
    ));
    expect(decoded).toEqual(jasmine.objectContaining({
      expendedEnergyPresent: true, totalEnergy: 0, energyPerHour: 0, energyPerMinute: 0,
    }));
  });

  it('distinguishes measured zero from absence and honors the More Data speed bit', () => {
    const decoded = decodeIndoorBikeDataView(view(0x45, 0x00, 0x00, 0x00, 0x00, 0x00));
    expect(decoded).toEqual(jasmine.objectContaining({
      instantaneousSpeedPresent: false, instantaneousSpeed: 0,
      instantaneousCadencePresent: true, instantaneousCadence: 0,
      instantaneousPowerPresent: true, instantaneousPower: 0,
    }));
  });
});
