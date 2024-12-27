import { AppComponent } from './app/app.component';

import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

import { provideToastr } from 'ngx-toastr';

import { FITNESS_MACHINE_SERVICE } from './app/services/FitnessMachineService';
import { BluetoothFitnessMachineService } from './app/services/bluetooth-fitness-machine.service';
import { DemoFitnessMachineService } from './app/services/demo-fitness-machine.service';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(), // required animations providers
    //provideToastr(), // Toastr providers
    provideToastr({
      timeOut: 3000,
      preventDuplicates: true
    }),

    // This allows to switch between the BluetoothFitnessMachineService which requires
    // a real Bluetooth Indoor Bike Trainer and the DemoFitnessMachineService, which just
    // simulates one.
    //{ provide: FITNESS_MACHINE_SERVICE, useClass: BluetoothFitnessMachineService },
    { provide: FITNESS_MACHINE_SERVICE, useClass: DemoFitnessMachineService },
  ]
}).catch(err => console.error(err));