import angular from "angular";
import { DemoCarouselComponent } from "@demo/features/demo-carousel/demo-carousel.component";

export const DemoCarouselModule = angular.module("ngb.demo.carousel", []);
DemoCarouselModule.component(
	DemoCarouselComponent.$name,
	DemoCarouselComponent.$factory,
);
