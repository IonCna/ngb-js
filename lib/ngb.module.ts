import angular from "angular";
import { NgbAlertModule } from "@/alert/ngb-alert.module"
import { NgbProgressbarModule } from "@/progressbar/ngb-progressbar.module"
import { NgbCollapseModule } from "@/collapse/ngb-collapse.module"
import { NgbAccordionModule } from "@/accordion/ngb-accordion.module"
import { NgbToastModule } from "@/toast/ngb-toast.module"

import { NgbConfig } from "@/ngb-config.service"
import { percentFilter } from "@/filters/percent.filter"
import { NgbAnimationFactory } from "@/ngb-animation.factory"

export const NgbModule = angular.module("ngb", [
    NgbAlertModule.name,
    NgbProgressbarModule.name,
    NgbCollapseModule.name,
    NgbAccordionModule.name,
    NgbToastModule.name
])

NgbModule.filter(percentFilter.$name, percentFilter)
NgbModule.service(NgbConfig.$name, NgbConfig)
NgbModule.factory(NgbAnimationFactory.$name, NgbAnimationFactory)