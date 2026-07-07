import { DemoScrollSpyComponent } from "@demo/features/demo-scrollspy/demo-scrollspy.component";
import angular from "angular";

export const DemoScrollSpyModule = angular.module("ngb.demo.scrollspy", []);
DemoScrollSpyModule.component(DemoScrollSpyComponent.$name, DemoScrollSpyComponent.$factory);
