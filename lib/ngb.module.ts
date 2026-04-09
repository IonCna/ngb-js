import angular from "angular";
import { NgbAlertModule } from "@/alert/ngb-alert.module"
import { NgbProgressbarModule } from "@/progressbar/ngb-progressbar.module"
import { NgbCollapseModule } from "@/collapse/ngb-collapse.module"
import { NgbCarouselModule } from "@/carousel/ngb-carousel.module"

import { NgbConfig } from "@/ngb-config.service"

export const NgbModule = angular.module("ngb", [
    NgbAlertModule.name,
    NgbProgressbarModule.name,
    NgbCollapseModule.name,
    NgbCarouselModule.name
])

NgbModule.service(NgbConfig.$name, NgbConfig)
