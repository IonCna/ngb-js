import { DemoOffcanvasComponent } from "@demo/features/demo-offcanvas/demo-offcanvas.component";
import { DemoOffcanvasContentComponent } from "@demo/features/demo-offcanvas/demo-offcanvas-content.component";
import angular from "angular";

export const DemoOffcanvasModule = angular.module("ngb.demo.offcanvas", []);
DemoOffcanvasModule.component(DemoOffcanvasComponent.$name, DemoOffcanvasComponent.$factory);
DemoOffcanvasModule.component(DemoOffcanvasContentComponent.$name, DemoOffcanvasContentComponent.$factory);