import angular from "angular";
import { NgbAccordionConfig } from "@/accordion/ngb-accordion-config.service"
import { NgbAccordionBody } from "@/accordion/ngb-accordion-body.directive"
import { NgbAccordionButton } from "@/accordion/ngb-accordion-button.directive"
import { NgbAccordionCollapse } from "@/accordion/ngb-accordion-collapse.directive"
import { NgbAccordionHeader } from "@/accordion/ngb-accordion-header.directive"
import { NgbAccordionItem } from "@/accordion/ngb-accordion-item.directive"
import { NgbAccordionToggle } from "@/accordion/ngb-accordion-toggle.directive"
import { NgbAccordion } from "@/accordion/ngb-accordion.directive"
import { NgbAccordionCounterService } from "@/accordion/ngb-accordion-counters.service"

import { NgbCollapseModule } from "@/collapse"

export const NgbAccordionModule = angular.module("ngb.accordion", [
    NgbCollapseModule.name
])

NgbAccordionModule.service(NgbAccordionConfig.$name, NgbAccordionConfig)
NgbAccordionModule.service(NgbAccordionCounterService.$name, NgbAccordionCounterService)

NgbAccordionModule.directive(NgbAccordionBody.$name, NgbAccordionBody.$factory)
NgbAccordionModule.directive(NgbAccordionButton.$name, NgbAccordionButton.$factory)
NgbAccordionModule.directive(NgbAccordionCollapse.$name, NgbAccordionCollapse.$factory)
NgbAccordionModule.directive(NgbAccordionHeader.$name, NgbAccordionHeader.$factory)
NgbAccordionModule.directive(NgbAccordionItem.$name, NgbAccordionItem.$factory)
NgbAccordionModule.directive(NgbAccordionToggle.$name, NgbAccordionToggle.$factory)
NgbAccordionModule.directive(NgbAccordion.$name, NgbAccordion.$factory)
