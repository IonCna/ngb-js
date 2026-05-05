import angular from "angular"
import { DemoTooltipComponent } from "@demo/features/demo-tooltip/demo-tooltip.component"

export const DemoTooltipModule = angular.module("ngb.demo.tooltip", [])
DemoTooltipModule.component(DemoTooltipComponent.$name, DemoTooltipComponent.$factory)
