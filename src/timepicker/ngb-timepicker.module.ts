import { NgbTimepicker } from "@ngb/timepicker/ngb-timepicker.component";
import angular from "angular";

export const NgbTimepickerModule = angular.module("ngb.timepicker", []);
NgbTimepickerModule.component(NgbTimepicker.$name, NgbTimepicker.$factory);
