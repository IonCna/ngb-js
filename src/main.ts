import { NgbModule } from "@ngb"
import { AppComponent } from "@demo/app.component"
import { DemoCarouselComponent } from "@demo/features/demo-carousel/demo-carousel.component"
import { DemoAlertComponent } from "@demo/features/demo-alert/demo-alert.component"
import { DemoProgressbarComponent } from "@demo/features/demo-progressbar/demo-progressbar.component"
import { DemoCollapseComponent } from "@demo/features/demo-collapse/demo-collapse.component"

import "../node_modules/bootstrap/dist/css/bootstrap.css"
import "./style.css"

import angular from "angular"
export const AppModule = angular.module("ngb.demo", [NgbModule.name]) 

AppModule.component(AppComponent.$name, AppComponent.$factory)
AppModule.component(DemoCarouselComponent.$name, DemoCarouselComponent.$factory)
AppModule.component(DemoAlertComponent.$name, DemoAlertComponent.$factory)
AppModule.component(DemoProgressbarComponent.$name, DemoProgressbarComponent.$factory)
AppModule.component(DemoCollapseComponent.$name, DemoCollapseComponent.$factory)
