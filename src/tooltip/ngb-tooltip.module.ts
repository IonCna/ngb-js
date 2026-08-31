import { NgbTooltip } from "@ngb/tooltip/ngb-tooltip.directive";
import { NgbTooltipConfig } from "@ngb/tooltip/ngb-tooltip-config.service";
import { NgbTooltipWindow } from "@ngb/tooltip/ngb-tooltip-window.component";
import angular, { type IModule } from "angular";
import { CommonModule } from "ngjs-core";

export const NgbTooltipModule: IModule = angular.module("ngb.tooltip", [CommonModule.name]);
export const NgbToolTipModule = NgbTooltipModule;

NgbTooltipModule.component(NgbTooltipWindow.$name, NgbTooltipWindow.$factory);
NgbTooltipModule.directive(NgbTooltip.$name, NgbTooltip.$factory);
NgbTooltipModule.service(NgbTooltipConfig.$name, NgbTooltipConfig);
