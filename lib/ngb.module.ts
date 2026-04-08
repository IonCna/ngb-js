import angular from "angular";
import { NgbAlertModule } from "@/alert/ngb-alert.module"
import { NgbProgressbarModule } from "@/progressbar/ngb-progressbar.module"
import { percentFilter } from "@/filters/percent.filter"

import { NgbConfig } from "@/ngb-config.service"

export const NgbModule = angular.module("ngb", [
    NgbAlertModule.name,
    NgbProgressbarModule.name
])

NgbModule.filter(percentFilter.$name, percentFilter)
NgbModule.service(NgbConfig.$name, NgbConfig)
