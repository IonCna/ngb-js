import angular from "angular"
import { DemoDropdownComponent } from "@demo/features/demo-dropdown/demo-dropdown.component"

export const DemoDropdownModule = angular.module("ngb.demo.dropdown", [])
DemoDropdownModule.component(DemoDropdownComponent.$name, DemoDropdownComponent.$factory)
