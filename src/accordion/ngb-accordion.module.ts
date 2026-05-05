import angular from "angular";
import { NgbAccordionConfig } from "@ngb/accordion/ngb-accordion-config.service"
import { NgbAccordionBody } from "@ngb/accordion/ngb-accordion-body.directive"
import { NgbAccordionButton } from "@ngb/accordion/ngb-accordion-button.directive"
import { NgbAccordionCollapse } from "@ngb/accordion/ngb-accordion-collapse.directive"
import { NgbAccordionHeader } from "@ngb/accordion/ngb-accordion-header.directive"
import { NgbAccordionItem } from "@ngb/accordion/ngb-accordion-item.directive"
import { NgbAccordionToggle } from "@ngb/accordion/ngb-accordion-toggle.directive"
import { NgbAccordion } from "@ngb/accordion/ngb-accordion.directive"

import { NgbCollapseModule } from "@ngb/collapse"

export const NgbAccordionModule = angular.module("ngb.accordion", [
    NgbCollapseModule.name
])

NgbAccordionModule.service(NgbAccordionConfig.$name, NgbAccordionConfig)

NgbAccordionModule.directive(NgbAccordionBody.$name, NgbAccordionBody.$factory)
NgbAccordionModule.directive(NgbAccordionButton.$name, NgbAccordionButton.$factory)
NgbAccordionModule.directive(NgbAccordionCollapse.$name, NgbAccordionCollapse.$factory)
NgbAccordionModule.directive(NgbAccordionHeader.$name, NgbAccordionHeader.$factory)
NgbAccordionModule.directive(NgbAccordionItem.$name, NgbAccordionItem.$factory)
NgbAccordionModule.directive(NgbAccordionToggle.$name, NgbAccordionToggle.$factory)
NgbAccordionModule.directive(NgbAccordion.$name, NgbAccordion.$factory)
