import { DemoTimepickerComponent } from "@demo/features/demo-timepicker/demo-timepicker.component";
import { NgbTimepickerModule } from "@ngb/timepicker/ngb-timepicker.module";
import angular from "angular";

export const DemoTimepickerModule = angular.module("ngb.demo.timepicker", [NgbTimepickerModule.name]);
DemoTimepickerModule.component(DemoTimepickerComponent.$name, DemoTimepickerComponent.$factory);
