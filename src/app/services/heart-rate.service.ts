import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeartRateService {

  private heartRateMeasurementSubject = new Subject<number>();
  heartRateMeasurement$ = this.heartRateMeasurementSubject.asObservable();

  constructor() { }

  private device: BluetoothDevice | undefined
  private server: BluetoothRemoteGATTServer | undefined
  private heartRateMeasurementCharacteristic: BluetoothRemoteGATTCharacteristic | undefined

  connect(): Promise<string> {
    return new Promise((resolve, reject) => {
      navigator.bluetooth.requestDevice({ filters: [{ services: ['heart_rate'] }] })
        .then(device => {
          this.device = device
          console.info(device)

          return device.gatt?.connect()
        })
        .then(server => {
          this.server = server

          return server?.getPrimaryService('heart_rate');
        })
        .then(service => {
          return service?.getCharacteristic('heart_rate_measurement')
        })
        .then(characteristic => {
          this.heartRateMeasurementCharacteristic = characteristic
          console.info(characteristic)

          resolve(this.device?.name || 'unknown')
        })
        .catch(error => reject(error))
    })
  }

  disconnect(): void {
    this.server?.disconnect()
  }

  startNotifications(): void {
    this.heartRateMeasurementCharacteristic?.startNotifications()
      .then(() => {
        this.heartRateMeasurementCharacteristic?.addEventListener('characteristicvaluechanged', (event) => {
          const characteristic = event.target as BluetoothRemoteGATTCharacteristic;

          if (characteristic.value) {
            this.heartRateMeasurementSubject.next(this.parseHeartRate(characteristic.value))
          }
        });
      })
  }

  stopNotifications(): void {
    this.heartRateMeasurementCharacteristic?.stopNotifications()
      .then(() => {
        this.heartRateMeasurementCharacteristic?.removeEventListener('characteristicvaluechanged', (event) => {
          console.info('event', event)
        });
      })
  }

  // see https://www.bluetooth.com/specifications/specs/heart-rate-service-1-0/
  private parseHeartRate(data: DataView): number {
    const flags = data.getUint8(0);
    const rate16Bits = flags & 0x1;

    if (rate16Bits) {
      return data.getUint16(1, /*littleEndian=*/ true);
    } else {
      return data.getUint8(1);
    }
  }
}
