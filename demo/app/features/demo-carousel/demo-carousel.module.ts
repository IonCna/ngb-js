import { DemoCarouselComponent } from "@demo/features/demo-carousel/demo-carousel.component";
import angular from "angular";

export const DemoCarouselModule = angular.module("ngb.demo.carousel", []);
DemoCarouselModule.component(DemoCarouselComponent.$name, DemoCarouselComponent.$factory);
