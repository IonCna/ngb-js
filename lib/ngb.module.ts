import angular from "angular";
import { NgbAlertModule } from "@/alert/ngb-alert.module"
import { NgbProgressbarModule } from "@/progressbar/ngb-progressbar.module"
import { NgbCollapseModule } from "@/collapse/ngb-collapse.module"
import { NgbCarouselModule } from "@/carousel/ngb-carousel.module"
import { NgbToastModule } from "@/toast/ngb-toast.module"
import { NgbAccordionModule } from "@/accordion/ngb-accordion.module"

import { NgbConfig } from "@/ngb-config.service"
import { NgbContent } from "@/ngb-content.directive"

export const NgbModule = angular.module("ngb", [
    NgbAlertModule.name,
    NgbProgressbarModule.name,
    NgbCollapseModule.name,
    NgbCarouselModule.name,
    NgbToastModule.name,
    NgbAccordionModule.name
])

NgbModule.service(NgbConfig.$name, NgbConfig)
NgbModule.directive(NgbContent.$name, NgbContent.$factory)
