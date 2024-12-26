import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { NgxGaugeModule } from 'ngx-gauge';
import { HeartRateService } from '../../services/heart-rate.service';

const default_heart_rate = 0;
const default_device_name = "Heart Rate"

@Component({
  selector: 'app-heart-rate',
  standalone: true,
  imports: [CommonModule, MatButtonModule, NgxGaugeModule],
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
        style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10; opacity: 0.9;"
        (click)="connect()">
        Connect
    </button>
    </div>  
  `
})
export class HeartRateComponent implements OnInit {

  heartRate = default_heart_rate
  deviceName = default_device_name

  constructor(private heartRateService: HeartRateService) { }

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
