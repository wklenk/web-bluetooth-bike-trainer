import { Injectable } from '@angular/core';
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
  totalDistancePresent: boolean,
  totalDistance: number, // m
  resistanceLevelPresent: boolean,
  resistanceLevel: number,
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
  elapsedTimePresent: boolean,
  elapsedTime: number, // s
  remainingTimePresent: boolean
  remainingTime: number // s

  inclination: number // percent. 
}

type SupportedResistanceLevelRange = {
  minimumResistanceLevel: number,
  maximumResistanceLevel: number,
  minimumIncrement: number
}


@Injectable({
  providedIn: 'root'
})
export class FitnessMachineService {

  private indoorBikeDataSubject = new Subject<IndoorBikeData>();
  indoorBikeData$ = this.indoorBikeDataSubject.asObservable();

  private startTime: number = 0;
  private elapsedTime: number = 0;
  private lastElapsedTime: number = 0;
  private distance: number = 0;
  private inclination: number = 0;

  constructor() { }

  private device: BluetoothDevice | undefined
  private server: BluetoothRemoteGATTServer | undefined
  private service: BluetoothRemoteGATTService | undefined
  private indoorBikeDataCharacteristic: BluetoothRemoteGATTCharacteristic | undefined
  private supportedResistanceLevelRangeCharacteristic: BluetoothRemoteGATTCharacteristic | undefined
  private fitnessMachineControlPointCharacteristic: BluetoothRemoteGATTCharacteristic | undefined
  public supportedResistanceLevelRange: SupportedResistanceLevelRange | undefined

  connect(): Promise<string> {
    return new Promise((resolve, reject) => {
      navigator.bluetooth.requestDevice({ filters: [{ services: ['fitness_machine'] }] })
        .then(device => {
          this.device = device
          console.info(device)

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
          this.supportedResistanceLevelRangeCharacteristic = characteristic
          console.info('supportedResistanceLevelRange', characteristic)

          return characteristic?.readValue()
        })
        .then(value => {
          if (value) {
            this.supportedResistanceLevelRange = this.parseSupportedResistanceLevelRange(value)
            console.info('Parsed supportedResistanceLevelRange', this.supportedResistanceLevelRange)
          }

          return this.service?.getCharacteristic('fitness_machine_control_point')
        })
        .then(characteristic => {
          this.fitnessMachineControlPointCharacteristic = characteristic
          console.info('fitnessMachineControlPoint', characteristic)

          return this.fitnessMachineControlPointCharacteristic?.startNotifications()
        })
        .then(() => {
          this.fitnessMachineControlPointCharacteristic?.addEventListener('characteristicvaluechanged', (event) => {
            const characteristic = event.target as BluetoothRemoteGATTCharacteristic;

            console.info('fitnessMachineControlPoint event', event)
          })

          resolve(this.device?.name || 'unknown')
        })
        .catch(error => {
          console.error(error)
          reject(error)
        })
    })
  }

  disconnect(): void {
    this.server?.disconnect()
  }

  startNotifications(): Promise<void> {
    this.startTime = Date.now() - this.elapsedTime;

    return new Promise((resolve, reject) => {

      this.indoorBikeDataCharacteristic?.startNotifications()
        .then(() => {
          this.indoorBikeDataCharacteristic?.addEventListener('characteristicvaluechanged', (event) => {
            const characteristic = event.target as BluetoothRemoteGATTCharacteristic;

            if (characteristic.value) {
              const indoorBikeData = this.parseIndoorBikeData(characteristic.value)

              if (!indoorBikeData.elapsedTimePresent) {
                this.elapsedTime = Date.now() - this.startTime
                indoorBikeData.elapsedTime = this.elapsedTime / 1000 // In seconds
              }

              if (!indoorBikeData.totalDistancePresent) {
                const timeDelta = this.elapsedTime - this.lastElapsedTime
                const distanceDelta = timeDelta * indoorBikeData.instantaneousSpeed / 3600
                // const distanceDelta = timeDelta * 200 / 3600
                this.distance += distanceDelta
                indoorBikeData.totalDistance = this.distance
              }

              indoorBikeData.inclination = this.inclination

              this.lastElapsedTime = this.elapsedTime
              this.indoorBikeDataSubject.next(indoorBikeData) // send notitification to subscribers
            }
          });

          resolve()
        })
        .catch(error => reject(error))
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
        .catch(error => reject(error))
    })
  }

  setInclination(inclination: number): void {
    this.inclination = inclination
  }

  resistance20(): void {
    this.requestControl()
      .then(() => {
        return this.reset()
      })
      .then(() => {
        return this.setTargetResistanceLevel(2.0)
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
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

  // See https://github.com/oesmith/gatt-xml/blob/master/org.bluetooth.characteristic.indoor_bike_data.xml
  private parseIndoorBikeData(data: DataView): IndoorBikeData {

    const flags = data.getUint16(0, /*littleEndian=*/ true)

    const moreDataPresent = flags & 0x0001
    const averageSpeedPresent = flags & 0x0002
    const instantaneousCadencePresent = flags & 0x0004
    const averageCadencePresent = flags & 0x0008
    const totalDistancePresent = flags & 0x0010
    const resistanceLevelPresent = flags & 0x0020
    const instantaneousPowerPresent = flags & 0x0040
    const averagePowerPresent = flags & 0x0080
    const expendedEnergyPresent = flags & 0x0100
    const heartRatePresent = flags & 0x0200
    const metabolicEquivalentPresent = flags & 0x0400
    const elapsedTimePresent = flags & 0x0800
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
      totalDistancePresent: false,
      totalDistance: 0, // in m
      resistanceLevelPresent: false,
      resistanceLevel: 0,
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
      elapsedTimePresent: false,
      elapsedTime: 0,
      remainingTimePresent: false,
      remainingTime: 0,
      inclination: 0
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

    if (totalDistancePresent) {
      result.totalDistancePresent = true
      result.totalDistance = (data.getUint8(index + 2) * 256 + data.getUint8(index + 1)) * 256 + data.getUint8(index)
      index += 3
    }

    if (resistanceLevelPresent) {
      result.resistanceLevelPresent = true
      result.resistanceLevel = data.getInt16(index, /*littleEndian=*/ true)
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

    if (elapsedTimePresent) {
      result.elapsedTimePresent = true
      result.elapsedTime = data.getUint16(index, /*littleEndian=*/ true)
      index += 2
    }

    if (remainingTimePresent) {
      result.remainingTimePresent = true
      result.remainingTime = data.getUint16(index, /*littleEndian=*/ true)
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
}
