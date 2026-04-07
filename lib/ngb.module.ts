import angular from "angular";
import { NgbAlertModule } from "@/alert/ngb-alert.module"

export const NgbModule = angular.module("ngb", [
    NgbAlertModule.name
])

// NgbModule.filter(percentFilter.$name, percentFilter)
// NgbModule.service(NgbConfig.$name, NgbConfig)
// NgbModule.factory(NgbAnimationFactory.$name, NgbAnimationFactory)
// NgbModalModule.factory(NgbHostSynchronizerFactory.$name, NgbHostSynchronizerFactory)
