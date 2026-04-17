import angular, { type IScope } from "angular";
import { NgbTooltip } from "./ngb-tooltip.directive";
import { NgbTooltipConfig } from "./ngb-tooltip-config.service";
import { NgbTooltipWindowComponent } from "./ngb-tooltip-window.component";
import type { Placement } from "@floating-ui/dom";

export const NgbToolTipModule = angular.module("ngb.tooltip", [])

NgbToolTipModule.component(NgbTooltipWindowComponent.$name, NgbTooltipWindowComponent.$factory)
NgbToolTipModule.directive(NgbTooltip.$name, NgbTooltip.$factory)
NgbToolTipModule.service(NgbTooltipConfig.$name, NgbTooltipConfig)

export interface NgbTooltipWindowOptions {
    animation: boolean
    container?: string | HTMLElement | JQLite
    placement?: Placement
    positionTarget?: JQLite
    tooltipClass?: string
    triggers?: string
}

export type NgbToolTipWindowScope = IScope & {
    innerHtml: JQLite
    options: NgbTooltipWindowOptions,
    referenceEl: JQLite
}
