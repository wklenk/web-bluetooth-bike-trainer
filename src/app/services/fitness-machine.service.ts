import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';

export type IndoorBikeData = {
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

type SupportedResistanceLevelRange = {
  minimumResistanceLevel: number,
  maximumResistanceLevel: number,
  minimumIncrement: number
}

type SupportedPowerRange = {
  minimumPower: number,
  maximumPower: number,
  minimumIncrement: number
}

@Injectable({
  providedIn: 'root'
})
export class FitnessMachineService {

  private indoorBikeDataSubject = new Subject<IndoorBikeData>()
  indoorBikeData$ = this.indoorBikeDataSubject.asObservable()

  constructor(private toastrService: ToastrService) { }

  private device: BluetoothDevice | undefined
  private server: BluetoothRemoteGATTServer | undefined
  private indoorBikeDataCharacteristic: BluetoothRemoteGATTCharacteristic | undefined
  private fitnessMachineControlPointCharacteristic: BluetoothRemoteGATTCharacteristic | undefined
  public supportedResistanceLevelRange: SupportedResistanceLevelRange | undefined
  public supportedPowerRange: SupportedPowerRange | undefined

  async connect(): Promise<void> {
    try {
      // Prompt the user to select a Bluetooth device offering a Fitness Machine service.
      const options: RequestDeviceOptions = {
        acceptAllDevices: false,
        filters: [
          { services: ['fitness_machine'] }
        ]
      }

      this.device = await navigator.bluetooth.requestDevice(options)
      console.log('Device selected:', this.device);
      this.toastrService.info("Device", this.device.name)

      // Connect to the GATT server on the device.
      this.server = await this.device.gatt?.connect()

      const service = await this.server?.getPrimaryService('fitness_machine')
      this.indoorBikeDataCharacteristic = await service?.getCharacteristic('indoor_bike_data')
      this.fitnessMachineControlPointCharacteristic = await service?.getCharacteristic('fitness_machine_control_point')

      const supportedResistanceLevelRangeCharacteristic = await service?.getCharacteristic('supported_resistance_level_range')
      const supportedResistanceLevelRangeValue = await supportedResistanceLevelRangeCharacteristic?.readValue()
      if (supportedResistanceLevelRangeValue) {
        this.supportedResistanceLevelRange = this.parseSupportedResistanceLevelRange(supportedResistanceLevelRangeValue)
      }

      const supportedPowerRangeCharacteristic = await service?.getCharacteristic('supported_power_range')
      const supportedPowerRangeValue = await supportedPowerRangeCharacteristic?.readValue()
      if (supportedPowerRangeValue) {
        this.supportedPowerRange = this.parseSupportedPowerRange(supportedPowerRangeValue)
      }

      // Enable notifications
      await this.fitnessMachineControlPointCharacteristic?.startNotifications();

      // Add event listener for notifications
      this.fitnessMachineControlPointCharacteristic?.addEventListener('characteristicvaluechanged', (event: Event) => {
        const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
        if (value) {
          const decodedValue = new TextDecoder().decode(value); // e.g. "0x80 RequestOpCode ResultCode"
          console.log('FMCP value change:', decodedValue);
          this.toastrService.info("FMCP value change", `${decodedValue}`)
        } else {
          console.log('FMCP: Empty notification received');
        }
      });

      await this.reset()
    } catch (error) {
      console.error('Error connecting and setting up FitnessMachineService:', error);
    }
  }

  disconnect(): void {
    if (this.device && this.device.gatt?.connected) {
      this.device.gatt.disconnect();
      console.log('Device disconnected');
    } else {
      console.log('No device connected');
    }
  }

  async startNotifications(): Promise<void> {
    await this.indoorBikeDataCharacteristic?.startNotifications()
    this.indoorBikeDataCharacteristic?.addEventListener('characteristicvaluechanged', (event) => {
      const characteristic = event.target as BluetoothRemoteGATTCharacteristic;

      if (characteristic.value) {
        const indoorBikeData = this.parseIndoorBikeData(characteristic.value)
        this.indoorBikeDataSubject.next(indoorBikeData)
      }
    })
  }

  async stopNotifications(): Promise<void> {
      await this.indoorBikeDataCharacteristic?.stopNotifications()
  }

  // Initiates the procedure to request the control of a fitness machine.
  async requestControl(): Promise<void> {
    const requestControlMessage = Uint8Array.of(0x00);
    await this.fitnessMachineControlPointCharacteristic?.writeValue(requestControlMessage)
  }

  // Initiates the procedure to reset the controllable settings of a fitness machine.
  async reset(): Promise<void> {
    const resetMessage = Uint8Array.of(0x01);
    await this.fitnessMachineControlPointCharacteristic?.writeValue(resetMessage)
  }

  // Initiate the procedure to set the target resistance level of the fitness machine.
  async setTargetResistanceLevel(resistanceLevel: number): Promise<void> {
    if (!this.supportedResistanceLevelRange) {
      return Promise.reject(new Error('No supported resistance level range present.'))
    }

    if (resistanceLevel < this.supportedResistanceLevelRange.minimumResistanceLevel ||
      resistanceLevel > this.supportedResistanceLevelRange.maximumResistanceLevel) {
      return Promise.reject(new Error('Requested resistance level ' + resistanceLevel + " is out of range."
        + this.supportedResistanceLevelRange))
    }

    const setTargetResistanceLevelMessage = Uint8Array.of(0x04, resistanceLevel * 10)
    await this.fitnessMachineControlPointCharacteristic?.writeValue(setTargetResistanceLevelMessage)
  }

  // Initiate the procedure to set the target power of the fitness machine.
  async setTargetPower(power: number): Promise<void> {
    if (!this.supportedPowerRange) {
      return Promise.reject(new Error('No supported power range present.'))
    }

    if (power < this.supportedPowerRange.minimumPower ||
      power > this.supportedPowerRange.maximumPower) {
      return Promise.reject(new Error('Requested power ' + power + " is out of range."
        + this.supportedPowerRange))
    }

    const setTargetPowerMessage = Uint8Array.of(
      0x05,
      power & 0xFF,
      (power >> 8) & 0xFF
    )

    await this.fitnessMachineControlPointCharacteristic?.writeValueWithResponse(setTargetPowerMessage)
  }

  // See https://github.com/oesmith/gatt-xml/blob/master/org.bluetooth.characteristic.indoor_bike_data.xml
  private parseIndoorBikeData(data: DataView): IndoorBikeData {

    const flags = data.getUint16(0, /*littleEndian=*/ true)

    const moreDataPresent = flags & 0x0001
    const averageSpeedPresent = flags & 0x0002
    const instantaneousCadencePresent = flags & 0x0004
    const averageCadencePresent = flags & 0x0008
    const nativeTotalDistancePresent = flags & 0x0010
    const nativeResistanceLevelPresent = flags & 0x0020
    const instantaneousPowerPresent = flags & 0x0040
    const averagePowerPresent = flags & 0x0080
    const expendedEnergyPresent = flags & 0x0100
    const heartRatePresent = flags & 0x0200
    const metabolicEquivalentPresent = flags & 0x0400
    const nativeElapsedTimePresent = flags & 0x0800
    const remainingTimePresent = flags & 0x1000

    var result: IndoorBikeData = {
      instantaneousSpeedPresent: false,
      instantaneousSpeed: 0,
      averageSpeedPresent: false,
      averageSpeed: 0,
      instantaneousCadencePresent: false,
      instantaneousCadence: 0,
      averageCadencePresent: false,
      averageCadence: 0,
      instantaneousPowerPresent: false,
      instantaneousPower: 0,
      averagePowerPresent: false,
      averagePower: 0,
      expendedEnergyPresent: false,
      totalEnergy: 0,
      energyPerHour: 0,
      energyPerMinute: 0,
      heartRatePresent: false,
      heartRate: 0,
      metabolicEquivalentPresent: false,
      metabolicEquivalent: 0,

      // KICKR doesn't send it
      nativeElapsedTimePresent: false,
      nativeElapsedTime: 0,
      nativeResistanceLevelPresent: false,
      nativeResistanceLevel: 0,
      nativeTotalDistancePresent: false,
      nativeTotalDistance: 0, // in m
    }

    let index = 2

    if (!moreDataPresent) {
      result.instantaneousSpeedPresent = true
      result.instantaneousSpeed = data.getUint16(index, /*littleEndian=*/ true) / 100;
      index += 2
    }

    if (averageSpeedPresent) {
      result.averageSpeedPresent = true
      result.averageSpeed = data.getUint16(index, /*littleEndian=*/ true) / 100;
      index += 2
    }

    if (instantaneousCadencePresent) {
      result.instantaneousCadencePresent = true
      result.instantaneousCadence = data.getUint16(index, /*littleEndian=*/ true) / 2;
      index += 2
    }

    if (averageCadencePresent) {
      result.averageCadencePresent = true
      result.averageCadence = data.getUint16(index, /*littleEndian=*/ true) / 2;
      index += 2
    }

    if (nativeTotalDistancePresent) {
      result.nativeTotalDistancePresent = true
      result.nativeTotalDistance = (data.getUint8(index + 2) * 256 + data.getUint8(index + 1)) * 256 + data.getUint8(index)
      index += 3
    }

    if (nativeResistanceLevelPresent) {
      result.nativeResistanceLevelPresent = true
      result.nativeResistanceLevel = data.getInt16(index, /*littleEndian=*/ true)
      index += 2
    }

    if (instantaneousPowerPresent) {
      result.instantaneousPowerPresent = true
      result.instantaneousPower = data.getInt16(index, /*littleEndian=*/ true)
      index += 2
    }

    if (averagePowerPresent) {
      result.averagePowerPresent = true
      result.averagePower = data.getInt16(index, /*littleEndian=*/ true)
      index += 2
    }

    if (expendedEnergyPresent) {
      result.expendedEnergyPresent = true
      result.totalEnergy = data.getUint16(index, /*littleEndian=*/ true)
      index += 2
      result.energyPerHour = data.getUint16(index, /*littleEndian=*/ true)
      index += 2
      result.energyPerMinute = data.getUint8(index)
      index += 1
    }

    if (heartRatePresent) {
      result.heartRatePresent = true
      result.heartRate = data.getUint8(index)
      index += 1
    }

    if (metabolicEquivalentPresent) {
      result.metabolicEquivalentPresent = true
      result.metabolicEquivalent = data.getUint8(index) / 10
      index += 1
    }

    if (nativeElapsedTimePresent) {
      result.nativeElapsedTimePresent = true
      result.nativeElapsedTime = data.getUint16(index, /*littleEndian=*/ true)
      index += 2
    }

    if (remainingTimePresent) {
      index += 2
    }

    return result
  }

  // See https://github.com/oesmith/gatt-xml/blob/master/org.bluetooth.characteristic.supported_resistance_level_range.xml
  private parseSupportedResistanceLevelRange(data: DataView): SupportedResistanceLevelRange {

    var result: SupportedResistanceLevelRange = {
      minimumResistanceLevel: 0,
      maximumResistanceLevel: 0,
      minimumIncrement: 0
    }

    let index = 0

    result.minimumResistanceLevel = data.getInt16(index, /*littleEndian=*/ true) / 10
    index += 2
    result.maximumResistanceLevel = data.getInt16(index, /*littleEndian=*/ true) / 10
    index += 2
    result.minimumIncrement = data.getUint16(index, /*littleEndian=*/ true) / 10
    index += 2

    return result
  }

  // See https://github.com/oesmith/gatt-xml/blob/master/org.bluetooth.characteristic.supported_power_range.xml
  private parseSupportedPowerRange(data: DataView): SupportedPowerRange {

    var result: SupportedPowerRange = {
      minimumPower: 0,
      maximumPower: 0,
      minimumIncrement: 0
    }

    let index = 0

    result.minimumPower = data.getInt16(index, /*littleEndian=*/ true)
    index += 2
    result.maximumPower = data.getInt16(index, /*littleEndian=*/ true)
    index += 2
    result.minimumIncrement = data.getUint16(index, /*littleEndian=*/ true)
    index += 2

    return result
  }
}
