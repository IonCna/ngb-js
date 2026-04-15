import angular from "angular";
import { NgbAlertModule } from "@/alert/ngb-alert.module"
import { NgbProgressbarModule } from "@/progressbar/ngb-progressbar.module"
import { NgbCollapseModule } from "@/collapse/ngb-collapse.module"
import { NgbCarouselModule } from "@/carousel/ngb-carousel.module"
import { NgbToastModule } from "@/toast/ngb-toast.module"
import { NgbAccordionModule } from "@/accordion/ngb-accordion.module"
import { NgbModalModule } from "@/modal/ngb-modal.module"
import { NgbDropdownModule } from "@/dropdown/ngb-dropdown.module"

import { NgbConfig } from "@/ngb-config.service"
import { NgbContent } from "@/ngb-content.directive"
import { NgbScrollbar } from "@/ngb-scrollbar.service"

import { NgbRTL } from "@/utils/rtl.service"
import { LiveService } from "@/utils/accessibility/live.service"
import { ARIA_LIVE_DELAY } from "@/utils/accessibility/live.constant"

export const NgbModule = angular.module("ngb", [
    NgbAlertModule.name,
    NgbProgressbarModule.name,
    NgbCollapseModule.name,
    NgbCarouselModule.name,
    NgbToastModule.name,
    NgbAccordionModule.name,
    NgbModalModule.name,
    NgbDropdownModule.name
])

NgbModule.service(NgbConfig.$name, NgbConfig)
NgbModule.directive(NgbContent.$name, NgbContent.$factory)
NgbModule.service(NgbScrollbar.$name, NgbScrollbar)

NgbModule.service(LiveService.$name, LiveService)
NgbModule.service(NgbRTL.$name, NgbRTL)
NgbModule.constant(ARIA_LIVE_DELAY.$name, ARIA_LIVE_DELAY.$value)