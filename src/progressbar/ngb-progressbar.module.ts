import angular from "angular";
import { NgbProgressbarConfig } from "@ngb/progressbar/ngb-progressbar-config.service"
import { NgbProgressbar } from "@ngb/progressbar/ngb-progressbar.component"
import { NgbProgressbarStacked } from "@ngb/progressbar/ngb-progressbar-stacked.component"
import { NgbProgressbarPercentFilter } from "@ngb/progressbar/ngb-progressbar-percent.filter"

export const NgbProgressbarModule = angular.module("ngb.progressbar", [])
NgbProgressbarModule.service(NgbProgressbarConfig.$name, NgbProgressbarConfig)
NgbProgressbarModule.component(NgbProgressbar.$name, NgbProgressbar.$factory)
NgbProgressbarModule.component(NgbProgressbarStacked.$name, NgbProgressbarStacked.$factory)
NgbProgressbarModule.filter(NgbProgressbarPercentFilter.$name, NgbProgressbarPercentFilter.$transform)
