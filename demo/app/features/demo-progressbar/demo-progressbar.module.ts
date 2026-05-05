import angular from "angular"
import { DemoProgressbarComponent } from "@demo/features/demo-progressbar/demo-progressbar.component"

export const DemoProgressbarModule = angular.module("ngb.demo.progressbar", [])
DemoProgressbarModule.component(DemoProgressbarComponent.$name, DemoProgressbarComponent.$factory)
