import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card'
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { HeartRateComponent } from './components/heart-rate/heart-rate.component';
import { AltitudeProfileComponent } from './components/altitude-profile/altitude-profile.component';
import { SpeedComponent } from './components/speed/speed.component';
import { CadenceComponent } from './components/cadence/cadence.component';
import { PowerComponent } from './components/power/power.component';
import { DistanceComponent } from './components/distance/distance.component';
import { ElapsedTimeComponent } from './components/elapsed-time/elapsed-time.component';
import { InclinationComponent } from './components/inclination/inclination.component';
import { ResistanceLevelComponent } from './components/resistance-level/resistance-level.component';

@NgModule({
  declarations: [
    AppComponent,
    HeartRateComponent,
    AltitudeProfileComponent,
    SpeedComponent,
    CadenceComponent,
    PowerComponent,
    DistanceComponent,
    ElapsedTimeComponent,
    InclinationComponent,
    ResistanceLevelComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,
    MatStepperModule,
    MatFormFieldModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
