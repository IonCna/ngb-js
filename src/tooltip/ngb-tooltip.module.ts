import { NgbTooltip } from "@ngb/tooltip/ngb-tooltip.directive";
import { NgbTooltipConfig } from "@ngb/tooltip/ngb-tooltip-config.service";
import { NgbTooltipWindow } from "@ngb/tooltip/ngb-tooltip-window.component";
import angular from "angular";

export const NgbToolTipModule = angular.module("ngb.tooltip", []);

NgbToolTipModule.component(NgbTooltipWindow.$name, NgbTooltipWindow.$factory);
NgbToolTipModule.directive(NgbTooltip.$name, NgbTooltip.$factory);
NgbToolTipModule.service(NgbTooltipConfig.$name, NgbTooltipConfig);
