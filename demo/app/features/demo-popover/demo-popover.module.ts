import { DemoPopoverComponent } from "@demo/features/demo-popover/demo-popover.component";
import { NgbPopoverModule } from "@ngb/popover";
import angular from "angular";

export const DemoPopoverModule = angular.module("ngb.demo.popover", [NgbPopoverModule.name]);
DemoPopoverModule.component(DemoPopoverComponent.$name, DemoPopoverComponent.$factory);
