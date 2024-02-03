import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import { PointTuple } from 'leaflet';
import 'leaflet-gpx'; // Import the Leaflet GPX plugin
import { FitnessMachineService } from 'src/app/services/fitness-machine.service';

@Component({
  selector: 'app-altitude-profile',
  templateUrl: './altitude-profile.component.html',
  styleUrls: ['./altitude-profile.component.scss']
})
export class AltitudeProfileComponent implements OnInit, OnChanges {

  @Input() leafletGpx: L.GPX | undefined

  // Events the current distance index on the track based on the marker in this altitude profile
  @Output() distanceEvent = new EventEmitter<number>();

  pointTuples: PointTuple[] = []

  diagramWidth = 600
  diagramHeight = 200
  distanceDiff = 0
  minDistance = 0
  altitudeMin = 0
  altitudeMax = 0
  altitudeGain = 0
  altitudeLoss = 0
  mouseX = 0

  profilePolylineString = "" // For drawing a SVG polyline

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
  
      const minElevation = this.leafletGpx?.get_elevation_min()
      const maxElevation = this.leafletGpx?.get_elevation_max()
  
  
      const maxDistance = this.leafletGpx?.get_distance()
      
      if (minElevation && maxElevation && maxDistance) {
        const elevationDiff = maxElevation - minElevation
        this.distanceDiff = maxDistance - this.minDistance
  
        let firstPoint = true
        let currentPoint: PointTuple = [0, 0]
        this.leafletGpx?.get_elevation_data().forEach(elevationDataPoint => {
          let x = Math.round((elevationDataPoint[0] - this.minDistance) / this.distanceDiff * this.diagramWidth * 1000)
          let y = this.diagramHeight - Math.round((elevationDataPoint[1] - minElevation) / elevationDiff * this.diagramHeight)
          elevationDataPoints += `${x},${y} `

          currentPoint = [x, y]

          // Remember the start point of the track
          if (firstPoint) {
            this.addSimplifiedProfilePoint(currentPoint)          
            firstPoint = false
          }
        })
    
        this.profilePolylineString = elevationDataPoints

        // Remember the end point of the track
        this.addSimplifiedProfilePoint(currentPoint)
      }
    }
  }

  private addSimplifiedProfilePoint(newPoint: PointTuple): void {
     // Find the index to insert the new point
     let insertIndex = this.pointTuples.findIndex(pointTuple => newPoint[0] < pointTuple[0]);

     // If insertIndex is -1, it means the new point has the highest x-coordinate, so we push it to the end
     if (insertIndex === -1) {
       insertIndex = this.pointTuples.length;
     }
 
     // Insert the new point at the calculated index
     this.pointTuples.splice(insertIndex, 0, newPoint);
  }

  getSimplifiedProfilePolylineString(): string {
    let simplifiedProfilePolylineString = ''
    this.pointTuples.forEach(pointTuple => {
      simplifiedProfilePolylineString += `${pointTuple[0]},${pointTuple[1]} `
    })

    //console.log(simplifiedProfilePolylineString)
    return simplifiedProfilePolylineString
  }

  onMouseMove(event: MouseEvent): void {
    const svgElement = event.currentTarget as SVGSVGElement;
    const svgRect = svgElement.getBoundingClientRect();

    // Calculate mouse position relative to the SVG area
    this.mouseX = event.clientX - svgRect.left;

    this.distanceEvent.emit((this.mouseX / this.diagramWidth * this.distanceDiff) + this.minDistance)
  }

  onCanvasClick(event: MouseEvent): void {
    const svgElement = event.currentTarget as SVGSVGElement;
    const svgRect = svgElement.getBoundingClientRect();

    // Calculate mouse position relative to the SVG area
    let mouseX = event.clientX - svgRect.left;
    let mouseY = event.clientY - svgRect.top;

    this.addSimplifiedProfilePoint([mouseX, mouseY])
  }

  onCircleClick(index: number, event: MouseEvent): void {
    this.pointTuples.splice(index, 1); // Remove 1 element at the specified index
    event.stopPropagation()
  }
}
