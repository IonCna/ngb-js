import { NgbModule } from "@/index"
import { AppComponent } from "@demo/app.component"
import { DemoCarouselComponent } from "@demo/features/demo-carousel/demo-carousel.component"

import "../node_modules/bootstrap/dist/css/bootstrap.css"
import "./style.css"

import angular from "angular"
export const AppModule = angular.module("ngb.demo", [NgbModule.name]) 

AppModule.component(AppComponent.$name, AppComponent.$factory)
AppModule.component(DemoCarouselComponent.$name, DemoCarouselComponent.$factory)