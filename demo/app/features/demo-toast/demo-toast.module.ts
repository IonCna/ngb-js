import angular from "angular"
import { DemoToastComponent } from "@demo/features/demo-toast/demo-toast.component"

export const DemoToastModule = angular.module("ngb.demo.toast", [])
DemoToastModule.component(DemoToastComponent.$name, DemoToastComponent.$factory)
