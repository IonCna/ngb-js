import template from "@demo/features/demo-timepicker/demo-timepicker.component.html";
import type {NgbTimeStruct} from "@ngb/timepicker";
import type { IComponentOptions } from "angular";

export class DemoTimepickerComponent {
  basicTime: NgbTimeStruct = {hour: 13, minute: 30, second: 0};
  meridianTime: NgbTimeStruct = {hour: 13, minute: 30, second: 30};
  stepsTime: NgbTimeStruct = {hour: 13, minute: 30, second: 0};
  spinnersTime: NgbTimeStruct = {hour: 13, minute: 30, second: 0};
  readonlyTime: NgbTimeStruct = {hour: 13, minute: 30, second: 0};
  smallTime: NgbTimeStruct = {hour: 13, minute: 30, second: 0};
  mediumTime: NgbTimeStruct = {hour: 13, minute: 30, second: 0};
  largeTime: NgbTimeStruct = {hour: 13, minute: 30, second: 0};
  disabledTime: NgbTimeStruct = {hour: 13, minute: 30, second: 30};

  meridian = true;
  seconds = true;
  spinners = true;
  hourStep = 1;
  minuteStep = 15;
  secondStep = 30;
  disabled = false;

  toggleDisabled(): void {
    this.disabled = !this.disabled;
  }

  static get $name() {
    return "ngbDemoTimepicker";
  }

  static get $factory(): IComponentOptions {
    return {
      controller: DemoTimepickerComponent,
      controllerAs: "$",
      template,
    };
  }
}
