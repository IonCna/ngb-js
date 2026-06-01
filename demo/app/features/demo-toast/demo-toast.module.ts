import { DemoToastComponent } from "@demo/features/demo-toast/demo-toast.component";
import angular from "angular";

export const DemoToastModule = angular.module("ngb.demo.toast", []);
DemoToastModule.component(DemoToastComponent.$name, DemoToastComponent.$factory);
