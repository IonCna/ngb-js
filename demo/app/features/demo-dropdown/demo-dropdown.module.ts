import { DemoDropdownComponent } from "@demo/features/demo-dropdown/demo-dropdown.component";
import angular from "angular";

export const DemoDropdownModule = angular.module("ngb.demo.dropdown", []);
DemoDropdownModule.component(DemoDropdownComponent.$name, DemoDropdownComponent.$factory);
