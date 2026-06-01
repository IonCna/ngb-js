import { DemoCollapseComponent } from "@demo/features/demo-collapse/demo-collapse.component";
import angular from "angular";

export const DemoCollapseModule = angular.module("ngb.demo.collapse", []);
DemoCollapseModule.component(DemoCollapseComponent.$name, DemoCollapseComponent.$factory);
