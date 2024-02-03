import { Component } from '@angular/core';
import { FitnessMachineService, IndoorBikeData } from 'src/app/services/fitness-machine.service';

const default_device_name = "unknown"

@Component({
  selector: 'app-fitness-machine',
  templateUrl: './fitness-machine.component.html',
  styleUrls: ['./fitness-machine.component.scss']
})
export class FitnessMachineComponent {

  deviceName = default_device_name
  inProgress = false;

  constructor(private fitnessMachineService: FitnessMachineService) {}

  ngOnInit() {
  }

  connect(): void {
    this.inProgress = true
    this.fitnessMachineService.connect()
      .then(deviceName => {
        this.deviceName = deviceName

        return this.fitnessMachineService.startNotifications()
      })
      .finally(() => {
        this.inProgress = false
      })
  }

  disconnect(): void {
    this.inProgress = true

    this.fitnessMachineService.stopNotifications()
      .then(() => {
        this.fitnessMachineService.disconnect()
        this.deviceName = default_device_name
      })
      .finally(() => {
        this.inProgress = false
      })
  }

  control(): void {
    this.inProgress = true
    this.fitnessMachineService.requestControl()
      .then(() => {
        return this.fitnessMachineService.reset()
      })
      .then(() => {
        return this.fitnessMachineService.startTrainingSession()
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        this.inProgress = false
      })
  }

  resistance00(): void {
    this.inProgress = true
    this.fitnessMachineService.requestControl()
      .then(() => {
        return this.fitnessMachineService.reset()
      })
      .then(() => {
        return this.fitnessMachineService.setTargetResistanceLevel(0.0)
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        this.inProgress = false
      })
  }

  resistance10(): void {
    this.inProgress = true
    this.fitnessMachineService.requestControl()
      .then(() => {
        return this.fitnessMachineService.reset()
      })
      .then(() => {
        return this.fitnessMachineService.setTargetResistanceLevel(1.0)
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        this.inProgress = false
      })
  }

  resistance20(): void {
    this.inProgress = true
    this.fitnessMachineService.requestControl()
      .then(() => {
        return this.fitnessMachineService.reset()
      })
      .then(() => {
        return this.fitnessMachineService.setTargetResistanceLevel(2.0)
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        this.inProgress = false
      })
  }

  resistance30(): void {
    this.inProgress = true
    this.fitnessMachineService.requestControl()
      .then(() => {
        return this.fitnessMachineService.reset()
      })
      .then(() => {
        return this.fitnessMachineService.setTargetResistanceLevel(3.0)
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        this.inProgress = false
      })
  }

  resistance40(): void {
    this.inProgress = true
    this.fitnessMachineService.requestControl()
      .then(() => {
        return this.fitnessMachineService.reset()
      })
      .then(() => {
        return this.fitnessMachineService.setTargetResistanceLevel(4.0)
      })
      .catch((error) => {
        console.error(error)
      })
      .finally(() => {
        this.inProgress = false
      })
  }
}
