import angular from "angular"
import { NgbModule } from "@ngb"
import "node_modules/bootstrap/dist/css/bootstrap.css"
import "./style.css"

import { NgbDemoAppComponent } from "./app/ngb-demo-app.component"
import { AlertDemoComponent } from "./features/alert/alert-demo.component"
import { ProgressbarDemoComponent } from "./features/progressbar/progressbar-demo.component"
import { CollapseDemoComponent } from "./features/collapse/collapse-demo.component"
import { AccordionDemoComponent } from "./features/accordion/accordion-demo.component"
import { ToastDemoComponent } from "./features/toast/toast-demo.component"
import { ModalDemoComponent } from "./features/modal/modal-demo.component"
import { ModalDemoContentComponent } from "./features/modal/modal-demo-content.component"
import { DropdownDemoComponent } from "./features/dropdown/dropdown-demo.component"
import { NavDemoComponent } from "./features/nav/nav-demo.component"
import { TooltipDemoComponent } from "./features/tooltip/tooltip-demo.component"
import { CarouselDemoComponent } from "./features/carousel/carousel-demo.component"

const app = angular.module("ngb.demo", [NgbModule.name])

app.component(NgbDemoAppComponent.$name, NgbDemoAppComponent.$factory)
app.component(AlertDemoComponent.$name, AlertDemoComponent.$factory)
app.component(ProgressbarDemoComponent.$name, ProgressbarDemoComponent.$factory)
app.component(CollapseDemoComponent.$name, CollapseDemoComponent.$factory)
app.component(AccordionDemoComponent.$name, AccordionDemoComponent.$factory)
app.component(ToastDemoComponent.$name, ToastDemoComponent.$factory)
app.component(ModalDemoComponent.$name, ModalDemoComponent.$factory)
app.component(ModalDemoContentComponent.$name, ModalDemoContentComponent.$factory)
app.component(DropdownDemoComponent.$name, DropdownDemoComponent.$factory)
app.component(NavDemoComponent.$name, NavDemoComponent.$factory)
app.component(TooltipDemoComponent.$name, TooltipDemoComponent.$factory)
app.component(CarouselDemoComponent.$name, CarouselDemoComponent.$factory)
