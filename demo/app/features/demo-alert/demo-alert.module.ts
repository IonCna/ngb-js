import angular from "angular";
import { DemoAlertComponent } from "@demo/features/demo-alert/demo-alert.component";

export const DemoAlertModule = angular.module("ngb.demo.alert", []);
DemoAlertModule.component(
	DemoAlertComponent.$name,
	DemoAlertComponent.$factory,
);
