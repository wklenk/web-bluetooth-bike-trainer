import { Component } from '@angular/core';
import { InclinationIngestionService } from 'src/app/services/inclination-ingestion.service';

@Component({
  selector: 'app-inclination',
  template: `
    <ngx-gauge
        [value]="inclination"
        [min]="-20"
        [max]="20"
        [type]="'arch'"
        [thick]="10"
        [cap]="'round'"
        [label]="'Inclination'"
        [append]="'%'"
        [foregroundColor]="'#ff0000'"
        >
    </ngx-gauge>  
  `
})
export class InclinationComponent {

  inclination: number = 0

  constructor(private inclinationIngestionService: InclinationIngestionService) {}

  ngOnInit() {
    this.inclinationIngestionService.inclinationIngestionData$.subscribe((inclinationIngestionData) => {
      this.inclination = Math.round(inclinationIngestionData.inclination)
    });
  }
}
