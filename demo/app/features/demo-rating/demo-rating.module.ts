import { DemoRatingComponent } from "@demo/features/demo-rating/demo-rating.component";
import angular from "angular";

export const DemoRatingModule = angular.module("ngb.demo.rating", []);
DemoRatingModule.component(DemoRatingComponent.$name, DemoRatingComponent.$factory);
