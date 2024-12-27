import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import { Point } from 'leaflet';
import 'leaflet-gpx'; // Import the Leaflet GPX plugin
import { StorageService } from '../../services/storage.service';
import { FITNESS_MACHINE_SERVICE, FitnessMachineService } from '../../services/FitnessMachineService';
import { GradeProcessorService } from '../../services/grade-processor.service';

export interface DistanceAndElevation {
  distance: number // in m
  elevation: number // in m
}

@Component({
  selector: 'app-altitude-profile',
  standalone: true,
  imports: [],
  template: `
    <svg [attr.width]="svgWidth" [attr.height]="svgHeight" style="background-color: rgba(0, 0, 0, 0.1);"
        (mousemove)="onMouseMove($event)">

        <line [attr.x1]="cursorX" y1="0" [attr.x2]="cursorX" [attr.y2]="svgHeight" stroke="blue"></line>
        <text [attr.x]="cursorX + 3" y="20" fill="blue" font-size="16">⟷ {{cursorDistance}}m</text>
        <text [attr.x]="cursorX + 3" y="40" fill="blue" font-size="16">▲ {{cursorElevation}}m</text>

        <!-- <polyline [attr.points]="profilePolylineString" fill="none" stroke="black" stroke-width="5"></polyline> -->
        <polyline [attr.points]="reducedProfilePolylineString" fill="none" stroke="black" stroke-width="5"></polyline>

        <text [attr.x]="3"[attr.y]="svgHeight - 3" fill="black" font-weight="bold" font-size="16">⟷ {{totalDistance}}m ‖ ▲ {{altitudeMin}}m - {{altitudeMax}}m ‖ ↕ {{altitudeDiff}}m ‖ ↑ {{altitudeGain}}m ‖ ↓ {{altitudeLoss}}m</text>
    </svg>  
  `
})
export class AltitudeProfileComponent implements OnInit, OnChanges, AfterViewInit {

  @Input() leafletGpx: L.GPX | undefined

  @Input() isSimulationStarted = false

  // Emits the current distance index on the track based on the marker in this altitude profile
  @Output() positionChangeEvent = new EventEmitter<number>();

  cursorX = 0

  totalDistance = 0
  elevationDiff = 0
  minElevation = 0
  altitudeMin = 0
  altitudeMax = 0
  altitudeDiff = 0
  altitudeGain = 0
  altitudeLoss = 0

  cursorDistance = ""
  cursorElevation = ""

  reducedWaypoints: DistanceAndElevation[] = []
  reducedProfilePolylineString = "" // For drawing a SVG polyline from GPX track

  waypoints: DistanceAndElevation[] = []
  profilePolylineString = "" // For drawing a SVG polyline from GPX track

  svgWidth = 0
  svgHeight = 0

  constructor(
    @Inject(FITNESS_MACHINE_SERVICE) private fitnessMachineService: FitnessMachineService,
    private gradeProcessor: GradeProcessorService,
    private storageService: StorageService, 
    private elementRef: ElementRef) {
  }

  ngOnInit() {
    // Update the cursor position once the simulation has started.
    this.fitnessMachineService.indoorBikeData$.subscribe(indoorBikeData => {
      const p = this.toScreenCoordinates({
        distance: indoorBikeData.calculatedTotalDistance,
        elevation: 0
      })
      this.cursorX = p.x

      this.cursorDistance = `${indoorBikeData.calculatedTotalDistance.toFixed(0)}`
      const elevationAtDistance = this.findElevationByDistance(indoorBikeData.calculatedTotalDistance)
      this.cursorElevation = `${elevationAtDistance}`
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['leafletGpx']) {
      this.altitudeMin = Math.round(this.leafletGpx?.get_elevation_min() || 0)
      this.altitudeMax = Math.round(this.leafletGpx?.get_elevation_max() || 0)
      this.altitudeDiff = this.altitudeMax - this.altitudeMin
      this.altitudeGain = Math.round(this.leafletGpx?.get_elevation_gain() || 0)
      this.altitudeLoss = Math.round(this.leafletGpx?.get_elevation_loss() || 0)

      this.minElevation = this.leafletGpx?.get_elevation_min() || 0
      const maxElevation = this.leafletGpx?.get_elevation_max()

      const maxDistance = this.leafletGpx?.get_distance()

      if (this.minElevation && maxElevation && maxDistance) {
        this.elevationDiff = maxElevation - this.minElevation
        this.totalDistance = Math.round(maxDistance)

        this.waypoints = []
        let currentDistanceAndElevation: DistanceAndElevation = {
          distance: 0,
          elevation: 0
        }
        let lastDistanceAndElevation: DistanceAndElevation = {
          distance: 0,
          elevation: 0
        }

        this.leafletGpx?.get_elevation_data().forEach(elevationDataPoint => {
          currentDistanceAndElevation = {
            distance: Math.round(elevationDataPoint[0] * 1000 * 10) / 10, // from km (GPX) to m
            elevation: Math.round(elevationDataPoint[1] * 10) / 10
          }

          // Drop duplicate points
          if (currentDistanceAndElevation.distance !== lastDistanceAndElevation.distance
            && currentDistanceAndElevation.elevation !== lastDistanceAndElevation.elevation) {
            this.waypoints.push(currentDistanceAndElevation)
          }

          lastDistanceAndElevation = currentDistanceAndElevation
        })

        // Convert all the waypoints to a polyline string in screen coordinates.
        // this.updateWaypointPolylineString()
        this.reduceWaypoints()

        // Give the reduced waypoints to the Grade processor to enable it
        // to calculate the grade based on the simplified elevation profile
        // and control the indoor bike simulation.
        this.gradeProcessor.setReducedWaypoints(this.reducedWaypoints)
      }
    }
  }

  // Create a SVG polyline string from the waypoints, using screen coordinates.
  private updateWaypointPolylineString(): void {
    let polylineString = ""

    let p: Point
    this.waypoints.forEach(waypoint => {
      p = this.toScreenCoordinates(waypoint)
      polylineString = polylineString.concat(`${p.x},${p.y} `)
    })

    this.profilePolylineString = polylineString
  }

  private updateReducedWaypointPolylineString(): void {
    let polylineString = ""

    let p: Point
    this.reducedWaypoints.forEach(waypoint => {
      p = this.toScreenCoordinates(waypoint)
      polylineString = polylineString.concat(`${p.x},${p.y} `)
    })

    this.reducedProfilePolylineString = polylineString
  }

  // Convert the waypoints to a reduced set of equidistant waypoints, this way also
  // ensuring that grade changes do not happen too frequently.
  private reduceWaypoints(): void {
    const fixedDistanceInterval = 50 // m

    let distance = fixedDistanceInterval
    let weightedElevationAverage = 0
    while (distance < this.totalDistance) {

      weightedElevationAverage = this.calculateWeightedAverageElevationWithMaxDistance(distance, fixedDistanceInterval)
      this.reducedWaypoints.push({
        distance: distance,
        elevation: weightedElevationAverage
      })

      distance += fixedDistanceInterval
    }

    this.updateReducedWaypointPolylineString()
  }

  ngAfterViewInit(): void {
    this.updatePosition();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.updatePosition()

    // The scaling of the altitude profile panel has changed, screen coordinates need to be recalculated
    // this.updateWaypointPolylineString()
    this.updateReducedWaypointPolylineString()
  }

  updatePosition(): void {
    const rect = this.elementRef.nativeElement.getBoundingClientRect()
    this.svgWidth = rect.width
    this.svgHeight = rect.height
  }

  private findElevationByDistance(distance: number): number {
    const elevationData = this.leafletGpx?.get_elevation_data()
    if (!elevationData) return 0;

    let left = 0;
    let right = elevationData.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const midDistance = elevationData[mid][0] * 1000; // Convert km to m

      if (midDistance === distance) {
        return elevationData[mid][1]; // Return elevation
      } else if (midDistance < distance) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    // If exact distance is not found, return the closest elevation
    return elevationData[left] ? elevationData[left][1] : elevationData[right][1];
  }

  // Find the index of the waypoint closest to the given distance
  private findWaypointIndexClosestToDistance(distance: number, left: number, right: number): number {
    if (left < 0 || right >= this.waypoints.length || left > right) {
      console.error("left: " + left + " right: " + right + " waypoints.length: " + this.waypoints.length)
      throw new Error("Invalid indices")
    }

    while (left <= right && left < this.waypoints.length && right >= 0) {
      const mid = Math.floor((left + right) / 2)
      const midDistance = this.waypoints[mid].distance

      if (midDistance === distance) {
        return mid
      } else if (midDistance < distance) {
        left = mid + 1
      } else {
        right = mid - 1
      }
    }

    return left < this.waypoints.length ? left : this.waypoints.length - 1
  }

  private calculateWeightedAverageElevationWithMaxDistance(distance: number, maxDistance: number): number {
    const waypointIndexClosestToDistance =
      this.findWaypointIndexClosestToDistance(distance, 0, this.waypoints.length - 1)

    const waypointIndexRight =
      this.findWaypointIndexClosestToDistance(distance + maxDistance, waypointIndexClosestToDistance, this.waypoints.length - 1)

    const waypointIndexLeft =
      this.findWaypointIndexClosestToDistance(distance - maxDistance, 0, waypointIndexClosestToDistance)

    return this.calculateWeightedAverageElevation(waypointIndexClosestToDistance, waypointIndexLeft, waypointIndexRight)
  }

  private calculateWeightedAverageElevation(
    originIndex: number,
    distantLeftIndex: number,
    distantRightIndex: number
  ): number {
    if (originIndex < 0 || distantRightIndex >= this.waypoints.length || originIndex > distantRightIndex) {
      console.log("originIndex: " + originIndex + " distantIndex: " + distantRightIndex + " waypoints.length: " + this.waypoints.length)
      throw new Error("Invalid right indices");
    }

    if (originIndex < 0 || distantLeftIndex < 0 || originIndex < distantLeftIndex) {
      console.log("originIndex: " + originIndex + " distantIndex: " + distantLeftIndex + " waypoints.length: " + this.waypoints.length)
      throw new Error("Invalid left indices");
    }

    let totalWeight = 0;
    let weightedSum = 0;

    for (let i = distantLeftIndex; i <= distantRightIndex; i++) {
      const distanceDifference = Math.abs(this.waypoints[i].distance - this.waypoints[originIndex].distance);
      const weight = 1 / (distanceDifference + 1); // Adding 1 to avoid division by zero

      totalWeight += weight;
      weightedSum += this.waypoints[i].elevation * weight;
    }

    return weightedSum / totalWeight;
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isSimulationStarted) {
      const svgElement = event.currentTarget as SVGSVGElement;
      const svgRect = svgElement.getBoundingClientRect();

      // Calculate mouse position relative to the SVG area
      this.cursorX = event.clientX - svgRect.left;

      const distanceAndElevation = this.toDistanceAndElevation(new Point(this.cursorX, 0))
      this.cursorDistance = `${distanceAndElevation.distance.toFixed(0)}`
      const elevationAtDistance = this.findElevationByDistance(distanceAndElevation.distance)
      this.cursorElevation = `${elevationAtDistance}`

      this.positionChangeEvent.emit(distanceAndElevation.distance)
    }
  }

  // Convert from screen coordinates to real world coordinates
  private toDistanceAndElevation(point: Point): DistanceAndElevation {
    return {
      distance: (point.x / this.svgWidth * this.totalDistance),
      elevation: ((this.svgHeight - point.y) / this.svgHeight * this.elevationDiff) + this.minElevation
    }
  }

  // Convert from real world coordinates to screen coordinates
  private toScreenCoordinates(distanceAndElevation: DistanceAndElevation): Point {
    const height = this.svgHeight - 20 // Some padding at top and bottom
    const yOffset = 10

    return new Point(
      Math.round(distanceAndElevation.distance / this.totalDistance * this.svgWidth),
      height - Math.round((distanceAndElevation.elevation - this.minElevation) / this.elevationDiff * height) + yOffset
    )
  }
}
