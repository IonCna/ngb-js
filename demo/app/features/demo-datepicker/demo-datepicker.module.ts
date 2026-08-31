import { DemoDatepicker } from "@demo/features/demo-datepicker/demo-datepicker.component";
import { NgbDatepickerModule } from "@ngb/datepicker/ngb-datepicker.module";
import angular from "angular";

export const DemoDatepickerModule = angular.module("ngb.demo.datepicker", [NgbDatepickerModule.name]);

DemoDatepickerModule.component(DemoDatepicker.$name, DemoDatepicker.$factory);
