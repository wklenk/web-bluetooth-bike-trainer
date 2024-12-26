/// <reference types="web-bluetooth" />

import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import * as L from 'leaflet';
import { GPX } from 'leaflet';
import 'leaflet-gpx'; // Import the Leaflet GPX plugin

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';

import { ElapsedTimeComponent } from './components/elapsed-time/elapsed-time.component';
import { DistanceComponent } from './components/distance/distance.component';
import { GradeComponent } from './components/grade/grade.component';
import { HeartRateComponent } from './components/heart-rate/heart-rate.component';
import { CadenceComponent } from './components/cadence/cadence.component';
import { SpeedComponent } from './components/speed/speed.component';
import { PowerComponent } from './components/power/power.component';
import { AltitudeProfileComponent } from './components/altitude-profile/altitude-profile.component';
import { StorageService } from './services/storage.service';
import { GradeIngestionService } from './services/grade-ingestion.service';
import { FitnessMachineService } from './services/fitness-machine.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';

export type ElevationPoint = {
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
    
    MatButtonModule,
    MatProgressBarModule,
    MatToolbarModule,

    ElapsedTimeComponent, 
    DistanceComponent, 
    GradeComponent, 
    HeartRateComponent, 
    CadenceComponent, 
    SpeedComponent, 
    PowerComponent, 
    AltitudeProfileComponent 
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnInit {

  title = 'Web Bluetooth Bike Trainer';
  inProgress = false

  leafletGpx: L.GPX | undefined

  selectedFile: File | null = null

  isSimulationStarted = false

  private map: L.Map | undefined
  private marker: L.Marker | undefined
  private elevationPoints: ElevationPoint[] = []

  constructor(
    private toastrService: ToastrService,
    private storageService: StorageService,
    private gradeIngestionService: GradeIngestionService,
    private fitnessMachineService: FitnessMachineService
  ) { }

  startSimulation(): void {
    if (!this.isSimulationStarted) {
      this.inProgress = true
      this.gradeIngestionService.connect()
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
          this.gradeIngestionService.disconnect()
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
    this.gradeIngestionService.gradeIngestionData$.subscribe((gradeIngestionData) => {
      // Update marker on track
      this.handlePositionChangeEvent(gradeIngestionData.calculatedTotalDistance)
    });
  }

  ngAfterViewInit(): void {
    this.initMap();

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
      }).on('loaded', (e: any) => {
        this.leafletGpx = e.target as GPX;
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
        this.selectedFile = files[0]
      }
    }
  }

  parseGpxFile(): void {
    this.inProgress = true
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      this.inProgress = false
      const content = event.target?.result as string;

      this.storageService.storeItem('GpxTrack', content)

      this.displayGPXTrack(content) // Use leaflet-gpx to draw a polyline on the map, including markers
      this.parseElevationFromGpxFile(content) // Addtionally to leaflet-gpx, get distance, elevation AND LatLng of points
    };

    reader.onerror = (error) => {
      this.inProgress = false
      console.error('Error reading the file:', error);
    };

    if (this.selectedFile) {
      reader.readAsText(this.selectedFile);
    }
  }

  // Well, leaflet-gpx alread reads and provides elevation-by-distance of all track points,
  // but it (unfortunately) does not provide LatLng of these points. Need to have this
  // LatLngs of the points to draw a marker when the user moves the move over
  // the altitude profile. So this is kind of a re-implementation what leaflet-gpx does,
  // plus adding th LatLngs of the points.
  private parseElevationFromGpxFile(gpxData: string): void {

    const parser = new DOMParser();
    const xml = parser.parseFromString(gpxData, 'text/xml');

    let elevationPoints: ElevationPoint[] = []

    // Support "routes" (like leaflet-gpx by default)
    var routes = xml.getElementsByTagName('rte');
    for (var i = 0; i < routes.length; i++) {
      elevationPoints = elevationPoints.concat(this.parseSegment(routes[i], 'rtept'))
    }

    // Support "tracks" (like leaflet-gpx by default)
    // Tracks are <trkpt> tags in one or more <trkseg> sections in each <trk>
    var tracks = xml.getElementsByTagName('trk');
    for (i = 0; i < tracks.length; i++) {
      elevationPoints = elevationPoints.concat(this.parseSegment(tracks[i], 'trkpt'));
    }

    this.elevationPoints = elevationPoints
  }

  private parseSegment(xml: Element, tag: string): ElevationPoint[] {
    var el = xml.getElementsByTagName(tag);
    if (!el) return []

    let elevationPoints: ElevationPoint[] = []
    var currentDistance = 0
    var lastLl = undefined
    for (var i = 0; i < el.length; i++) {
      const ll = new L.LatLng(parseFloat(el[i].getAttribute('lat')!), parseFloat(el[i].getAttribute('lon')!));

      var _ = el[i].getElementsByTagName('ele');
      if (_.length > 0) {
        ll.alt = parseFloat(_[0].textContent!);
      } else {
        // If the point doesn't have an <ele> tag, assume it has the same
        // elevation as the point before it (if it had one).
        if (lastLl) {
          ll.alt = lastLl.alt
        }
      }

      let dist_3d = lastLl ? this.dist3d(lastLl, ll) : 0;
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
    var R = 6371000;
    var dLat = this.deg2rad(b.lat - a.lat);
    var dLon = this.deg2rad(b.lng - a.lng);
    var r = Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(a.lat)) *
      Math.cos(this.deg2rad(b.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(r), Math.sqrt(1 - r));
    var d = R * c;
    return d;
  }

  private dist3d(a: L.LatLng, b: L.LatLng): number {
    var planar = this.dist2d(a, b);
    var height = Math.abs(b.alt! - a.alt!);
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
      let mid = Math.floor((low + high) / 2);
      let currentDistance: number = this.elevationPoints[mid].distance;
      let currentLatLng: L.LatLng = this.elevationPoints[mid].latlng;

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
  // altitude profile component
  handlePositionChangeEvent(distance: number): void {
    // Update marker on
    if (this.elevationPoints.length > 0) {
      this.marker?.setLatLng(this.findClosestPointByDistance(distance))
    }
  }
}
