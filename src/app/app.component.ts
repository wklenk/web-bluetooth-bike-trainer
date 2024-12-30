/// <reference types="web-bluetooth" />

import { AfterViewInit, ChangeDetectionStrategy, Component, inject, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import 'leaflet';
import 'leaflet-gpx';
import * as L from 'leaflet';

import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';

import {ToastContainerDirective, ToastrModule, ToastrService } from 'ngx-toastr';

import { ElapsedTimeComponent } from './components/elapsed-time/elapsed-time.component';
import { DistanceComponent } from './components/distance/distance.component';
import { GradeComponent } from './components/grade/grade.component';
import { HeartRateComponent } from './components/heart-rate/heart-rate.component';
import { CadenceComponent } from './components/cadence/cadence.component';
import { SpeedComponent } from './components/speed/speed.component';
import { PowerComponent } from './components/power/power.component';
import { ElevationProfileComponent } from './components/elevation-profile/elevation-profile.component';
import { StorageService } from './services/storage.service';
import { FITNESS_MACHINE_SERVICE, FitnessMachineService } from './services/fitness-machine.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StartUpDialogComponent } from './components/start-up-dialog/start-up-dialog.component';

export interface ElevationPoint {
  distance: number,
  latlng: L.LatLng
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,

    // BrowserAnimationsModule,
    ToastrModule,
    ToastContainerDirective,

    MatButtonModule,
    MatProgressBarModule,
    MatToolbarModule,
    MatButtonModule, 
    MatDialogModule,

    ElapsedTimeComponent,
    DistanceComponent,
    GradeComponent,
    HeartRateComponent,
    CadenceComponent,
    SpeedComponent,
    PowerComponent,
    ElevationProfileComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements AfterViewInit, OnInit {
  @ViewChild(ToastContainerDirective, { static: true })
  toastContainer: ToastContainerDirective | undefined;

  readonly dialog = inject(MatDialog);

  title = 'Web Bluetooth Bike Trainer';
  inProgress = false

  leafletGpx: L.GPX | undefined

  isSimulationStarted = false

  private map: L.Map | undefined
  private marker: L.Marker | undefined
  private elevationPoints: ElevationPoint[] = []

  constructor(
    private toastrService: ToastrService,
    private storageService: StorageService,
    @Inject(FITNESS_MACHINE_SERVICE) private fitnessMachineService: FitnessMachineService
  ) { }

  startSimulation(): void {
    if (!this.isSimulationStarted) {
      this.inProgress = true
      this.fitnessMachineService.connect()
        .then(() => {
          this.fitnessMachineService.startNotifications()
        })
        .then(() => {
          this.toastrService.info("Info", "Connected")
        })
        .catch((error) => {
          this.toastrService.error("Error", error)
        })
        .finally(() => {
          this.inProgress = false
          this.isSimulationStarted = true
        })
    }
  }

  stopSimulation(): void {
    if (this.isSimulationStarted) {
      this.inProgress = true

      this.fitnessMachineService.stopNotifications()
        .then(() => {
          this.fitnessMachineService.disconnect()
        })
        .then(() => {
          this.toastrService.info("Info", "Disconnected")
        })
        .catch((error) => {
          this.toastrService.error("Error", error)
        })
        .finally(() => {
          this.inProgress = false
          this.isSimulationStarted = false
        })
    }
  }

  ngOnInit() {
    this.toastrService.overlayContainer = this.toastContainer;

    this.fitnessMachineService.indoorBikeData$.subscribe(indoorBikeData => {
      // Update marker on track
      this.handlePositionChangeEvent(indoorBikeData.calculatedTotalDistance)
    });
  }

  ngAfterViewInit(): void {
    this.initMap();

    // Show a dialog window with info at start-up.
    const dontShowAgain = localStorage.getItem('dontShowAgain');
    if (!dontShowAgain || JSON.parse(dontShowAgain) === false) {
      this.dialog.open(StartUpDialogComponent, {
        width: '500px'
      });
    }

    // Check if there is a gpx track in the local browser storage
    const localGpxTrackString = this.storageService.retrieveItem('GpxTrack')
    if (localGpxTrackString) {
      this.displayGPXTrack(localGpxTrackString) // Use leaflet-gpx to draw a polyline on the map, including markers
      this.parseElevationFromGpxFile(localGpxTrackString) // Addtionally to leaflet-gpx, get distance, elevation AND LatLng of points
    }
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [48.9547, 9.4375],
      zoom: 13
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = L.marker({ lat: 0, lng: 0 })
      .addTo(this.map)
  }

  // Use leaflet-gpx to draw a polyline on the map, including markers
  displayGPXTrack(gpxData: string): void {
    if (this.map) {
      // Delete (eventually) existing GPX track layer
      if (this.leafletGpx) {
        this.map.removeLayer(this.leafletGpx)
      }

      new L.GPX(gpxData, {
        async: true
      }).on('loaded', (e: L.LeafletEvent) => {
        this.leafletGpx = e.target as L.GPX;
        this.map?.fitBounds(this.leafletGpx.getBounds(), {
          paddingTopLeft: [10, 10],
          paddingBottomRight: [10, 10]
        });
      }).addTo(this.map);
    }
  }

  onFileSelected(event: Event): void {
    const inputElement = event?.target as HTMLInputElement
    if (inputElement) {
      const files = inputElement.files
      if (files) {
        this.toastrService.info(`File ${files[0].name} (${files[0].size} bytes)`)
        this.parseGpxFile(files[0])
      }
    }
  }

  private parseGpxFile(file: File): void {
    this.inProgress = true
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      this.inProgress = false
      const content = event.target?.result as string;
      this.toastrService.info(`File uploaded.`)

      // Remember the GPX track in the local browser storage
      this.storageService.storeItem('GpxTrack', content)
      this.toastrService.info(`File stored in browser storage for re-use.`)

      this.displayGPXTrack(content) // Use leaflet-gpx to draw a polyline on the map, including markers
      this.parseElevationFromGpxFile(content) // Addtionally to leaflet-gpx, get distance, elevation AND LatLng of points

      if (this.elevationPoints.length > 0) {
        this.toastrService.success(`GPX file parsed successfully.`)
      } else {
        this.toastrService.error(`Failed to parse the input file.`)
      }
    };

    reader.onerror = (error) => {
      this.inProgress = false
      console.error('Failed to load GPX file.', error);
      this.toastrService.error('Failed load the GPX file.')
    };

    reader.readAsText(file);
  }

  // Well, leaflet-gpx alread reads and provides elevation-by-distance of all track points,
  // but it (unfortunately) does not provide LatLng of these points. Need to have this
  // LatLngs of the points to draw a marker when the user moves the move over
  // the elevation profile. So this is kind of a re-implementation what leaflet-gpx does,
  // plus adding th LatLngs of the points.
  private parseElevationFromGpxFile(gpxData: string): void {

    const parser = new DOMParser();
    const xml = parser.parseFromString(gpxData, 'text/xml');

    let elevationPoints: ElevationPoint[] = []

    // Support "routes" (like leaflet-gpx by default)
    const routes = xml.getElementsByTagName('rte');
    for (const route of Array.from(routes)) {
      elevationPoints = elevationPoints.concat(this.parseSegment(route, 'rtept'))
    }

    // Support "tracks" (like leaflet-gpx by default)
    // Tracks are <trkpt> tags in one or more <trkseg> sections in each <trk>
    const tracks = xml.getElementsByTagName('trk');
    for (const track of Array.from(tracks)) {
      elevationPoints = elevationPoints.concat(this.parseSegment(track, 'trkpt'))
    }

    this.elevationPoints = elevationPoints
  }

  private parseSegment(xml: Element, tag: string): ElevationPoint[] {
    const elements = xml.getElementsByTagName(tag);
    if (!elements) return []

    const elevationPoints: ElevationPoint[] = []
    let currentDistance = 0
    let lastLl = undefined

    for (const element of Array.from(elements)) {
      const ll = new L.LatLng(parseFloat(element.getAttribute('lat')!), parseFloat(element.getAttribute('lon')!));
      const _ = element.getElementsByTagName('ele');
      if (_.length > 0) {
        ll.alt = parseFloat(_[0].textContent!);
      } else {
        // If the point doesn't have an <ele> tag, assume it has the same
        // elevation as the point before it (if it had one).
        if (lastLl) {
          ll.alt = lastLl.alt
        }
      }

      const dist_3d = lastLl ? this.dist3d(lastLl, ll) : 0;
      currentDistance += dist_3d

      elevationPoints.push({
        distance: currentDistance,
        latlng: ll
      })

      lastLl = ll
    }

    return elevationPoints
  }

  private dist2d(a: L.LatLng, b: L.LatLng) {
    const R = 6371000;
    const dLat = this.deg2rad(b.lat - a.lat);
    const dLon = this.deg2rad(b.lng - a.lng);
    const r = Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(a.lat)) *
      Math.cos(this.deg2rad(b.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(r), Math.sqrt(1 - r));
    const d = R * c;
    return d;
  }

  private dist3d(a: L.LatLng, b: L.LatLng): number {
    const planar = this.dist2d(a, b);
    const height = Math.abs(b.alt! - a.alt!);
    return Math.sqrt(Math.pow(planar, 2) + Math.pow(height, 2));
  }

  private deg2rad(deg: number): number {
    return deg * Math.PI / 180;
  }

  // As the array of elevation points is sorted by distance, use
  // a binary search algorithm to find the elevation point closest to a given distance
  private findClosestPointByDistance(targetDistance: number): L.LatLng {

    let low = 0;
    let high = this.elevationPoints.length - 1;
    let closestDistance: number = this.elevationPoints[0].distance;
    let closestLatLng: L.LatLng = this.elevationPoints[0].latlng;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const currentDistance: number = this.elevationPoints[mid].distance;
      const currentLatLng: L.LatLng = this.elevationPoints[mid].latlng;

      if (currentDistance === targetDistance) {
        return currentLatLng; // Exact match found
      }

      if (Math.abs(currentDistance - targetDistance) < Math.abs(closestDistance - targetDistance)) {
        closestDistance = currentDistance;
        closestLatLng = currentLatLng;
      }

      if (currentDistance < targetDistance) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return closestLatLng;
  }

  // Move a marker along the trace based on the position of the mouse in the
  // Elevation Profile component
  handlePositionChangeEvent(distance: number): void {
    // Update marker on
    if (this.elevationPoints.length > 0) {
      this.marker?.setLatLng(this.findClosestPointByDistance(distance))
    }
  }
}
