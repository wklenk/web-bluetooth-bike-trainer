import { Component, OnInit } from '@angular/core';
import { HeartRateService } from 'src/app/services/heart-rate.service';

const default_heart_rate = 0;
const default_device_name = "Heart Rate"

@Component({
  selector: 'app-heart-rate',
  template: `
    <div style="position: relative;">
    <ngx-gauge
        [value]="heartRate"
        [min]="0"
        [max]="250"
        [type]="'arch'"
        [thick]="10"
        [cap]="'round'"
        [label]="deviceName"
        [append]="'BPM'"
        [foregroundColor]="'#ff0000'"
        >
    </ngx-gauge>
    <button mat-fab color="primary"
        *ngIf="heartRate === 0"
        style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10;"
        (click)="connect()">
        Connect
    </button>
    </div>  
  `
})
export class HeartRateComponent implements OnInit {

  heartRate = default_heart_rate
  deviceName = default_device_name

  constructor(private heartRateService: HeartRateService) {}

  ngOnInit() {
    this.heartRateService.heartRateMeasurement$.subscribe((heartRate) => {
      this.heartRate = heartRate
    });
  }

  async connect(): Promise<void> {
    this.deviceName = await this.heartRateService.connect()
    await this.heartRateService.startNotifications()
  }

  disconnect(): void {
    this.heartRateService.disconnect()
    this.heartRate = default_heart_rate
    this.deviceName = default_device_name
  }
}
