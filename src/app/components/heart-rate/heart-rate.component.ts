import { Component, OnInit } from '@angular/core';
import { HeartRateService } from 'src/app/services/heart-rate.service';

const default_heart_rate = 0;
const default_device_name = "unknown"

@Component({
  selector: 'app-heart-rate',
  templateUrl: './heart-rate.component.html',
  styleUrls: ['./heart-rate.component.scss']
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

  connect(): void {
    this.heartRateService.connect()
      .then(deviceName => {
        this.deviceName = deviceName

        this.heartRateService.startNotifications()
      })
  }

  disconnect(): void {
    this.heartRateService.disconnect()
    this.heartRate = default_heart_rate
    this.deviceName = default_device_name
  }
}
