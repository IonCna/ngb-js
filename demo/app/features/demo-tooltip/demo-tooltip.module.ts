import { DemoTooltipComponent } from "@demo/features/demo-tooltip/demo-tooltip.component";
import angular from "angular";

export const DemoTooltipModule = angular.module("ngb.demo.tooltip", []);
DemoTooltipModule.component(DemoTooltipComponent.$name, DemoTooltipComponent.$factory);
