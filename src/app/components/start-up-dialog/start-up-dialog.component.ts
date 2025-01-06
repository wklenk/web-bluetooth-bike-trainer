import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import {MatDividerModule} from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-start-up-dialog',
  standalone: true,
  imports: [
    MatDialogModule, 
    MatButtonModule, 
    MatCheckboxModule, 
    MatTabsModule, 
    MatDividerModule, 
    FormsModule 
  ],
  template: `
    <h2 mat-dialog-title>Web Bluetooth Bike Trainer</h2>
    <mat-dialog-content class="mat-typography">
      <mat-tab-group>
        <mat-tab label="Deutsch">
          <p>Du wolltest schon immer mal eine bekannte Trainings- oder Wettkampfstrecke
            auf dem Indoor Bike Trainer abfahren, und speziell diese Strecke bessser
            kennenzulernen oder dich auf einen Wettkampf vorzubereiten?
          </p>
          <p>Dann ist diese App wie gemacht für dich. Besorge dir einen 
            <a href="https://de.wikipedia.org/wiki/GPS_Exchange_Format" target="_blank">GPX Track</a>
            der Strecke, z.B. als Export aus Strava, und lade sie hier hoch.
            Alle (hochgeladenen) Daten bleiben hier im Web Browser.
          </p>
          <p>Voraussetzungen: Dein Web Browser muss 
            <a href="https://developer.chrome.com/docs/capabilities/bluetooth?hl=de" target="_blank">Web Bluetooth</a>
            unterstützen, was auf dem Desktop für
            <a href="https://www.google.de/intl/de/chrome/" target="_blank">Google Chrome</a>
            der Fall ist. 
            Natürlich muss der Indoor Bike Trainer auch Bluetooth unterstützen.
          </p>
        </mat-tab>
        <mat-tab label="English">
        <p>Have you always wanted to ride a well-known training or competition 
          route on the indoor bike trainer and get to know this route better or 
          prepare for a competition?
          </p>
          <p>Then this app is perfect for you. Get a
            <a href="https://en.wikipedia.org/wiki/GPS_Exchange_Format" target="_blank">GPX track</a>
            of the route, e.g. as an export from Strava, and upload it here.
            All (uploaded) data stays here in the web browser.
          </p>
          <p>Requirements: Your web browser must support
            <a href="https://developer.chrome.com/docs/capabilities/bluetooth?hl=en" target="_blank">Web Bluetooth</a>
            , which is the case on the desktop for
            <a href="https://www.google.com/intl/de/chrome/" target="_blank">Google Chrome</a>.
            Of course, the indoor bike trainer must also support Bluetooth.
          </p>
        </mat-tab>
    </mat-tab-group>
    <mat-divider></mat-divider>
      Copyright (c) 2024 Wolfgang Klenk
    </mat-dialog-content>
    <mat-dialog-actions align="end" style="gap: 16px;">
      <mat-checkbox [(ngModel)]="dontShowAgain">Don't show again</mat-checkbox>
      <button mat-button cdkFocusInitial (click)="closeDialog()">Dismiss</button>
    </mat-dialog-actions>
  `
})
export class StartUpDialogComponent {
  dontShowAgain = false;

  constructor(
    public dialogRef: MatDialogRef<StartUpDialogComponent>,
    private storageService: StorageService
  ) { }

  closeDialog() {
    if (this.dontShowAgain) {
      this.storageService.storeItem("dontShowAgain", JSON.stringify(this.dontShowAgain))
    }
    this.dialogRef.close();
  }
}
