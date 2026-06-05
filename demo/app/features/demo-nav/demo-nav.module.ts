import { DemoNavComponent } from "@demo/features/demo-nav/demo-nav.component";
import angular from "angular";

export const DemoNavModule = angular.module("ngb.demo.nav", []);
DemoNavModule.component(DemoNavComponent.$name, DemoNavComponent.$factory);