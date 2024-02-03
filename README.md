# Web Bluetooth Bike Trainer

Status: Work in progress

Started this repository as a christmas holiday project 2023/2024 to experimentally check out if a smart bike trainer (like [Wahoo Kickr](https://www.wahoofitness.com/devices/indoor-cycling/bike-trainers/kickr-buy)) an be controlled by a standalone web application, using the [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API) of the web browser.

**Disclaimer:** 
* Web Bluetooth might not be supported on all web browsers. To make sure it is enabled in Google Chrome, please follow these instructions: https://www.youtube.com/watch?v=LOmGqTSvoR4&t=1s
* Use on your own risk

## Functional requirements
The web app is intended to help me in an upcoming bike competition. It shall be able to **simulate** the race track with is elevations on the bike trainer.

* Import a GPX track (containing elevation information)
* Show the race track on a map
* Show the altitude profile
* Provide a little editor that allows to simplify the altitude profile with some straight lines
* Based on the slope of these straight lines, the web app shall control the resistance value of the bike trainer
* Start/Stop a ride on the imported GPX track
* Show current speed, cadence and power from bike trainer
* Show current time and slope
* Show current heart rate from a Bluetooth LE heartrate monitor

## Sources
The following sources of information were helpful:

* https://webbluetoothcg.github.io/web-bluetooth/
* https://github.com/WebBluetoothCG/demos?tab=readme-ov-file
* https://googlechrome.github.io/samples/web-bluetooth/index.html
* https://whatsonzwift.com/gpx-to-zwift-workout
* https://github.com/zacharyedwardbull/pycycling
* https://github.com/oesmith/gatt-xml/blob/master/org.bluetooth.characteristic.indoor_bike_data.xml

## Main dependencies

* Angular
* Angular Material
* https://leafletjs.com Leaflet
* https://github.com/mpetazzoni/leaflet-gpx GPX plugin for Leaflet

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

