import { DemoProgressbarComponent } from "@demo/features/demo-progressbar/demo-progressbar.component";
import angular from "angular";

export const DemoProgressbarModule = angular.module("ngb.demo.progressbar", []);
DemoProgressbarModule.component(DemoProgressbarComponent.$name, DemoProgressbarComponent.$factory);
