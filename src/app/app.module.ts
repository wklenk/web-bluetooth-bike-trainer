import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card'

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeartRateComponent } from './components/heart-rate/heart-rate.component';
import { FitnessMachineComponent } from './components/fitness-machine/fitness-machine.component';
import { AltitudeProfileComponent } from './components/altitude-profile/altitude-profile.component';
import { SpeedComponent } from './components/speed/speed.component';
import { CadenceComponent } from './components/cadence/cadence.component';
import { PowerComponent } from './components/power/power.component';
import { DistanceComponent } from './components/distance/distance.component';
import { ElapsedTimeComponent } from './components/elapsed-time/elapsed-time.component';

@NgModule({
  declarations: [
    AppComponent,
    HeartRateComponent,
    FitnessMachineComponent,
    AltitudeProfileComponent,
    SpeedComponent,
    CadenceComponent,
    PowerComponent,
    DistanceComponent,
    ElapsedTimeComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }