import { Component, Input } from '@angular/core';
import { FitnessMachineService } from 'src/app/services/fitness-machine.service';

@Component({
  selector: 'app-elapsed-time',
  templateUrl: './elapsed-time.component.html',
  styleUrls: ['./elapsed-time.component.scss']
})
export class ElapsedTimeComponent {
  @Input() elapsedTime: number = 0;

  constructor() {}
}
