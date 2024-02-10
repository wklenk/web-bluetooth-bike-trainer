import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import { Point } from 'leaflet';
import 'leaflet-gpx'; // Import the Leaflet GPX plugin
import { FitnessMachineService } from 'src/app/services/fitness-machine.service';

export type DistanceAndElevation = {
  distance: number // in m
  elevation: number // in m
}

@Component({
  selector: 'app-altitude-profile',
  templateUrl: './altitude-profile.component.html',
  styleUrls: ['./altitude-profile.component.scss']
})
export class AltitudeProfileComponent implements OnInit, OnChanges {

  @Input() leafletGpx: L.GPX | undefined

  // Events the current distance index on the track based on the marker in this altitude profile
  @Output() distanceEvent = new EventEmitter<number>();

  // Simplified altitude profile
  private simplifiedElevationData: DistanceAndElevation[] = []

  diagramWidth = 600
  diagramHeight = 200
  distanceDiff = 0
  elevationDiff = 0
  minDistance = 0
  minElevation = 0
  altitudeMin = 0
  altitudeMax = 0
  altitudeGain = 0
  altitudeLoss = 0
  mouseX = 0

  profilePolylineString = "" // For drawing a SVG polyline from GPX track
  simplifiedProfilePolylineString = "" // For drawing a SVG polyline from simplified GPX track
  simplifiedProfilePoints: Point[] = []

  constructor(private fitnessMachineService: FitnessMachineService) {}

  ngOnInit() {
    this.fitnessMachineService.indoorBikeData$.subscribe((indoorBikeData) => {
      this.mouseX = Math.round((indoorBikeData.totalDistance - this.minDistance) / this.distanceDiff * this.diagramWidth)
    });
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['leafletGpx']) {
      let elevationDataPoints = ""
  
      this.altitudeMin = Math.round(this.leafletGpx?.get_elevation_min() || 0)
      this.altitudeMax = Math.round(this.leafletGpx?.get_elevation_max() || 0)
      this.altitudeGain = Math.round(this.leafletGpx?.get_elevation_gain() || 0)
      this.altitudeLoss = Math.round(this.leafletGpx?.get_elevation_loss() || 0 )
  
      this.minElevation = this.leafletGpx?.get_elevation_min() || 0
      const maxElevation = this.leafletGpx?.get_elevation_max()
  
      const maxDistance = this.leafletGpx?.get_distance()
      
      if (this.minElevation && maxElevation && maxDistance) {
        this.elevationDiff = maxElevation - this.minElevation
        this.distanceDiff = maxDistance - this.minDistance
  
        let firstPoint = true
        let currentDistanceAndElevation: DistanceAndElevation = {
          distance: 0,
          elevation: 0
        }
        this.leafletGpx?.get_elevation_data().forEach(elevationDataPoint => {
          currentDistanceAndElevation = {
            distance: elevationDataPoint[0] * 1000, // from km (GPX) to m
            elevation: elevationDataPoint[1]
          }

          const p: Point = this.toPoint(currentDistanceAndElevation)
          elevationDataPoints += `${p.x},${p.y} `
 
          // Remember the start point of the track
          if (firstPoint) {
            this.addToSimplifiedElevationData(currentDistanceAndElevation)          
            firstPoint = false
          }
        })
    
        this.profilePolylineString = elevationDataPoints

        // Remember the end point of the track
        this.addToSimplifiedElevationData(currentDistanceAndElevation)
      }
    }
  }

  private addToSimplifiedElevationData(newPoint: DistanceAndElevation): void {
     // Find the index to insert the new point
     let insertIndex = this.simplifiedElevationData.findIndex(distanceAndElevation => newPoint.distance < distanceAndElevation.distance);

     // If insertIndex is -1, it means the new point has the highest x-coordinate, so we push it to the end
     if (insertIndex === -1) {
       insertIndex = this.simplifiedElevationData.length;
     }
 
     // Insert the new point at the calculated index
     this.simplifiedElevationData.splice(insertIndex, 0, newPoint);

     this.updateSimplifiedProfilePolylineString()
  }

  private updateSimplifiedProfilePolylineString(): void {
    this.simplifiedProfilePolylineString = ""
    this.simplifiedProfilePoints = []
    this.simplifiedElevationData.forEach(distanceAndElevation => {
      const p = this.toPoint(distanceAndElevation)
      this.simplifiedProfilePolylineString += `${p.x},${p.y} `
      this.simplifiedProfilePoints.push(p)
    })
  }

  onMouseMove(event: MouseEvent): void {
    const svgElement = event.currentTarget as SVGSVGElement;
    const svgRect = svgElement.getBoundingClientRect();

    // Calculate mouse position relative to the SVG area
    this.mouseX = event.clientX - svgRect.left;

    let distanceAndElevation = this.toDistanceAndElevation(new Point(this.mouseX, 0))

    this.distanceEvent.emit(distanceAndElevation.distance)
  }

  // Add a point to the simplified elevation profile data
  onCanvasClick(event: MouseEvent): void {
    const svgElement = event.currentTarget as SVGSVGElement;
    const svgRect = svgElement.getBoundingClientRect();

    // Calculate mouse position relative to the SVG area
    let mouseX = event.clientX - svgRect.left;
    let mouseY = event.clientY - svgRect.top;

    this.addToSimplifiedElevationData(
      this.toDistanceAndElevation(new Point(mouseX, mouseY))
    )
  }

  onCircleClick(index: number, event: MouseEvent): void {
    this.simplifiedElevationData.splice(index, 1); // Remove 1 element at the specified index
    event.stopPropagation()

    this.updateSimplifiedProfilePolylineString()
  }

  // Convert from screen coordinates to real world coordinates
  private toDistanceAndElevation(point: Point): DistanceAndElevation {
    return {
      distance: (point.x / this.diagramWidth * this.distanceDiff) + this.minDistance,
      elevation: ((this.diagramHeight - point.y) / this.diagramHeight * this.elevationDiff) + this.minElevation
    }
  }

  // Convert from real world coordinates to screen coordinates
  private toPoint(distanceAndElevation: DistanceAndElevation): Point {
    return new Point(
      Math.round((distanceAndElevation.distance - this.minDistance) / this.distanceDiff * this.diagramWidth),
      this.diagramHeight - Math.round((distanceAndElevation.elevation - this.minElevation) / this.elevationDiff * this.diagramHeight)
    )
  }
}
