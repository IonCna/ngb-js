import angular from "angular"
import { DemoCollapseComponent } from "@demo/features/demo-collapse/demo-collapse.component"

export const DemoCollapseModule = angular.module("ngb.demo.collapse", [])
DemoCollapseModule.component(DemoCollapseComponent.$name, DemoCollapseComponent.$factory)
