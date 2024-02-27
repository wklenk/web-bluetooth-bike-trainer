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

  private indoorBikeDataSubject = new Subject<IndoorBikeData>();
  indoorBikeData$ = this.indoorBikeDataSubject.asObservable();

  constructor(private toastrService: ToastrService) { }

  private device: BluetoothDevice | undefined
  private server: BluetoothRemoteGATTServer | undefined
  private service: BluetoothRemoteGATTService | undefined
  private indoorBikeDataCharacteristic: BluetoothRemoteGATTCharacteristic | undefined
  private fitnessMachineControlPointCharacteristic: BluetoothRemoteGATTCharacteristic | undefined
  public supportedResistanceLevelRange: SupportedResistanceLevelRange | undefined
  public supportedPowerRange: SupportedPowerRange | undefined

  connect(): Promise<string> {
    return new Promise((resolve, reject) => {
      navigator.bluetooth.requestDevice({ filters: [{ services: ['fitness_machine'] }] })
        .then(device => {
          this.device = device
          console.info(device)
          this.toastrService.info("Device", device.name)

          return device.gatt?.connect()
        })
        .then(server => {
          this.server = server

          return server?.getPrimaryService('fitness_machine');
        })
        .then(service => {
          this.service = service
          return this.service?.getCharacteristic('indoor_bike_data')
        })
        .then(characteristic => {
          this.indoorBikeDataCharacteristic = characteristic
          console.info('indoorBikeData', characteristic)

          return this.service?.getCharacteristic('supported_resistance_level_range')
        })
        .then(characteristic => {
          console.info('supportedResistanceLevelRange', characteristic)
          return characteristic?.readValue()
        })
        .then(value => {
          if (value) {
            this.supportedResistanceLevelRange = this.parseSupportedResistanceLevelRange(value)
            console.info('Parsed supportedResistanceLevelRange', this.supportedResistanceLevelRange)
            this.toastrService.info("Resistence levels", JSON.stringify(this.supportedResistanceLevelRange))
          }

          return this.service?.getCharacteristic('supported_power_range')
        })
        .then(characteristic => {
          console.info('supportedPowerRange', characteristic)

          return characteristic?.readValue()
        })
        .then(value => {
          if (value) {
            this.supportedPowerRange = this.parseSupportedPowerRange(value)
            console.info('Parsed supportedPowerRange', this.supportedPowerRange)
            this.toastrService.info("Power range", JSON.stringify(this.supportedPowerRange))
          }

          return this.service?.getCharacteristic('fitness_machine_control_point')
        })
        .then(characteristic => {
          this.fitnessMachineControlPointCharacteristic = characteristic
          console.info('fitnessMachineControlPoint', characteristic)

          return this.reset()
        })
        .then(() => {
          return this.fitnessMachineControlPointCharacteristic?.startNotifications()
        })
        .then(() => {
          this.fitnessMachineControlPointCharacteristic?.addEventListener('characteristicvaluechanged', (event) => {
            const characteristic = event.target as BluetoothRemoteGATTCharacteristic;

            this.toastrService.info("Control point event", `${characteristic.value?.getUint8(0)} ${characteristic.value?.getUint8(1)} ${characteristic.value?.getUint8(2)}`)
            console.info("control point event", characteristic.value)

            console.info("control point event",
              characteristic.value?.getUint8(0), // Always 0x80
              characteristic.value?.getUint8(1), // Request Op Code
              characteristic.value?.getUint8(2), // Result Code. Should be 0x01
            )
          })

          resolve(this.device?.name || 'unknown')
        })
        .catch(error => {
          console.error(error)
          this.toastrService.error("Error", error)
          reject(error)
        })
    })
  }

  disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.reset()
        .then(() => {
          this.server?.disconnect()
          resolve()
        })
        .catch((error) => {
          this.server?.disconnect()
          this.toastrService.error("Error", error)
          reject(error)
        })
    })
  }

  startNotifications(): Promise<void> {
    return new Promise((resolve, reject) => {

      this.indoorBikeDataCharacteristic?.startNotifications()
        .then(() => {
          this.indoorBikeDataCharacteristic?.addEventListener('characteristicvaluechanged', (event) => {
            const characteristic = event.target as BluetoothRemoteGATTCharacteristic;

            if (characteristic.value) {
              const indoorBikeData = this.parseIndoorBikeData(characteristic.value)
              this.indoorBikeDataSubject.next(indoorBikeData)
            }
          });

          resolve()
        })
        .catch(error => {
          this.toastrService.error("Error", error)
          reject(error)
        })
    })
  }

  stopNotifications(): Promise<void> {
    return new Promise((resolve, reject) => {

      this.indoorBikeDataCharacteristic?.stopNotifications()
        .then(() => {
          this.indoorBikeDataCharacteristic?.removeEventListener('characteristicvaluechanged', (event) => {
            console.info('event', event)
          });

          resolve()
        })
        .catch(error => {
          this.toastrService.error("Error", error)
          reject(error)
        })
    })
  }

  // Initiates the procedure to request the control of a fitness machine.
  requestControl(): Promise<void> {
    if (!this.fitnessMachineControlPointCharacteristic) {
      return Promise.reject(new Error('No fitness_machine_control_point characteristic present.'))
    }

    const requestControlMessage = Uint8Array.of(0x00);
    return this.fitnessMachineControlPointCharacteristic.writeValueWithResponse(requestControlMessage)
  }

  // Initiates the procedure to reset the controllable settings of a fitness machine.
  reset(): Promise<void> {
    if (!this.fitnessMachineControlPointCharacteristic) {
      return Promise.reject(new Error('No fitness_machine_control_point characteristic present.'))
    }

    const resetMessage = Uint8Array.of(0x01);
    return this.fitnessMachineControlPointCharacteristic.writeValueWithResponse(resetMessage)
  }

  // Initiate the procedure to set the target resistance level of the fitness machine.
  setTargetResistanceLevel(resistanceLevel: number): Promise<void> {
    if (!this.fitnessMachineControlPointCharacteristic) {
      return Promise.reject(new Error('No fitness_machine_control_point characteristic present.'))
    }

    if (!this.supportedResistanceLevelRange) {
      return Promise.reject(new Error('No supported resistance level range present.'))
    }

    if (resistanceLevel < this.supportedResistanceLevelRange.minimumResistanceLevel ||
      resistanceLevel > this.supportedResistanceLevelRange.maximumResistanceLevel) {
      return Promise.reject(new Error('Requested resistance level ' + resistanceLevel + " is out of range."
        + this.supportedResistanceLevelRange))
    }

    const setTargetResistanceLevelMessage = Uint8Array.of(0x04, resistanceLevel * 10)

    return this.fitnessMachineControlPointCharacteristic.writeValueWithResponse(setTargetResistanceLevelMessage)
  }

  // Initiate the procedure to set the target power of the fitness machine.
  setTargetPower(power: number): Promise<void> {
    if (!this.fitnessMachineControlPointCharacteristic) {
      return Promise.reject(new Error('No fitness_machine_control_point characteristic present.'))
    }

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

    return this.fitnessMachineControlPointCharacteristic.writeValueWithResponse(setTargetPowerMessage)
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
