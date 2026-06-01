import { DemoAlertComponent } from "@demo/features/demo-alert/demo-alert.component";
import angular from "angular";

export const DemoAlertModule = angular.module("ngb.demo.alert", []);
DemoAlertModule.component(DemoAlertComponent.$name, DemoAlertComponent.$factory);
