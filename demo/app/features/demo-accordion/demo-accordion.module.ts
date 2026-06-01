import { DemoAccordionComponent } from "@demo/features/demo-accordion/demo-accordion.component";
import angular from "angular";

export const DemoAccordionModule = angular.module("ngb.demo.accordion", []);
DemoAccordionModule.component(
	DemoAccordionComponent.$name,
	DemoAccordionComponent.$factory,
);
